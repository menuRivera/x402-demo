import {
  getSerializableSignedActionSchema,
  PayDataSchema,
} from "@evvm/evvm-js";
import {
  invalidPaymentResponse,
  LocalFacilitator,
  parseHeader,
  paymentRequiredResponse,
} from "@evvm/x402";
import { SettleResponse } from "@x402/core/types";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  // include only /protected route
  const url = event.node.req.url;
  const signer = await useSigner();
  const facilitator = new LocalFacilitator(signer);

  const protectedRoute = url && url.startsWith("/protected");

  if (!protectedRoute) return;

  const method = event.method;
  if (method === "OPTIONS") return;

  // verify it has a valid payment attached
  const paymentHeader = event.headers.get("PAYMENT-SIGNATURE");
  if (!paymentHeader)
    return paymentRequiredResponse([
      {
        scheme: "evvm",
        network: "eip155:11155111", // sepolia
        amount: "1000000000000000",
        asset: "0x0000000000000000000000000000000000000001",
        payTo: config.receiver,
        maxTimeoutSeconds: 300,
        extra: {
          coreContractAddress: config.evvmCoreAddress,
        },
      },
    ]);

  const paymentPayload = parseHeader(paymentHeader);

  if (!paymentPayload) return invalidPaymentResponse("Invalid payment header");

  const { success, data: signedAction } = getSerializableSignedActionSchema(
    PayDataSchema,
  ).safeParse(paymentPayload.payload);
  if (!success) return invalidPaymentResponse("Invalid signed action payload");

  const valid = await facilitator.verifyPaySignature(signedAction);
  if (!valid) return invalidPaymentResponse("Invalid signature");

  const txHash = await facilitator.settlePayment(signedAction);
  if (!txHash) return invalidPaymentResponse("Settlement failed");

  const settleResponse: SettleResponse = {
    success: true,
    payer: signedAction.data.from,
    transaction: txHash,
    network: paymentPayload.accepted.network as `${string}:${string}`,
  };

  const jsonString = JSON.stringify(settleResponse);
  const base64Payload = Buffer.from(jsonString).toString("base64");

  appendHeader(event, "PAYMENT-RESPONSE", base64Payload);

  return;
});
