import { Request, Response, NextFunction } from "express";
import {
  IEvvmPaymentRequired,
  IEvvmPaymentSignature,
} from "../types/evvm-402.type";
import { executePayment } from "../util/executePayment";

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
      network: "eip155:11155111",
      evvmId: "777",
      contractAddress: "0x0000000000000000000000000000000000000000",
      maxAmountRequired: "200",
      asset: "0x0000000000000000000000000000000000000000", // mate token
      payTo: "0xa2477E16dCB42E2AD80f03FE97D7F1a1646cd1c0", // random
      maxTimeoutSeconds: 60,
      resource: "https://localhost:5000/protected",
    };
    res.set("accepts", JSON.stringify([ paymentPayload ]));
    // return 402 payment required
    return res.status(402).send("payment required");
  }

  try {
    const paymentSignature = JSON.parse(payment) as IEvvmPaymentSignature;
    if (!paymentSignature || !paymentSignature.signature) throw new Error();
    // further assert paymentSignature.signature is indeed of type ISerializableSignature<IPayData>

    // verify and execute payment
    const hash = await executePayment(paymentSignature.signature);
    if (!hash) throw new Error("invalid_signature");

    res.set("PAYMENT-RESPONSE", JSON.stringify({}));
  } catch (error) {
    return res.status(402).send(error);
  }
  // if success, run next()
  next();
};
