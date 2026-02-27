import { useEffect, useState, useCallback } from "react";
import { useEVVM } from "./useEVVM";
import type { IPaymentRequiredPayload } from "../types/payment-required-payload.types";
import type { HexString } from "@evvm/evvm-js";
import type { IPaymentPayload } from "../types/payment-payload.types";

export type Status =
  | "idle"
  | "fetching"
  | "payment-required"
  | "signing"
  | "success"
  | "error";

export interface PaymentDetails {
  amount: string;
  token: string;
  recipient: string;
  network: string;
  maxTimeout: number;
}

export const useX402 = () => {
  const { core, signer } = useEVVM();
  const [signature, setSignature] = useState<string | null>(null);
  const [paymentRequiredPayload, setPaymentRequiredPayload] =
    useState<IPaymentRequiredPayload | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [content, setContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null,
  );
  const [currentUrl, setCurrentUrl] = useState<string>("");

  useEffect(() => {
    if (signature && currentUrl) {
      const submitPayment = async () => {
        setStatus("fetching");
        const headers = new Headers();
        headers.set("PAYMENT-SIGNATURE", signature);

        const raw = await fetch(currentUrl, { headers });

        if (raw.status === 200) {
          const res = await raw.json();
          setStatus("success");
          setContent(res);
        } else {
          setError(`Payment failed: ${raw.status}`);
          setStatus("error");
        }
      };
      submitPayment();
    }
  }, [signature, currentUrl]);

  useEffect(() => {
    if (paymentRequiredPayload && core && signer) {
      signPayment();
    }
  }, [paymentRequiredPayload, core, signer]);

  const fetchProtectedAsset = useCallback(async (url: string) => {
    setCurrentUrl(url);
    setStatus("fetching");
    setError(null);
    setContent(null);
    setPaymentDetails(null);
    setSignature(null);
    setPaymentRequiredPayload(null);

    const raw = await fetch(url);

    if (raw.status === 402) {
      setStatus("payment-required");
      const paymentRequiredHeader = raw.headers.get("PAYMENT-REQUIRED");
      if (!paymentRequiredHeader) {
        setError("No PAYMENT-REQUIRED header");
        setStatus("error");
        return;
      }

      const paymentRequiredDecoded = atob(paymentRequiredHeader);

      try {
        const _paymentPayload = JSON.parse(
          paymentRequiredDecoded,
        ) as IPaymentRequiredPayload;
        setPaymentRequiredPayload(_paymentPayload);

        const required = _paymentPayload.offers[0];
        setPaymentDetails({
          amount: (Number(required.amount) / 1e18).toFixed(1),
          token: "MATE",
          recipient: `${required.payTo.slice(0, 6)}...${required.payTo.slice(-4)}`,
          network: required.network,
          maxTimeout: required.maxTimeoutSeconds,
        });
      } catch (err) {
        setError("Failed to parse payment required response");
        setStatus("error");
      }
    } else if (raw.status === 200) {
      const res = await raw.json();
      setStatus("success");
      setContent(res);
    } else {
      setError(`Unexpected status: ${raw.status}`);
      setStatus("error");
    }
  }, []);

  const signPayment = async () => {
    if (!paymentRequiredPayload || !core || !signer) {
      if (paymentRequiredPayload && !core) {
        setError("EVVM not initialized. Check VITE_EVVM_CONTRACT_ADDRESS");
        setStatus("error");
      }
      return;
    }

    setStatus("signing");

    try {
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

      const encoded = btoa(JSON.stringify(paymentPayload));

      setPaymentRequiredPayload(null);
      setSignature(encoded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment signing failed");
      setStatus("error");
    }
  };

  return {
    status,
    content,
    error,
    paymentDetails,
    fetchProtectedAsset,
  };
};
