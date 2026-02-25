import { createSignerWithViem, execute, HexString } from "@evvm/evvm-js";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
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
    const asJson = JSON.parse(decodedString) as IPaymentPayload;
    payload = asJson;
  } catch (error) {
    console.error("Failed to parse payment payload");
    return null;
  }

  if (!isPaymentPayload(payload)) return null;

  // todo: verify actual signature validity
  return payload;
};

/**
 * Executes the evvm transaction, returns true for successfull execution, false otherwise
 */
export const settlePayment = async (
  payload: IPaymentPayload,
): Promise<string | null> => {
  const config = useRuntimeConfig();
  const account = privateKeyToAccount(config.executorPrivateKey as HexString);
  const client = createWalletClient({
    account,
    chain: sepolia,
    transport: http(),
  });
  try {
    const signer = await createSignerWithViem(client);
    const txHash = await execute(signer, payload.payload);
    return txHash;
  } catch (error) {
    console.error("Failed to settle payment");
    console.error(error);
    return null;
  }
};
