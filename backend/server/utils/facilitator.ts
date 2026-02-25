import { execute } from "@evvm/evvm-js";
import {
  IPaymentPayload,
  isPaymentPayload,
} from "../types/payment-payload.types";

/**
 * Verifies the payment can be executed (check balances, signatures, etc)
 */
export const verifyPayment = async (
  paymentSignature: string,
): Promise<IPaymentPayload | null> => {
  // decode header (it's a base64 encoded string)
  const decodedString = Buffer.from(paymentSignature, "base64").toString(
    "utf-8",
  );

  // assert it has the correct schema
  let payload = null;
  try {
    payload = JSON.parse(decodedString) as IPaymentPayload;
  } catch (error) {
    console.error("Failed to parse payment payload");
    return null;
  }

  if (!isPaymentPayload(payload)) return null;

  const isValidSignature = await verifySignature(payload.payload);
  if (!isValidSignature) return null;
  return payload;
};

/**
 * Executes the evvm transaction, returns true for successfull execution, false otherwise
 */
export const settlePayment = async (
  payload: IPaymentPayload,
): Promise<string | null> => {
  try {
    const signer = await useSigner();
    const txHash = await execute(signer, payload.payload);
    return txHash;
  } catch (error) {
    console.error("Failed to settle payment");
    console.error(error);
    return null;
  }
};
