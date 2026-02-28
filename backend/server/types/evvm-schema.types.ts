import { HexString } from "@evvm/evvm-js";
import { PaymentRequirements } from "@x402/core/types";

export interface IExactEvvmSchema extends PaymentRequirements {
  scheme: "evvm";
  network: `eip155:${number}`;
  amount: string;
  asset: HexString;
  payTo: string;
  maxTimeoutSeconds: number;
  /**
   * Custom metadata for successful evvm signature construction
   */
  extra: {
    coreContractAddress: HexString;
    evvmId?: number;
    executor?: HexString;
  };
}

// core.pay() params
//
// toAddress = zeroAddress,
// toIdentity = "",
// tokenAddress,
// amount,
// priorityFee,
// senderExecutor = zeroAddress,
// nonce,
// isAsyncExec,

// {
//     "scheme": "exact",
//     "network": "eip155:84532",
//     "amount": "10000",
//     "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
//     "payTo": "0x209693Bc6afc0C5328bA36FaF03C514EF312287C",
//     "maxTimeoutSeconds": 60,
//     "extra": {
//       "assetTransferMethod": "eip3009",
//       "name": "USDC",
//       "version": "2"
//     }
// }
