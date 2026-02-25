import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

function CustomConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <button onClick={() => disconnect()} className="rainbow-button">
        {address.slice(0, 6)}...{address.slice(-4)}
      </button>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className="rainbow-button"
    >
      Connect
    </button>
  );
}

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <header className="text-center mb-6">
        <h1 className="text-xl tracking-widest text-emerald-400/60 uppercase">
          EVVM + x402
        </h1>
      </header>

      <CustomConnectButton />
    </div>
  );
}

export default App;
