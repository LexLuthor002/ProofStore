import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/context/WalletContext";
import { getStats, getActivity, truncateAddress } from "@/lib/walrus";
import { ShieldCheck, UploadCloud, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { address } = useWallet();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
    refetchInterval: 30_000,
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ["activity"],
    queryFn: () => getActivity(8),
    refetchInterval: 30_000,
  });

  const statCards = [
    { label: "Total Certificates", value: stats?.total_certificates ?? 0, icon: ShieldCheck, sub: "all time" },
    { label: "Confirmed", value: stats?.confirmed ?? 0, icon: ShieldCheck, sub: "on-chain" },
    { label: "Pending", value: stats?.pending ?? 0, icon: Clock, sub: "awaiting signature" },
    { label: "Verified Today", value: stats?.verified_today ?? 0, icon: UploadCloud, sub: "24h window" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Dashboard</h1>
        {address && (
          <p className="text-sm text-white/35 font-mono mt-1">{truncateAddress(address, 10)}</p>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-lg p-4 space-y-2"
            style={{ background: "#080808", border: "1px solid #161616" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/35 font-medium">{s.label}</span>
              <s.icon className="h-4 w-4 text-white/15" />
            </div>
            {statsLoading ? (
              <div className="h-7 w-12 rounded animate-pulse" style={{ background: "#111" }} />
            ) : (
              <div className="text-2xl font-bold text-white">{s.value}</div>
            )}
            <div className="text-[11px] text-white/25">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button onClick={() => setLocation("/upload")}
          className="flex items-center gap-3 p-4 rounded-lg text-left transition-all group"
          style={{ background: "#080808", border: "1px solid #161616" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#222")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#161616")}>
          <UploadCloud className="h-5 w-5 text-white/35 group-hover:text-white/60 transition-colors flex-shrink-0" />
          <div>
            <div className="text-sm font-medium text-white/80">Certify a File</div>
            <div className="text-xs text-white/30">Upload, hash, and anchor on Walrus</div>
          </div>
        </button>
        <button onClick={() => setLocation("/verify")}
          className="flex items-center gap-3 p-4 rounded-lg text-left transition-all group"
          style={{ background: "#080808", border: "1px solid #161616" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#222")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#161616")}>
          <ShieldCheck className="h-5 w-5 text-white/35 group-hover:text-white/60 transition-colors flex-shrink-0" />
          <div>
            <div className="text-sm font-medium text-white/80">Verify a File</div>
            <div className="text-xs text-white/30">Check if a file has been certified</div>
          </div>
        </button>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Recent Activity</h2>
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #111" }}>
          {activityLoading ? (
            <div className="p-8 text-center text-white/20 text-sm">Loading…</div>
          ) : !activity?.length ? (
            <div className="p-8 text-center space-y-2">
              <AlertCircle className="h-5 w-5 text-white/15 mx-auto" />
              <p className="text-sm text-white/30">No certificates yet</p>
              <button onClick={() => setLocation("/upload")}
                className="text-xs text-white/40 hover:text-white/70 underline transition-colors">
                Certify your first file →
              </button>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#0e0e0e" }}>
              {activity.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/25 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/65 truncate">{item.description}</div>
                    <div className="text-xs text-white/25 font-mono truncate">{truncateAddress(item.wallet_address, 6)}</div>
                  </div>
                  <div className="text-xs text-white/20 flex-shrink-0 whitespace-nowrap">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] font-mono text-white/18">
        <span>NET: SUI MAINNET</span>
        <span>RPC: TATUM GATEWAY</span>
        <span>STORAGE: WALRUS</span>
        <span>STATUS: ONLINE</span>
      </div>
    </div>
  );
}
