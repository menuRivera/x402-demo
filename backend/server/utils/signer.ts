import { createSignerWithViem, HexString } from "@evvm/evvm-js";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

export const useSigner = async () => {
  const config = useRuntimeConfig();
  const account = privateKeyToAccount(config.executorPrivateKey as HexString);
  const client = createWalletClient({
    account,
    chain: sepolia,
    transport: http(),
  });
  const signer = await createSignerWithViem(client);

  return signer;
};
