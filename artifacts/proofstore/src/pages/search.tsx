import { useState } from "react";
import { searchCertificates, truncateAddress, truncateHash, type Certificate } from "@/lib/walrus";
import { Search as SearchIcon, Files, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

type SearchType = "all" | "hash" | "blob_id" | "wallet";

const SEARCH_TYPES: { value: SearchType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "hash", label: "Hash" },
  { value: "blob_id", label: "Blob ID" },
  { value: "wallet", label: "Wallet" },
];

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#22c55e", pending: "#f59e0b", failed: "#ef4444",
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<SearchType>("all");
  const [results, setResults] = useState<Certificate[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchCertificates(q, type);
      setResults(res.certificates);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Search</h1>
        <p className="text-sm text-white/35 mt-1">Search certificates by hash, blob ID, or wallet address</p>
      </div>

      <div className="space-y-3">
        <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid #1a1a1a" }}>
          <div className="flex-1 flex items-center">
            <SearchIcon className="h-4 w-4 text-white/25 ml-3 flex-shrink-0" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void doSearch()}
              placeholder="Search by hash, blob ID, filename, wallet…"
              className="flex-1 px-3 py-3 text-sm text-white bg-transparent outline-none placeholder:text-white/20"
            />
          </div>
          <button onClick={() => void doSearch()} disabled={loading || !query.trim()}
            className="px-5 py-3 text-sm font-medium text-black disabled:opacity-40 transition-all"
            style={{ background: "#e0e0e0" }}>
            {loading ? "…" : "Search"}
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {SEARCH_TYPES.map((t) => (
            <button key={t.value} onClick={() => setType(t.value)}
              className="text-xs px-3 py-1.5 rounded transition-all"
              style={{
                background: type === t.value ? "#1a1a1a" : "transparent",
                border: "1px solid",
                borderColor: type === t.value ? "#2a2a2a" : "#111",
                color: type === t.value ? "#fff" : "rgba(255,255,255,0.35)",
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg"
          style={{ background: "#1a0808", border: "1px solid #2a1010" }}>
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span className="text-sm text-red-300">{error}</span>
        </div>
      )}

      {results !== null && (
        <div>
          <p className="text-xs text-white/30 mb-3">{total} result{total !== 1 ? "s" : ""} found</p>
          <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #111" }}>
            {!results.length ? (
              <div className="p-8 text-center space-y-2">
                <AlertCircle className="h-5 w-5 text-white/15 mx-auto" />
                <p className="text-sm text-white/30">No certificates match your query</p>
              </div>
            ) : (
              results.map((cert) => (
                <Link href={`/certificates/${cert.id}`} key={cert.id}>
                  <div className="flex items-center gap-3 px-4 py-3.5 transition-all cursor-pointer"
                    style={{ borderBottom: "1px solid #0e0e0e" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#0a0a0a")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <Files className="h-4 w-4 text-white/20 flex-shrink-0" />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="text-sm text-white/75 truncate">{cert.filename}</div>
                      <div className="text-xs text-white/30 font-mono">{truncateHash(cert.sha256)}</div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                      <div className="text-xs font-mono px-2 py-0.5 rounded-full"
                        style={{
                          color: STATUS_COLORS[cert.status] ?? "#888",
                          background: `${STATUS_COLORS[cert.status] ?? "#888"}18`,
                        }}>
                        {cert.status}
                      </div>
                      <div className="text-xs text-white/25">
                        {formatDistanceToNow(new Date(cert.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
