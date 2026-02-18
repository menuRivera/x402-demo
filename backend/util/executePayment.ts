import {
  createSignerWithViem,
  execute,
  IPayData,
  ISerializableSignedAction,
} from "@evvm/evvm-js";
import { privateKeyToAccount } from "viem/accounts";

export const executePayment = async (
  payment: ISerializableSignedAction<IPayData>,
): Promise<`0x${string}` | null> => {
  // create signer
  const walletClient = privateKeyToAccount(
    process.env.PRIVATE_KEY as `0x${string}`,
  );
  //@ts-ignore
  const signer = await createSignerWithViem(walletClient);

  const response = await execute(signer, payment);
  return response;
};
