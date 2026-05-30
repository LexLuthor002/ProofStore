import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getCertificate, walrusExplorerUrl, suiExplorerUrl, truncateAddress } from "@/lib/walrus";
import { formatFileSize } from "@/lib/hashFile";
import { ArrowLeft, ExternalLink, ShieldCheck, Copy, Check } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useState } from "react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { void navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1 rounded text-white/25 hover:text-white/60 transition-colors">
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#22c55e", pending: "#f59e0b", failed: "#ef4444",
};

function Field({ label, value, mono = false, canCopy = false }: { label: string; value: string; mono?: boolean; canCopy?: boolean }) {
  return (
    <div className="py-3 space-y-1.5" style={{ borderBottom: "1px solid #0d0d0d" }}>
      <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{label}</div>
      <div className="flex items-start gap-2">
        <span className={`flex-1 text-sm text-white/65 break-all ${mono ? "font-mono text-xs" : ""}`}>{value || "—"}</span>
        {canCopy && <CopyButton text={value} />}
      </div>
    </div>
  );
}

export default function CertificateDetail() {
  const [, params] = useRoute("/certificates/:id");
  const id = params?.id ?? "";

  const { data: cert, isLoading, error } = useQuery({
    queryKey: ["certificate", id],
    queryFn: () => getCertificate(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <div className="w-5 h-5 rounded-full border border-white/20 border-t-white/60 animate-spin mx-auto" />
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="space-y-4 max-w-xl">
        <Link href="/certificates">
          <button className="flex items-center gap-2 text-sm text-white/35 hover:text-white/70 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Certificates
          </button>
        </Link>
        <p className="text-sm text-red-400">Certificate not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/certificates">
          <button className="flex items-center gap-2 text-sm text-white/35 hover:text-white/70 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </Link>
        <div className="text-xs font-mono px-2.5 py-1 rounded-full"
          style={{
            color: STATUS_COLORS[cert.status] ?? "#888",
            background: `${STATUS_COLORS[cert.status] ?? "#888"}18`,
            border: `1px solid ${STATUS_COLORS[cert.status] ?? "#888"}33`,
          }}>
          {cert.status.toUpperCase()}
        </div>
      </div>

      <div>
        <h1 className="text-xl font-bold text-white">{cert.filename}</h1>
        <p className="text-sm text-white/35 mt-1">
          {formatFileSize(cert.fileSize)} · {cert.mimeType}
        </p>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #161616", background: "#080808" }}>
        <div className="px-4 pt-4">
          <Field label="Certificate ID" value={cert.id} mono canCopy />
          <Field label="Owner Address" value={cert.ownerAddress} mono canCopy />
          <Field label="SHA-256" value={cert.sha256} mono canCopy />
          <Field label="SHA-512" value={cert.sha512} mono canCopy />
          <Field label="Blob ID" value={cert.blobId} mono canCopy />
          {cert.signature && <Field label="Wallet Signature" value={cert.signature} mono canCopy />}
          {cert.txHash && <Field label="Tx Hash" value={cert.txHash} mono canCopy />}
          {cert.description && <Field label="Description" value={cert.description} />}
          <Field label="Created" value={format(new Date(cert.createdAt), "PPpp")} />
          {cert.certifiedAt && <Field label="Certified" value={formatDistanceToNow(new Date(cert.certifiedAt), { addSuffix: true })} />}
        </div>

        <div className="flex flex-wrap gap-2 p-4">
          <a href={walrusExplorerUrl(cert.blobId)} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded text-xs text-white/50 hover:text-white/80 transition-colors"
            style={{ background: "#111", border: "1px solid #1e1e1e" }}>
            <ExternalLink className="h-3.5 w-3.5" />
            Walrus Explorer
          </a>
          {cert.txHash && (
            <a href={suiExplorerUrl(cert.txHash)} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded text-xs text-white/50 hover:text-white/80 transition-colors"
              style={{ background: "#111", border: "1px solid #1e1e1e" }}>
              <ExternalLink className="h-3.5 w-3.5" />
              Sui Explorer
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
