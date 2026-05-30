import { Router } from "express";
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { logger } from "../lib/logger";

const DATA_DIR = join(process.cwd(), "data");
const CERTS_FILE = join(DATA_DIR, "certificates.json");

export interface Certificate {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  sha256: string;
  sha512: string;
  blobId: string;
  signature: string | null;
  signerPublicKey: string | null;
  txHash: string | null;
  ownerAddress: string;
  status: "pending" | "confirmed" | "failed";
  createdAt: string;
  certifiedAt: string | null;
  description: string;
}

let certCache: Certificate[] | null = null;

function load(): Certificate[] {
  if (certCache) return certCache;
  try {
    certCache = JSON.parse(readFileSync(CERTS_FILE, "utf-8")) as Certificate[];
  } catch { certCache = []; }
  return certCache;
}

function save(certs: Certificate[]) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(CERTS_FILE, JSON.stringify(certs, null, 2));
  certCache = certs;
}

const router = Router();

router.get("/", (req, res) => {
  const { page = "1", limit = "20", wallet, status } = req.query as Record<string, string>;
  let certs = load();
  if (wallet) certs = certs.filter((c) => c.ownerAddress === wallet);
  if (status) certs = certs.filter((c) => c.status === status);
  certs = [...certs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const p = Math.max(1, parseInt(page));
  const l = Math.min(100, Math.max(1, parseInt(limit)));
  const total = certs.length;
  const items = certs.slice((p - 1) * l, p * l);
  res.json({ items, total, page: p, limit: l });
});

router.get("/stats", (_req, res) => {
  const certs = load();
  const today = new Date().toISOString().slice(0, 10);
  const confirmedToday = certs.filter((c) => c.status === "confirmed" && c.certifiedAt?.startsWith(today)).length;
  const pending = certs.filter((c) => c.status === "pending").length;
  const failed = certs.filter((c) => c.status === "failed").length;
  const confirmed = certs.filter((c) => c.status === "confirmed").length;

  const last7: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    last7[d] = 0;
  }
  for (const c of certs) {
    const d = c.createdAt.slice(0, 10);
    if (d in last7) last7[d]++;
  }

  res.json({
    total_certificates: certs.length,
    verified_today: confirmedToday,
    pending,
    failed,
    confirmed,
    certificates_by_status: { pending, confirmed, failed },
    recent_volume: Object.entries(last7).map(([date, count]) => ({ date, count })),
  });
});

router.get("/activity", (req, res) => {
  const limit = Math.min(50, parseInt((req.query["limit"] as string) || "10"));
  const certs = load().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  const activity = certs.map((c) => ({
    id: c.id,
    type: "upload" as const,
    description: `Certified: ${c.filename}`,
    certificate_id: c.id,
    wallet_address: c.ownerAddress,
    timestamp: c.createdAt,
  }));
  res.json(activity);
});

router.get("/:id", (req, res) => {
  const cert = load().find((c) => c.id === req.params["id"]);
  if (!cert) { res.status(404).json({ error: "Certificate not found" }); return; }
  res.json(cert);
});

router.post("/", (req, res) => {
  const body = req.body as Partial<Certificate>;
  if (!body.sha256 || !body.ownerAddress || !body.blobId) {
    res.status(400).json({ error: "sha256, ownerAddress, and blobId required" });
    return;
  }
  const certs = load();
  const existing = certs.find((c) => c.sha256 === body.sha256);
  if (existing) {
    res.status(200).json({ certificate: existing, message: "File already certified", duplicate: true });
    return;
  }
  const now = new Date().toISOString();
  const cert: Certificate = {
    id: crypto.randomUUID(),
    filename: body.filename ?? "unknown",
    fileSize: body.fileSize ?? 0,
    mimeType: body.mimeType ?? "application/octet-stream",
    sha256: body.sha256,
    sha512: body.sha512 ?? "",
    blobId: body.blobId,
    signature: body.signature ?? null,
    signerPublicKey: body.signerPublicKey ?? null,
    txHash: body.txHash ?? null,
    ownerAddress: body.ownerAddress,
    status: "confirmed",
    createdAt: now,
    certifiedAt: now,
    description: body.description ?? "",
  };
  certs.push(cert);
  save(certs);
  logger.info({ id: cert.id, sha256: cert.sha256 }, "certificate created");
  res.status(201).json({ certificate: cert, message: "File certified", duplicate: false });
});

router.patch("/:id", (req, res) => {
  const certs = load();
  const idx = certs.findIndex((c) => c.id === req.params["id"]);
  if (idx < 0) { res.status(404).json({ error: "Certificate not found" }); return; }
  const updates = req.body as Partial<Certificate>;
  certs[idx] = { ...certs[idx]!, ...updates };
  if (updates.txHash && certs[idx]!.status === "pending") {
    certs[idx]!.status = "confirmed";
    certs[idx]!.certifiedAt = new Date().toISOString();
  }
  save(certs);
  res.json(certs[idx]);
});

router.get("/search/q", (req, res) => {
  const { q, type = "all" } = req.query as { q?: string; type?: string };
  if (!q) { res.status(400).json({ error: "q required" }); return; }
  const ql = q.toLowerCase();
  let certs = load();
  if (type === "hash") certs = certs.filter((c) => c.sha256.includes(ql) || c.sha512.includes(ql));
  else if (type === "blob_id") certs = certs.filter((c) => c.blobId.includes(ql));
  else if (type === "wallet") certs = certs.filter((c) => c.ownerAddress.toLowerCase().includes(ql));
  else certs = certs.filter((c) =>
    c.sha256.includes(ql) || c.sha512.includes(ql) || c.blobId.includes(ql) ||
    c.ownerAddress.toLowerCase().includes(ql) || c.filename.toLowerCase().includes(ql)
  );
  res.json({ certificates: certs.slice(0, 50), total: certs.length, query: q, search_type: type });
});

router.post("/verify", (req, res) => {
  const { sha256 } = req.body as { sha256?: string };
  if (!sha256) { res.status(400).json({ error: "sha256 required" }); return; }
  const cert = load().find((c) => c.sha256 === sha256);
  if (!cert) {
    res.status(200).json({ valid: false, status: "NOT_FOUND", message: "No certificate found for this file hash" });
    return;
  }
  res.status(200).json({
    valid: true,
    status: "VALID",
    message: "File hash matches a certified record",
    certificate: cert,
    computed_sha256: sha256,
  });
});

export default router;
