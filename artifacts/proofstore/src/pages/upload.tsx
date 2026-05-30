import { useState, useCallback, useRef } from "react";
import { useWallet } from "@/context/WalletContext";
import { useSignPersonalMessage } from "@mysten/dapp-kit";
import { hashFile, formatFileSize } from "@/lib/hashFile";
import { uploadToWalrus, createCertificate, walrusExplorerUrl, truncateHash, type Certificate } from "@/lib/walrus";
import { UploadCloud, File, X, CheckCircle, AlertCircle, ExternalLink, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Stage = "idle" | "hashing" | "uploading" | "signing" | "recording" | "done" | "error";

const STAGE_LABELS: Record<string, string> = {
  hashing: "Computing Hashes",
  uploading: "Uploading to Walrus",
  signing: "Signing with Wallet",
  recording: "Recording Certificate",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="p-1 rounded text-white/25 hover:text-white/60 transition-colors flex-shrink-0">
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

export default function Upload() {
  const { address } = useWallet();
  const { mutateAsync: signMessage } = useSignPersonalMessage();

  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ cert: Certificate; blobId: string; sha256: string; sha512: string; signature: string | null } | null>(null);
  const [description, setDescription] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setStage("idle");
    setError(null);
    setResult(null);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const certify = async () => {
    if (!file || !address) return;
    setError(null);
    try {
      setStage("hashing");
      const { sha256, sha512 } = await hashFile(file);

      setStage("uploading");
      const blobId = await uploadToWalrus(file);

      setStage("signing");
      let signature: string | null = null;
      try {
        const msgBytes = new TextEncoder().encode(`ProofStore:certify:${sha256}`);
        const { signature: sig } = await signMessage({ message: msgBytes });
        signature = sig;
      } catch {
        // Signing declined — proceed without signature
      }

      setStage("recording");
      const { certificate } = await createCertificate({
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
        sha256,
        sha512,
        blobId,
        ownerAddress: address,
        signature,
        description,
      });

      setResult({ cert: certificate, blobId, sha256, sha512, signature });
      setStage("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Certification failed");
      setStage("error");
    }
  };

  const reset = () => {
    setFile(null);
    setStage("idle");
    setError(null);
    setResult(null);
    setDescription("");
  };

  if (stage === "done" && result) {
    return (
      <div className="space-y-6 max-w-xl">
        <div>
          <h1 className="text-xl font-bold text-white">Certification Complete</h1>
          <p className="text-sm text-white/35 mt-1">Your file has been certified on Walrus</p>
        </div>

        <div className="rounded-lg p-5 space-y-4" style={{ background: "#080808", border: "1px solid #161616" }}>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
            <span className="font-medium text-white">{result.cert.filename}</span>
            <span className="text-xs text-white/35 ml-auto">{formatFileSize(result.cert.fileSize)}</span>
          </div>

          {[
            { label: "SHA-256", value: result.sha256 },
            { label: "SHA-512", value: result.sha512.slice(0, 64) + "…" },
            { label: "Blob ID", value: result.blobId },
            { label: "Cert ID", value: result.cert.id },
          ].map((row) => (
            <div key={row.label} className="space-y-1">
              <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{row.label}</div>
              <div className="flex items-center gap-2">
                <code className="hash-text text-white/60 flex-1 break-all">{row.value}</code>
                <CopyButton text={row.label === "SHA-512" ? result.sha512 : row.value} />
              </div>
            </div>
          ))}

          {result.signature && (
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Wallet Signature</div>
              <div className="flex items-center gap-2">
                <code className="hash-text text-white/60 flex-1 break-all">{result.signature.slice(0, 32)}…</code>
                <CopyButton text={result.signature} />
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <a href={walrusExplorerUrl(result.blobId)} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded text-sm text-white/60 hover:text-white/90 transition-colors"
              style={{ background: "#111", border: "1px solid #1e1e1e" }}>
              <ExternalLink className="h-3.5 w-3.5" />
              View on Walrus
            </a>
            <button onClick={reset}
              className="px-4 py-2 rounded text-sm font-medium text-black transition-all"
              style={{ background: "#e0e0e0" }}>
              Certify Another File
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-xl font-bold text-white">Upload & Certify</h1>
        <p className="text-sm text-white/35 mt-1">Hash your file client-side, store it on Walrus, sign with your wallet</p>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => !file && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-all cursor-pointer",
          dragging ? "border-white/40 bg-white/4" : "border-white/10 hover:border-white/20",
          file ? "cursor-default" : ""
        )}
        style={{ minHeight: "140px" }}
      >
        <input ref={inputRef} type="file" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

        {!file ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <UploadCloud className="h-8 w-8 text-white/20 mb-3" />
            <p className="text-sm text-white/50">Drop file here or <span className="text-white/80 underline">browse</span></p>
            <p className="text-xs text-white/25 mt-1">Any file type · Hashed in-browser · Never sent unencrypted</p>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4">
            <File className="h-8 w-8 text-white/40 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white/80 truncate">{file.name}</div>
              <div className="text-xs text-white/35 mt-0.5">{formatFileSize(file.size)} · {file.type || "unknown type"}</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); reset(); }}
              className="p-1.5 rounded text-white/25 hover:text-white/60 transition-colors flex-shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {file && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-white/35 uppercase tracking-widest">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Contract v2 — signed copy"
              className="w-full px-3 py-2.5 rounded text-sm text-white bg-transparent outline-none transition-all"
              style={{ border: "1px solid #1e1e1e" }}
              onFocus={(e) => (e.target.style.borderColor = "#333")}
              onBlur={(e) => (e.target.style.borderColor = "#1e1e1e")}
            />
          </div>

          {/* Progress stages */}
          {stage !== "idle" && stage !== "error" && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg"
              style={{ background: "#080808", border: "1px solid #161616" }}>
              <div className="w-4 h-4 rounded-full border border-white/20 border-t-white/70 animate-spin flex-shrink-0" />
              <span className="text-sm text-white/60">{STAGE_LABELS[stage] ?? "Processing…"}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg"
              style={{ background: "#1a0808", border: "1px solid #2a1010" }}>
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-300">{error}</span>
            </div>
          )}

          <button
            onClick={certify}
            disabled={stage !== "idle" && stage !== "error"}
            className="w-full py-3 rounded text-sm font-semibold text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#e8e8e8" }}
            onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = "#fff"; }}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#e8e8e8")}
          >
            {stage === "idle" || stage === "error" ? "Certify File" : "Certifying…"}
          </button>

          <p className="text-xs text-white/25 text-center">
            File hashed in-browser via Web Crypto API. Raw bytes are uploaded to Walrus for archival.
          </p>
        </div>
      )}
    </div>
  );
}
