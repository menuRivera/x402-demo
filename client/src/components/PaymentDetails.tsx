import type { PaymentDetails as PaymentDetailsType } from "../hooks/useX402";

interface PaymentDetailsProps {
  details: PaymentDetailsType;
}

function formatNetwork(network: string): string {
  if (network.startsWith("eip155:")) {
    const chainId = network.replace("eip155:", "");
    const chainNames: Record<string, string> = {
      "1": "Ethereum",
      "8453": "Base",
      "42161": "Arbitrum",
      "10": "Optimism",
      "137": "Polygon",
      "56": "BSC",
      "43114": "Avalanche",
    };
    return chainNames[chainId] || `Chain ${chainId}`;
  }
  return network;
}

function formatTimeout(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export function PaymentDetails({ details }: PaymentDetailsProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 w-full max-w-sm shadow-sm">
      <h3 className="text-xs uppercase tracking-widest text-zinc-400 mb-4">
        Payment Required
      </h3>
      <div className="space-y-3 font-mono text-sm">
        <div className="flex justify-between items-center py-1 border-b border-zinc-100">
          <span className="text-zinc-500">Amount</span>
          <span className="text-zinc-800 font-medium">
            {details.amount} {details.token}
          </span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-zinc-100">
          <span className="text-zinc-500">To</span>
          <span className="text-zinc-600">{details.recipient}</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-zinc-100">
          <span className="text-zinc-500">Network</span>
          <span className="text-zinc-600">{formatNetwork(details.network)}</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="text-zinc-500">Timeout</span>
          <span className="text-zinc-600">{formatTimeout(details.maxTimeout)}</span>
        </div>
      </div>
    </div>
  );
}
