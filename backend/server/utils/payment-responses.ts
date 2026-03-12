import { HexString } from "@evvm/evvm-js";
import { SettleResponse } from "@x402/core/types";
import { IEvvmSchema } from "server/types";

const mateToken = "0x0000000000000000000000000000000000000001";

const config = useRuntimeConfig();

const defaultOffer: IEvvmSchema = {
  scheme: "evvm",
  network: `eip155:11155111`, // sepolia
  amount: "100000000000000000",
  asset: mateToken,
  payTo: config.receiver,
  maxTimeoutSeconds: 30,
  extra: {
    coreContractAddress: config.evvmCoreAddress as HexString,
  },
};

/**
 * Creates the 402 payment required response, with headers, amounts and
 * everything else needed, returns the actual response (this should go directly to
 * the user)
 */
export const paymentRequiredResponse = (): Response => {
  const jsonString = JSON.stringify({
    offers: [defaultOffer],
  });
  const base64Payload = Buffer.from(jsonString).toString("base64");

  const headers = new Headers();
  headers.set("PAYMENT-REQUIRED", base64Payload);
  headers.set("Access-Control-Expose-Headers", "PAYMENT-REQUIRED"); // Vital for CORS
  headers.set("Content-Type", "application/json");

  console.log("Payment required");

  return new Response("Payment Required", { headers, status: 402 });
};

/**
 * Returned when an invalid response is received
 */
export const invalidPaymentResponse = (reason: string): Response => {
  const settleResponse: SettleResponse = {
    success: false,
    errorMessage: "Invalid Payment",
    errorReason: reason,
    transaction: "",
    network: ":",
  };

  const jsonString = JSON.stringify(settleResponse);
  const base64Payload = Buffer.from(jsonString).toString("base64");

  const headers = new Headers();
  headers.set("PAYMENT-RESPONSE", base64Payload);

  console.log("Payment invalid");
  return new Response(`Payment Invalid: ${reason}`, { status: 400, headers });
};
