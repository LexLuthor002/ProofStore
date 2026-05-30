import { useWallet } from "@/context/WalletContext";
import { useQuery } from "@tanstack/react-query";
import { listCertificates, truncateAddress } from "@/lib/walrus";
import { Wallet, ShieldCheck, Copy, Check, ExternalLink, LogOut } from "lucide-react";
import { useState } from "react";

function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy}
      className={`p-1 rounded text-white/25 hover:text-white/60 transition-colors ${className}`}>
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function WalletPage() {
  const { address, walletName, connected, disconnect, openModal } = useWallet();

  const { data: certs } = useQuery({
    queryKey: ["certs", address],
    queryFn: () => listCertificates(address ?? undefined),
    enabled: !!address,
  });

  if (!connected) {
    return (
      <div className="max-w-xl">
        <h1 className="text-xl font-bold text-white mb-6">Wallet</h1>
        <div className="rounded-lg p-8 text-center space-y-4"
          style={{ background: "#080808", border: "1px solid #161616" }}>
          <Wallet className="h-8 w-8 text-white/20 mx-auto" />
          <p className="text-sm text-white/40">No wallet connected</p>
          <button onClick={openModal}
            className="px-6 py-2.5 rounded text-sm font-medium text-black"
            style={{ background: "#e0e0e0" }}>
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  const confirmed = certs?.items.filter((c) => c.status === "confirmed").length ?? 0;
  const pending = certs?.items.filter((c) => c.status === "pending").length ?? 0;

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-xl font-bold text-white">Wallet</h1>
        <p className="text-sm text-white/35 mt-1">Connected via Sui Network</p>
      </div>

      {/* Wallet card */}
      <div className="rounded-lg p-5 space-y-4" style={{ background: "#080808", border: "1px solid #161616" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "#111", border: "1px solid #1e1e1e" }}>
            <Wallet className="h-5 w-5 text-white/50" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{walletName ?? "Sui Wallet"}</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-xs text-white/40">Connected · Mainnet</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Address</div>
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono text-white/70 break-all flex-1">{address}</code>
            <CopyButton text={address ?? ""} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a href={`https://suiexplorer.com/address/${address}?network=mainnet`}
            target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 transition-colors">
            <ExternalLink className="h-3.5 w-3.5" />
            View on Explorer
          </a>
        </div>
      </div>

      {/* Cert stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: certs?.total ?? 0 },
          { label: "Confirmed", value: confirmed },
          { label: "Pending", value: pending },
        ].map((s) => (
          <div key={s.label} className="rounded-lg p-4 text-center"
            style={{ background: "#080808", border: "1px solid #161616" }}>
            <div className="text-xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-white/30 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sui info */}
      <div className="rounded-lg p-4 space-y-2" style={{ background: "#060606", border: "1px solid #111" }}>
        <div className="text-xs font-mono text-white/30 uppercase tracking-widest mb-3">Network</div>
        {[
          { label: "Network", value: "Sui Mainnet" },
          { label: "RPC", value: "Tatum Gateway" },
          { label: "Storage", value: "Walrus" },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-xs text-white/30">{row.label}</span>
            <span className="text-xs text-white/60 font-mono">{row.value}</span>
          </div>
        ))}
      </div>

      <button onClick={disconnect}
        className="flex items-center gap-2 px-4 py-2.5 rounded text-sm text-white/40 hover:text-white/70 transition-all"
        style={{ background: "#0a0a0a", border: "1px solid #161616" }}>
        <LogOut className="h-4 w-4" />
        Disconnect Wallet
      </button>
    </div>
  );
}
