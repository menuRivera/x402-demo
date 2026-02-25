import { useEffect, useState } from "react";
import { useEVVM } from "./useEVVM";
import type { IPaymentRequiredPayload } from "../types/payment-required-payload.types";
import type { HexString } from "@evvm/evvm-js";
import type { IPaymentPayload } from "../types/payment-payload.types";

type Status = "ready" | "payment-required" | "signature-ready" | "success";

export const useX402 = (url: string) => {
  const { core, signer } = useEVVM();
  // base64 encoded signature payload
  const [signature, setSignature] = useState<string | null>(null);
  const [paymentRequiredPayload, setPaymentRequiredPayload] =
    useState<IPaymentRequiredPayload | null>(null);
  const [status, setStatus] = useState<Status>("ready");
  const [content, setContent] = useState<any>();

  useEffect(() => {
    if (!paymentRequiredPayload) fetchProtectedAsset();
  }, [signature]);

  useEffect(() => {
    if (paymentRequiredPayload) signPayment();
  }, [paymentRequiredPayload, core, signer]);

  const fetchProtectedAsset = async () => {
    const headers = new Headers();
    if (signature) {
      headers.set("PAYMENT-SIGNATURE", signature);
    }

    const raw = await fetch(url, {
      headers,
    });

    if (raw.status == 402) {
      setStatus("payment-required");
      const paymentRequiredHeader = raw.headers.get("PAYMENT-REQUIRED");
      if (!paymentRequiredHeader) throw new Error("No PAYMENT-REQUIRED header");

      const paymentRequiredDecoded = Buffer.from(
        paymentRequiredHeader,
      ).toString("utf-8");

      try {
        const _paymentPayload = JSON.parse(
          paymentRequiredDecoded,
        ) as IPaymentRequiredPayload;
        setPaymentRequiredPayload(_paymentPayload);
      } catch (error) {
        console.error(error);
      }
    } else if (raw.status == 200) {
      const res = await raw.json();
      setStatus("success");
      setContent(res);
    }
  };

  const signPayment = async () => {
    if (!paymentRequiredPayload || !core || !signer) return;

    const required = paymentRequiredPayload.offers[0];

    const nonce = await core.getSyncNonce();

    const paySignedAction = await core.pay({
      toAddress: required.payTo as HexString,
      amount: BigInt(required.amount),
      tokenAddress: required.asset,
      nonce,
      priorityFee: 0n,
      senderExecutor: required.extra.executor,
      isAsyncExec: false,
    });

    const paymentPayload: IPaymentPayload = {
      x402Version: 2,
      accepted: required,
      payload: paySignedAction.toJSON(),
    };

    const encoded = Buffer.from(JSON.stringify(paymentPayload)).toString(
      "base64",
    );

    setPaymentRequiredPayload(null);
    setSignature(encoded);
    setStatus("signature-ready");
  };

  return {
    status,
    content,
  };
};
