import { useEffect, useState } from "react";
import type { ISigner } from "@evvm/evvm-js";
import { createSignerWithViem } from "@evvm/evvm-js";
import { useWalletClient } from "wagmi";

type SignerStatus = "idle" | "loading" | "ready" | "error";

export const useEvvmSigner = () => {
  const { data: walletClient } = useWalletClient();
  const [signer, setSigner] = useState<ISigner | null>(null);
  const [status, setStatus] = useState<SignerStatus>("idle");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (!walletClient) {
        setSigner(null);
        setStatus("idle");
        setError(null);
        return;
      }

      setStatus("loading");
      setError(null);

      try {
        //@ts-ignore
        const nextSigner = await createSignerWithViem(walletClient);
        if (cancelled) return;
        setSigner(nextSigner);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setSigner(null);
        setStatus("error");
        setError(
          err instanceof Error ? err : new Error("Failed to init signer"),
        );
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, [walletClient]);

  return { signer, status, error };
};
