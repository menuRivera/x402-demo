import { useEffect, useMemo, useState } from "react";
import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import "./App.css";
import {
  EVVM,
  type IPayData,
  type ISerializableSignedAction,
} from "@evvm/evvm-js";
import { useEvvmSigner } from "./hooks/useEvvmSigner";

const protectedUrl = import.meta.env.VITE_PROTECTED_URL;

function App() {
  const { open } = useAppKit();
  const { isConnected } = useAccount();
  const { signer, status: signerStatus } = useEvvmSigner();
  const [payment, setPayment] =
    useState<ISerializableSignedAction<IPayData> | null>(null);
  const [status, setStatus] = useState("idle");
  const [responseText, setResponseText] = useState<string | null>(null);
  const randomNonce = () => {
    const buffer = new Uint32Array(2);
    crypto.getRandomValues(buffer);
    return (BigInt(buffer[0]) << 32n) | BigInt(buffer[1]);
  };

  const [nonce, setNonce] = useState(randomNonce);

  useEffect(() => {
    fetchProtected();
  }, []);

  type X402PaymentRequest = {
    contractAddress: `0x${string}`;
    chainId: number;
    evvmId?: string;
    to: `0x${string}` | string;
    tokenAddress: `0x${string}`;
    amount: string | number;
  };

  const parseAcceptHeader = (value: string): X402PaymentRequest => {
    const trimmed = value.trim();

    if (trimmed.startsWith("{")) {
      return JSON.parse(trimmed) as X402PaymentRequest;
    }

    const match = trimmed.match(/request=([^;]+)/i);
    if (!match) {
      throw new Error("x402 accept header missing request payload");
    }

    const encoded = match[1].trim().replace(/^"|"$/g, "");
    const json = decodeBase64Url(encoded);
    return JSON.parse(json) as X402PaymentRequest;
  };

  const decodeBase64Url = (value: string) => {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = (4 - (padded.length % 4)) % 4;
    const normalized = `${padded}${"=".repeat(padLength)}`;
    return atob(normalized);
  };

  const acceptMock = useMemo(() => {
    const mock: X402PaymentRequest = {
      contractAddress: "0x0000000000000000000000000000000000000000",
      chainId: 11155111,
      evvmId: "1",
      to: "0x0000000000000000000000000000000000000000",
      tokenAddress: "0x0000000000000000000000000000000000000000",
      amount: "1",
    };
    const json = JSON.stringify(mock);
    const encoded = btoa(json)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
    return `application/x402+json; request=${encoded}`;
  }, []);

  const fetchProtected = async () => {
    try {
      if (!protectedUrl) {
        throw new Error("no protectedUrl defined");
      }

      setStatus("loading");
      const headers = new Headers();
      if (payment) headers.set("payment-signature", JSON.stringify(payment));

      const raw = await fetch(protectedUrl, { headers });
      if (raw.status == 402) {
        setStatus("payment-required");
        await open();
        if (!signer) {
          setStatus("wallet-missing");
          return;
        }

        const acceptHeader = raw.headers.get("accept") ?? acceptMock;
        const request = parseAcceptHeader(acceptHeader);
        const evvm = new EVVM({
          signer,
          address: request.contractAddress,
          chainId: request.chainId,
          evvmId: request.evvmId ? BigInt(request.evvmId) : undefined,
        });

        const signedAction = await evvm.pay({
          to: request.to,
          tokenAddress: request.tokenAddress,
          amount: BigInt(request.amount),
          priorityFee: 0n,
          nonce,
          priorityFlag: true,
        });

        const serialized = signedAction.toJSON();
        setPayment(serialized);
        setStatus("signed");

        const retryHeaders = new Headers();
        retryHeaders.set("payment-signature", JSON.stringify(serialized));

        const retry = await fetch(protectedUrl, { headers: retryHeaders });

        const retryText = await retry.text();
        if (retry.ok) {
          setResponseText(
            `Payment successful. The blockchain elves are pleased.\n\n${retryText}`,
          );
          setStatus("paid");
        } else {
          setResponseText(retryText);
          setStatus(`retry-${retry.status}`);
        }
        setNonce(randomNonce);
        return;
      }

      setResponseText(await raw.text());
      setStatus(raw.ok ? "ok" : `error-${raw.status}`);
    } catch (err) {
      setStatus("error");
      setResponseText(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <>
      <h1>x402 + EVVM</h1>
      <p>Status: {status}</p>
      <p>Connected: {isConnected ? "yes" : "no"}</p>
      <p>Signer: {signerStatus}</p>
      {responseText ? <pre>{responseText}</pre> : null}
      <button onClick={fetchProtected}>Retry</button>
      <pre>{payment && JSON.stringify(payment)}</pre>
    </>
  );
}

export default App;
