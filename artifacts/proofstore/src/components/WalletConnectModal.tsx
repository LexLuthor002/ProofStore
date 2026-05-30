import { useWallets, useConnectWallet } from "@mysten/dapp-kit";
import { useWallet } from "@/context/WalletContext";
import { useState } from "react";
import { X } from "lucide-react";

const INSTALL_LINKS: Record<string, string> = {
  "Sui Wallet": "https://suiwallet.com",
  Suiet: "https://suiet.app",
};

const FALLBACK_WALLETS = [
  { name: "Sui Wallet", desc: "Official Mysten Labs wallet" },
  { name: "Suiet", desc: "Smart Sui wallet" },
];

function WalletIcon({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <img src={src} alt={name} className="w-9 h-9 rounded-xl object-contain"
        onError={() => setFailed(true)} />
    );
  }
  return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white/70"
      style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
      {name[0]}
    </div>
  );
}

export default function WalletConnectModal() {
  const { isModalOpen, closeModal } = useWallet();
  const wallets = useWallets();
  const { mutate: connectWallet, isPending } = useConnectWallet();
  const [connectingName, setConnectingName] = useState<string | null>(null);

  if (!isModalOpen) return null;

  const handleConnect = (wallet: ReturnType<typeof useWallets>[number]) => {
    setConnectingName(wallet.name);
    connectWallet(
      { wallet },
      {
        onSuccess: () => { closeModal(); setConnectingName(null); },
        onError: () => setConnectingName(null),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal} />
      <div className="relative z-10 w-full max-w-sm"
        style={{ background: "#080808", border: "1px solid #1e1e1e", borderRadius: "12px" }}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Connect Wallet</h2>
              <p className="text-xs mt-1 text-white/40">Select your Sui wallet to continue</p>
            </div>
            <button onClick={closeModal} className="p-1 rounded-lg text-white/30 hover:text-white/70 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {wallets.length > 0 ? (
              wallets.map((wallet) => {
                const isConnecting = connectingName === wallet.name;
                return (
                  <button
                    key={wallet.name}
                    onClick={() => handleConnect(wallet)}
                    disabled={isPending}
                    className="w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left"
                    style={{ background: "#0e0e0e", border: "1px solid #1e1e1e" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2e2e2e")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e1e1e")}
                  >
                    <WalletIcon src={wallet.icon} name={wallet.name} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">{wallet.name}</div>
                      <div className="text-xs text-white/40">Sui Network</div>
                    </div>
                    {isConnecting && (
                      <div className="w-4 h-4 rounded-full border border-white/20 border-t-white/60 animate-spin" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-white/40 mb-3">No wallets detected. Install one:</p>
                {FALLBACK_WALLETS.map((w) => (
                  <a key={w.name} href={INSTALL_LINKS[w.name]} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg transition-all"
                    style={{ background: "#0e0e0e", border: "1px solid #1e1e1e" }}>
                    <WalletIcon name={w.name} />
                    <div>
                      <div className="text-sm font-medium text-white">{w.name}</div>
                      <div className="text-xs text-white/40">{w.desc} — click to install</div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <p className="mt-5 text-xs text-white/25 text-center leading-relaxed">
            By connecting, you agree to use this app on Sui Mainnet.<br />
            Your wallet signs requests — no password required.
          </p>
        </div>
      </div>
    </div>
  );
}
