import { useLocation } from "wouter";
import { useWallet } from "@/context/WalletContext";
import { ShieldCheck, UploadCloud, Search, Wallet } from "lucide-react";
import { useEffect } from "react";

const features = [
  {
    icon: UploadCloud,
    title: "Upload & Certify",
    desc: "Hash your file client-side with SHA-256 / SHA-512, store immutably on Walrus decentralized storage.",
  },
  {
    icon: ShieldCheck,
    title: "On-Chain Proof",
    desc: "Your wallet signs the certificate. The Walrus blob ID is your tamper-evident, permanent record.",
  },
  {
    icon: Search,
    title: "Verify Anytime",
    desc: "Drop any file to instantly check whether a matching certificate exists on the network.",
  },
  {
    icon: Wallet,
    title: "Wallet-First Auth",
    desc: "No passwords. Your Sui wallet is your identity. Connect once, certify forever.",
  },
];

export default function LandingPage() {
  const { connected, isConnecting, openModal } = useWallet();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (connected) setLocation("/dashboard");
  }, [connected]);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #111" }}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-white/80" />
          <span className="font-mono text-sm font-bold tracking-widest text-white">PROOFSTORE</span>
        </div>
        <button
          onClick={openModal}
          className="px-4 py-2 rounded text-sm font-medium text-white transition-all"
          style={{ background: "#111", border: "1px solid #222" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#333")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#222")}
        >
          Connect Wallet
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono"
          style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", color: "#888" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
          Powered by Sui Mainnet · Walrus Storage · Tatum RPC
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-5 max-w-3xl leading-none">
          Decentralized<br />
          <span className="text-white/50">File Certification</span>
        </h1>

        <p className="text-white/40 max-w-xl text-base sm:text-lg leading-relaxed mb-10">
          Hash your files client-side, anchor them permanently on Walrus decentralized storage,
          and prove ownership via your Sui wallet. Immutable, timestamped, verifiable.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:justify-center">
          <button
            onClick={openModal}
            disabled={isConnecting}
            className="px-8 py-3.5 rounded text-sm font-semibold text-black transition-all disabled:opacity-50"
            style={{ background: "#f0f0f0" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f0f0f0")}
          >
            {isConnecting ? "Connecting…" : "Connect Wallet to Start"}
          </button>
          <a
            href="https://github.com/ONOSPETER/Shadow-Post"
            target="_blank"
            rel="noreferrer"
            className="px-8 py-3.5 rounded text-sm font-medium text-white/50 transition-all"
            style={{ background: "#0a0a0a", border: "1px solid #1a1a1a" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1a1a1a")}
          >
            View Source
          </a>
        </div>

        {/* Features grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full text-left">
          {features.map((f) => (
            <div key={f.title} className="p-5 rounded-lg"
              style={{ background: "#060606", border: "1px solid #141414" }}>
              <f.icon className="h-5 w-5 text-white/50 mb-3" />
              <div className="text-sm font-semibold text-white/80 mb-1">{f.title}</div>
              <div className="text-xs text-white/35 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-5 text-center" style={{ borderTop: "1px solid #0d0d0d" }}>
        <p className="text-xs text-white/20 font-mono">
          PROOFSTORE · Sui Mainnet · Files hashed client-side. Source bytes never leave your device.
        </p>
      </footer>
    </div>
  );
}
