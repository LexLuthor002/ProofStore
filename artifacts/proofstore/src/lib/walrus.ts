const API_BASE = "/api";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadToWalrus(file: File): Promise<string> {
  const data = await fileToBase64(file);
  const res = await fetch(`${API_BASE}/walrus/upload`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      fileSize: file.size,
      data,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
    throw new Error(err.error ?? `Upload failed: ${res.status}`);
  }
  const { blobId } = await res.json() as { blobId: string };
  return blobId;
}

export interface Certificate {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  sha256: string;
  sha512: string;
  blobId: string;
  signature: string | null;
  txHash: string | null;
  ownerAddress: string;
  status: "pending" | "confirmed" | "failed";
  createdAt: string;
  certifiedAt: string | null;
  description: string;
}

export interface CertListResult {
  items: Certificate[];
  total: number;
  page: number;
  limit: number;
}

export interface StatsResult {
  total_certificates: number;
  verified_today: number;
  pending: number;
  confirmed: number;
  failed: number;
  certificates_by_status: { pending: number; confirmed: number; failed: number };
  recent_volume: { date: string; count: number }[];
}

export interface VerifyResult {
  valid: boolean;
  status: string;
  message: string;
  certificate?: Certificate;
  computed_sha256?: string;
}

export async function createCertificate(cert: {
  filename: string;
  fileSize: number;
  mimeType: string;
  sha256: string;
  sha512: string;
  blobId: string;
  ownerAddress: string;
  signature?: string | null;
  description?: string;
}): Promise<{ certificate: Certificate; message: string; duplicate: boolean }> {
  const res = await fetch(`${API_BASE}/certificates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cert),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? "Failed to create certificate");
  }
  return res.json() as Promise<{ certificate: Certificate; message: string; duplicate: boolean }>;
}

export async function listCertificates(wallet?: string, page = 1, limit = 20): Promise<CertListResult> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (wallet) params.set("wallet", wallet);
  const res = await fetch(`${API_BASE}/certificates?${params}`);
  return res.json() as Promise<CertListResult>;
}

export async function getCertificate(id: string): Promise<Certificate> {
  const res = await fetch(`${API_BASE}/certificates/${id}`);
  if (!res.ok) throw new Error("Certificate not found");
  return res.json() as Promise<Certificate>;
}

export async function getStats(): Promise<StatsResult> {
  const res = await fetch(`${API_BASE}/certificates/stats`);
  return res.json() as Promise<StatsResult>;
}

export async function getActivity(limit = 10): Promise<{ id: string; type: string; description: string; wallet_address: string; timestamp: string }[]> {
  const res = await fetch(`${API_BASE}/certificates/activity?limit=${limit}`);
  return res.json() as Promise<{ id: string; type: string; description: string; wallet_address: string; timestamp: string }[]>;
}

export async function verifyCertificate(sha256: string): Promise<VerifyResult> {
  const res = await fetch(`${API_BASE}/certificates/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sha256 }),
  });
  return res.json() as Promise<VerifyResult>;
}

export async function searchCertificates(q: string, type = "all"): Promise<{ certificates: Certificate[]; total: number }> {
  const params = new URLSearchParams({ q, type });
  const res = await fetch(`${API_BASE}/certificates/search/q?${params}`);
  return res.json() as Promise<{ certificates: Certificate[]; total: number }>;
}

export function walrusExplorerUrl(blobId: string) {
  return `https://aggregator.walrus-mainnet.walrus.space/v1/blobs/${blobId}`;
}

export function suiExplorerUrl(txHash: string) {
  return `https://suiexplorer.com/txblock/${txHash}?network=mainnet`;
}

export function truncateAddress(addr: string, chars = 6): string {
  if (!addr || addr.length <= chars * 2 + 2) return addr;
  return `${addr.slice(0, chars + 2)}…${addr.slice(-chars)}`;
}

export function truncateHash(hash: string, chars = 8): string {
  if (!hash || hash.length <= chars * 2) return hash;
  return `${hash.slice(0, chars)}…${hash.slice(-chars)}`;
}
