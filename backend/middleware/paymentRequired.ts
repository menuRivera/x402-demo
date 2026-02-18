import { Request, Response, NextFunction } from "express";
import { ethers } from "ethers";

// default 402 payment required payload
// {
//   "accepts": [
//     {
//       "scheme": "exact",
//       "network": "eip155:8453",
//       "maxAmountRequired": "200",
//       "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
//       "payTo": "0xa2477E16dCB42E2AD80f03FE97D7F1a1646cd1c0",
//       "maxTimeoutSeconds": 60,
//       "description": "Get weather data",
//       "mimeType": "application/json",
//       "resource": "https://api.example.com/weather"
//     }
//   ],
//   "x402Version": 2
// }
//
// payment settlement response
// {
//   "payer": "0xBuyerAddress...",
//   "transaction": "0xTransactionHash..."
// }
// IA prop
type EvvmPaymentRequired = {
  // === Standard x402 fields ===
  scheme: "evvm"; // Custom scheme identifier
  network: string; // CAIP-2 format, e.g. "eip155:8453"
  maxAmountRequired: string; // Atomic units (like exact scheme)
  asset: `0x${string}`; // Token address (maps to your tokenAddress)
  payTo: `0x${string}`; // Recipient (maps to your "to")
  maxTimeoutSeconds: number; // Standard timeout
  resource: string; // Resource URL
  description?: string; // Human-readable description
  mimeType?: string; // Response MIME type

  // === EVVM-specific fields ===
  contractAddress: `0x${string}`; // EVVM contract address
  evvmId?: string; // Optional EVVM identifier
};
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
//       "evvmId": "optional-evvm-id"
//     }
//   ],
//   "x402Version": 2
// }

export const paymentRequired = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const payment = req.get("PAYMENT-SIGNATURE");
  if (!payment) {
    // return 402 payment required
    req.statusCode = 402;
  }
  next();
};
