import { Request, Response, NextFunction } from "express";

// default 402 payment required payload "exact"
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
// note: maybe include here all information related with the payed asset
interface IEvvmPaymentSignature {
  payer: `0x${string}`;
  signature: `0x${string}`; // SignedAction<IPayData>
}
// IA prop
interface IEvvmPaymentRequired {
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

export const paymentRequired = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const payment = req.get("PAYMENT-SIGNATURE");
  if (!payment) {
    // send accept header with evvm scheme
    const paymentPayload: IEvvmPaymentRequired = {
      scheme: "evvm",
      network: "eip155:8453", // replace with ethereum sepolia
      evvmId: "777",
      contractAddress: "0x0000000000000000000000000000000000000000",
      maxAmountRequired: "200",
      asset: "0x0000000000000000000000000000000000000000", // mate token
      payTo: "0xa2477E16dCB42E2AD80f03FE97D7F1a1646cd1c0",
      maxTimeoutSeconds: 60,
      resource: "https://api.example.com/data",
    };
    res.set("PAYMENT-REQUIRED", JSON.stringify(paymentPayload));
    // return 402 payment required
    return res.status(402).send("payment required");
  }
  try {
    const paymentSignature = JSON.parse(payment);
	if(paymentSignature) return next()
  } catch (error) {
	  console.error(error)
  }

  // else, payment provided, verify payment
  // execute it

  // if success, run next()
  next();
};
