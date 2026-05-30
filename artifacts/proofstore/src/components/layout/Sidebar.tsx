import { Link, useLocation } from "wouter";
import { useWallet } from "@/context/WalletContext";
import {
  ShieldCheck,
  UploadCloud,
  Search,
  Files,
  Wallet,
  Activity,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { truncateAddress } from "@/lib/walrus";

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const [location] = useLocation();
  const { address, walletName, disconnect } = useWallet();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Activity },
    { name: "Upload & Certify", href: "/upload", icon: UploadCloud },
    { name: "Verify File", href: "/verify", icon: ShieldCheck },
    { name: "Certificates", href: "/certificates", icon: Files },
    { name: "Wallet", href: "/wallet", icon: Wallet },
    { name: "Search", href: "/search", icon: Search },
  ];

  const handleNav = () => { if (onClose) onClose(); };

  return (
    <div
      className="flex h-full w-64 flex-col"
      style={{ background: "#050505", borderRight: "1px solid #111" }}
    >
      {/* Header */}
      <div
        className="flex h-14 items-center justify-between px-4 flex-shrink-0"
        style={{ borderBottom: "1px solid #111" }}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-white/80" />
          <span className="font-mono text-sm font-bold tracking-widest text-white/90">PROOFSTORE</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded text-white/30 hover:text-white/60 transition-colors md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3">
        <nav className="grid gap-0.5 px-2">
          {navigation.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/dashboard" && location.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNav}
                className={cn(
                  "flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-white/8 text-white"
                    : "text-white/45 hover:bg-white/4 hover:text-white/75"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 flex-shrink-0",
                    isActive ? "text-white/90" : "text-white/35"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Wallet info + disconnect */}
      <div className="flex-shrink-0 p-3" style={{ borderTop: "1px solid #111" }}>
        {address ? (
          <div className="space-y-2">
            <div
              className="rounded px-3 py-2.5 space-y-0.5"
              style={{ background: "#0a0a0a", border: "1px solid #161616" }}
            >
              <div className="text-[10px] font-mono text-white/30 tracking-widest uppercase">
                {walletName ?? "Wallet"}
              </div>
              <div className="font-mono text-xs text-white/70">{truncateAddress(address, 6)}</div>
            </div>
            <button
              onClick={disconnect}
              className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-white/40 hover:text-white/70 hover:bg-white/4 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        ) : (
          <div className="text-xs text-white/30 px-3">Not connected</div>
        )}
      </div>
    </div>
  );
}
