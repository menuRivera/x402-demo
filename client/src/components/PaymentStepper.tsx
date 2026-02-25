import type { Status } from "../hooks/useX402";

interface PaymentStepperProps {
  status: Status;
}

const steps = [
  { key: "fetching", label: "Fetch" },
  { key: "payment-required", label: "Payment" },
  { key: "signing", label: "Sign" },
  { key: "success", label: "Done" },
] as const;

export function PaymentStepper({ status }: PaymentStepperProps) {
  const getStepIndex = (s: Status): number => {
    switch (s) {
      case "fetching":
        return 0;
      case "payment-required":
        return 1;
      case "signing":
        return 2;
      case "success":
        return 3;
      case "error":
        return -1;
      default:
        return -1;
    }
  };

  const currentIndex = getStepIndex(status);
  const isError = status === "error";

  if (status === "idle") return null;

  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono
                  transition-all duration-300
                  ${isCompleted ? "bg-emerald-500 text-zinc-900" : ""}
                  ${isActive ? "bg-emerald-400 text-zinc-900 animate-pulse" : ""}
                  ${isPending ? "bg-zinc-700 text-zinc-500" : ""}
                  ${isError && index === currentIndex ? "bg-red-500 text-white" : ""}
                `}
              >
                {isCompleted ? "✓" : isActive ? "●" : index + 1}
              </div>
              <span
                className={`
                  mt-2 text-xs font-mono uppercase tracking-wider
                  ${isActive ? "text-emerald-400" : isCompleted ? "text-zinc-400" : "text-zinc-600"}
                  ${isError && index === currentIndex ? "text-red-400" : ""}
                `}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                  w-12 h-0.5 mx-2 mb-6 transition-colors duration-300
                  ${index < currentIndex ? "bg-emerald-500" : "bg-zinc-700"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
