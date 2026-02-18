import { IPayData, ISerializableSignedAction } from "@evvm/evvm-js";

export interface IEvvmPaymentSignature {
  payer: `0x${string}`;
  signature: ISerializableSignedAction<IPayData>; // SignedAction<IPayData>
}

export interface IEvvmPaymentRequired {
  scheme: "evvm";
  network: string; // CAIP-2 format, e.g. "eip155:8453"
  maxAmountRequired: string;
  asset: `0x${string}`;
  payTo: `0x${string}`;
  maxTimeoutSeconds: number;
  resource: string;
  description?: string;
  mimeType?: string;
  contractAddress: `0x${string}`;
  evvmId?: string;
}

// {
//   "accepts": [
//     {
//       "scheme": "evvm",
//       "network": "eip155:8453",
//       "maxAmountRequired": "200",
//       "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
//       "payTo": "0xa2477E16dCB42E2AD80f03FE97D7F1a1646cd1c0",
//       "maxTimeoutSeconds": 60,
//       "resource": "https://api.example.com/data",
//       "contractAddress": "0xYourEvvmContract...",
//       "evvmId": 777
//     }
//   ],
//   "x402Version": 2
// }
