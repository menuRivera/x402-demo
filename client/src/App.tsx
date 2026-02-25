import { useX402 } from "./hooks/useX402";
import { PaymentStepper } from "./components/PaymentStepper";
import { PaymentDetails } from "./components/PaymentDetails";
import { JsonViewer } from "./components/JsonViewer";
import { CustomConnectButton } from "./components/CusomConnectButton";

function App() {
  const { status, content, error, paymentDetails, fetchProtectedAsset } =
    useX402();

  const handleFetch = () => {
    fetchProtectedAsset("http://localhost:3000/protected");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <header className="text-center mb-8">
        <h1 className="text-xl tracking-widest text-emerald-400/60 uppercase">
          EVVM + x402
        </h1>
      </header>

      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        <CustomConnectButton />

        <button
          onClick={handleFetch}
          disabled={status === "fetching" || status === "signing"}
          className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 rounded-lg font-mono text-sm transition-colors"
        >
          {status === "idle" || status === "error"
            ? "Fetch Protected Resource"
            : "Fetching..."}
        </button>

		{/* maybe delete this? */}
        <PaymentStepper status={status} />

        {error && (
          <div className="text-red-400 font-mono text-sm mt-4">{error}</div>
        )}

        {paymentDetails && status === "payment-required" && (
          <PaymentDetails details={paymentDetails} />
        )}

        {content && status === "success" && <JsonViewer data={content} />}
      </div>
    </div>
  );
}

export default App;
