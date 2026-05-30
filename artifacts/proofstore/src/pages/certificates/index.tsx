import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/context/WalletContext";
import { listCertificates, walrusExplorerUrl, truncateAddress, truncateHash, type Certificate } from "@/lib/walrus";
import { formatFileSize } from "@/lib/hashFile";
import { Files, ExternalLink, ChevronRight, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#22c55e",
  pending: "#f59e0b",
  failed: "#ef4444",
};

function CertRow({ cert }: { cert: Certificate }) {
  return (
    <Link href={`/certificates/${cert.id}`}>
      <div className="flex items-center gap-3 px-4 py-3.5 transition-all cursor-pointer group"
        style={{ borderBottom: "1px solid #0e0e0e" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#0a0a0a")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
        <Files className="h-4 w-4 text-white/20 flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="text-sm text-white/75 truncate font-medium">{cert.filename}</div>
          <div className="text-xs text-white/30 font-mono">{truncateHash(cert.sha256)}</div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:block text-xs text-white/30">
            {formatDistanceToNow(new Date(cert.createdAt), { addSuffix: true })}
          </div>
          <div className="text-xs font-mono px-2 py-0.5 rounded-full"
            style={{
              color: STATUS_COLORS[cert.status] ?? "#888",
              background: `${STATUS_COLORS[cert.status] ?? "#888"}18`,
              border: `1px solid ${STATUS_COLORS[cert.status] ?? "#888"}33`,
            }}>
            {cert.status}
          </div>
          <ChevronRight className="h-4 w-4 text-white/15 group-hover:text-white/40 transition-colors" />
        </div>
      </div>
    </Link>
  );
}

export default function Certificates() {
  const { address } = useWallet();
  const [showMine, setShowMine] = useState(true);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["certificates", showMine ? address : "all", page],
    queryFn: () => listCertificates(showMine ? address ?? undefined : undefined, page, 20),
    refetchInterval: 30_000,
  });

  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Certificates</h1>
          <p className="text-sm text-white/35 mt-0.5">
            {data?.total ?? 0} certificate{(data?.total ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-white/25" />
          <button onClick={() => { setShowMine(true); setPage(1); }}
            className={cn("text-xs px-3 py-1.5 rounded transition-all", showMine ? "text-white" : "text-white/35")}
            style={{ background: showMine ? "#1a1a1a" : "transparent", border: "1px solid", borderColor: showMine ? "#2a2a2a" : "transparent" }}>
            Mine
          </button>
          <button onClick={() => { setShowMine(false); setPage(1); }}
            className={cn("text-xs px-3 py-1.5 rounded transition-all", !showMine ? "text-white" : "text-white/35")}
            style={{ background: !showMine ? "#1a1a1a" : "transparent", border: "1px solid", borderColor: !showMine ? "#2a2a2a" : "transparent" }}>
            All
          </button>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #111" }}>
        {isLoading ? (
          <div className="p-8 text-center text-white/25 text-sm">Loading…</div>
        ) : !data?.items.length ? (
          <div className="p-10 text-center space-y-2">
            <Files className="h-6 w-6 text-white/15 mx-auto" />
            <p className="text-sm text-white/30">No certificates found</p>
          </div>
        ) : (
          data.items.map((cert) => <CertRow key={cert.id} cert={cert} />)
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
            className="text-xs px-3 py-1.5 rounded text-white/40 hover:text-white/70 disabled:opacity-30 transition-all"
            style={{ border: "1px solid #1a1a1a" }}>
            ← Prev
          </button>
          <span className="text-xs text-white/30">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="text-xs px-3 py-1.5 rounded text-white/40 hover:text-white/70 disabled:opacity-30 transition-all"
            style={{ border: "1px solid #1a1a1a" }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
