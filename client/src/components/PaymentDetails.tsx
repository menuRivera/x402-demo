import type { PaymentDetails as PaymentDetailsType } from "../hooks/useX402";

interface PaymentDetailsProps {
  details: PaymentDetailsType;
}

export function PaymentDetails({ details }: PaymentDetailsProps) {
  return (
    <div className="border border-zinc-700 rounded-lg p-4 w-full max-w-sm">
      <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
        Payment Required
      </h3>
      <div className="space-y-2 font-mono text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-500">Amount</span>
          <span className="text-emerald-400">
            {details.amount} {details.token}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">To</span>
          <span className="text-zinc-300">{details.recipient}</span>
        </div>
      </div>
    </div>
  );
}
