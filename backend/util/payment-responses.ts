import { config } from "config";
import { IExactEvvmSchema } from "types/evvm-schema.types";

const mateToken = "0x0000000000000000000000000000000000000001";

const defaultOffer: IExactEvvmSchema = {
  scheme: "evvm",
  network: `eip155:1`,
  amount: "10000",
  asset: mateToken,
  payTo: config.receiver,
  maxTimeoutSeconds: 30,
  extra: {
    coreContractAddress: config.evvmCoreAddress,
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

  return new Response("Payment Required", { headers, status: 402 });
};

/**
 * Returned when an invalid response is received
 */
export const invalidPaymentResponse = (reason: string): Response => {
  return new Response(`Payment Invalid: ${reason}`, { status: 400 });
};
