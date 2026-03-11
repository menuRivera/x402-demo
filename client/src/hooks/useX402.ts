import { useCallback, useEffect, useState } from "react";
import { useEVVM } from "./useEVVM";
import type { IPaymentRequiredPayload } from "../types/payment-required-payload.types";
import type { HexString } from "@evvm/evvm-js";
import type { IPaymentPayload } from "../types/payment-payload.types";
import { getRandomBigInt } from "../util/random";

export type Status =
  | "idle"
  | "fetching"
  | "payment-required"
  | "signing"
  | "fetching-with-signature"
  | "success"
  | "error";

export interface PaymentDetails {
  amount: string;
  token: string;
  recipient: string;
  network: string;
  maxTimeout: number;
}

export const useX402 = (url: string) => {
  const { core, signer, setCoreAddress } = useEVVM();
  const [signature, setSignature] = useState<string | null>(null);
  const [paymentRequiredPayload, setPaymentRequiredPayload] =
    useState<IPaymentRequiredPayload | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [content, setContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null,
  );

  useEffect(() => {
    // call fetchProtectedAsset automatically when signature is defined
    // (don't call fetchProtectedAsset upon mounting because that's going
    // to be triggered by the user manually)
    if (signature) fetchProtectedAsset();
  }, [signature]);

  useEffect(() => {
    // create payment signature when requirement and toolset defined
    signPayment();
  }, [paymentRequiredPayload, core, signer]);

  const fetchProtectedAsset = useCallback(async () => {
    const headers = new Headers();

    if (signature) {
      setStatus("fetching-with-signature");
      headers.set("PAYMENT-SIGNATURE", signature);
    } else {
      setStatus("fetching");
    }

    const raw = await fetch(url, { headers });

    switch (raw.status) {
      case 200:
        setStatus("success");
        const res = await raw.json();
        setContent(res);
        setSignature(null);
        break;
      case 402:
        setStatus("payment-required");
        const paymentRequiredHeader = raw.headers.get("PAYMENT-REQUIRED");
        if (!paymentRequiredHeader) {
          setStatus("error");
          setError("No PAYMENT-REQUIRED header");
          return;
        }

        try {
          // decode payment required header
          const paymentRequiredDecoded = atob(paymentRequiredHeader);
          const _paymentPayload = JSON.parse(
            paymentRequiredDecoded,
          ) as IPaymentRequiredPayload;
          setPaymentRequiredPayload(_paymentPayload);

          const required = _paymentPayload.offers[0];

          if (required.scheme !== "evvm") {
            setStatus("error");
            setError(
              `Invalid scheme received. Expected 'evvm', received '${required.scheme}'`,
            );
            return;
          }

          setCoreAddress(required.extra.coreContractAddress);
          setPaymentDetails({
            amount: (Number(required.amount) / 1e18).toFixed(1),
            token: required.asset,
            recipient: `${required.payTo.slice(0, 6)}...${required.payTo.slice(-4)}`,
            network: required.network,
            maxTimeout: required.maxTimeoutSeconds,
          });
        } catch (err) {
          setError("Failed to parse payment required response");
          setStatus("error");
        }
        break;
      default:
        const msg = await raw.text();
        setError(`${raw.status} ${msg}`);
        setStatus("error");
    }
  }, [signature]);

  const signPayment = async () => {
    if (signature) return;
    if (!paymentRequiredPayload || !core || !signer) {
      return;
    }

    setStatus("signing");

    try {
      const required = paymentRequiredPayload.offers[0];

      const paySignedAction = await core.pay({
        toAddress: required.payTo as HexString,
        amount: BigInt(required.amount),
        tokenAddress: required.asset,
        nonce: getRandomBigInt(),
        priorityFee: 0n,
        senderExecutor: required.extra.originExecutor,
        isAsyncExec: true,
      });

      const paymentPayload: IPaymentPayload = {
        x402Version: 2,
        accepted: required,
        payload: paySignedAction.toJSON(),
      };

      const encoded = btoa(JSON.stringify(paymentPayload));

      setSignature(encoded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment signing failed");
      setStatus("error");
    }
  };

  const reset = () => {
    console.log("reset");
    setStatus("idle");
    setSignature(null);
    setPaymentDetails(null);
    setPaymentRequiredPayload(null);
    setCoreAddress(null);
    setContent(null);
  };

  return {
    status,
    content,
    error,
    paymentDetails,
    fetchProtectedAsset,
    reset,
  };
};
