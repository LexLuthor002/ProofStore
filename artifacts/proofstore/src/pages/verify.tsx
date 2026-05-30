import { useState, useCallback, useRef } from "react";
import { hashFile, formatFileSize } from "@/lib/hashFile";
import { verifyCertificate, walrusExplorerUrl, truncateAddress, truncateHash, type Certificate } from "@/lib/walrus";
import { ShieldCheck, UploadCloud, AlertCircle, CheckCircle, XCircle, ExternalLink, Copy, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="p-1 rounded text-white/25 hover:text-white/60 transition-colors">
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

type Mode = "file" | "hash";

export default function Verify() {
  const [mode, setMode] = useState<Mode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [hashInput, setHashInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ valid: boolean; status: string; message: string; certificate?: Certificate; sha256?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const verify = async (sha256: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await verifyCertificate(sha256);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
    setLoading(true);
    try {
      const { sha256 } = await hashFile(f);
      await verify(sha256);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) void handleFile(f);
  }, []);

  const handleHashVerify = () => {
    const h = hashInput.trim().toLowerCase();
    if (h.length !== 64) { setError("Enter a valid SHA-256 hash (64 hex characters)"); return; }
    void verify(h);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-xl font-bold text-white">Verify File</h1>
        <p className="text-sm text-white/35 mt-1">Check if a file has a certificate on the network</p>
      </div>

      {/* Mode tabs */}
      <div className="flex rounded-lg p-1 gap-1" style={{ background: "#080808", border: "1px solid #161616" }}>
        {(["file", "hash"] as Mode[]).map((m) => (
          <button key={m} onClick={() => { setMode(m); setResult(null); setError(null); }}
            className="flex-1 py-2 rounded text-sm font-medium transition-all capitalize"
            style={{
              background: mode === m ? "#1a1a1a" : "transparent",
              color: mode === m ? "#fff" : "rgba(255,255,255,0.4)",
              border: mode === m ? "1px solid #2a2a2a" : "1px solid transparent",
            }}>
            {m === "file" ? "Drop File" : "Enter Hash"}
          </button>
        ))}
      </div>

      {mode === "file" && (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className="rounded-lg border-2 border-dashed transition-all cursor-pointer"
          style={{
            borderColor: dragging ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
            background: dragging ? "rgba(255,255,255,0.03)" : "transparent",
            minHeight: "120px",
          }}
        >
          <input ref={inputRef} type="file" className="hidden"
            onChange={(e) => e.target.files?.[0] && void handleFile(e.target.files[0])} />
          {!file ? (
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
              <UploadCloud className="h-7 w-7 text-white/20 mb-2" />
              <p className="text-sm text-white/45">Drop file or <span className="text-white/75 underline">browse</span></p>
              <p className="text-xs text-white/25 mt-1">Hashed in-browser · Never uploaded during verify</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4">
              <ShieldCheck className="h-7 w-7 text-white/40 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-white/80 truncate">{file.name}</div>
                <div className="text-xs text-white/35">{formatFileSize(file.size)}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === "hash" && (
        <div className="space-y-3">
          <input
            type="text"
            value={hashInput}
            onChange={(e) => setHashInput(e.target.value)}
            placeholder="SHA-256 hash (64 hex characters)"
            className="w-full px-3 py-2.5 rounded text-sm font-mono text-white bg-transparent outline-none transition-all"
            style={{ border: "1px solid #1e1e1e" }}
            onFocus={(e) => (e.target.style.borderColor = "#333")}
            onBlur={(e) => (e.target.style.borderColor = "#1e1e1e")}
            onKeyDown={(e) => e.key === "Enter" && handleHashVerify()}
          />
          <button onClick={handleHashVerify} disabled={loading || !hashInput.trim()}
            className="w-full py-2.5 rounded text-sm font-medium text-black transition-all disabled:opacity-40"
            style={{ background: "#e0e0e0" }}>
            {loading ? "Verifying…" : "Verify Hash"}
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg"
          style={{ background: "#080808", border: "1px solid #161616" }}>
          <div className="w-4 h-4 rounded-full border border-white/20 border-t-white/70 animate-spin" />
          <span className="text-sm text-white/50">Computing hash and verifying…</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg"
          style={{ background: "#1a0808", border: "1px solid #2a1010" }}>
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-300">{error}</span>
        </div>
      )}

      {result && (
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #161616" }}>
          <div className="flex items-center gap-3 px-4 py-4"
            style={{ background: result.valid ? "#051a0e" : "#1a0808", borderBottom: "1px solid #161616" }}>
            {result.valid
              ? <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
              : <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />}
            <div>
              <div className="text-sm font-semibold" style={{ color: result.valid ? "#4ade80" : "#f87171" }}>
                {result.valid ? "Certificate Found" : "No Certificate Found"}
              </div>
              <div className="text-xs text-white/40">{result.message}</div>
            </div>
          </div>

          {result.valid && result.certificate && (
            <div className="p-4 space-y-3" style={{ background: "#080808" }}>
              {[
                { label: "Filename", value: result.certificate.filename },
                { label: "Owner", value: truncateAddress(result.certificate.ownerAddress, 8) },
                { label: "Certified", value: result.certificate.certifiedAt ? formatDistanceToNow(new Date(result.certificate.certifiedAt), { addSuffix: true }) : "pending" },
                { label: "SHA-256", value: truncateHash(result.certificate.sha256) },
                { label: "Blob ID", value: result.certificate.blobId },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <span className="text-xs text-white/30 font-mono uppercase tracking-wider flex-shrink-0">{row.label}</span>
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-xs text-white/65 truncate font-mono">{row.value}</span>
                    {(row.label === "SHA-256" || row.label === "Blob ID") && (
                      <CopyButton text={row.label === "SHA-256" ? result.certificate!.sha256 : result.certificate!.blobId} />
                    )}
                  </div>
                </div>
              ))}
              <a href={walrusExplorerUrl(result.certificate.blobId)} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors mt-1">
                <ExternalLink className="h-3 w-3" />
                View on Walrus
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
