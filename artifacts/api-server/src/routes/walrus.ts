import { Router } from "express";
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { logger } from "../lib/logger";

const TATUM_API_KEY = process.env.TATUM_API_KEY || "";
const TATUM_WALRUS_URL = "https://api.tatum.io/v4/data/storage/upload";
const MAX_RETRIES = 2;

const BLOB_CACHE_DIR = join(process.cwd(), "data", "blobs");

function ensureDir() {
  if (!existsSync(BLOB_CACHE_DIR)) mkdirSync(BLOB_CACHE_DIR, { recursive: true });
}

function cacheSave(blobId: string, data: unknown) {
  try {
    ensureDir();
    writeFileSync(join(BLOB_CACHE_DIR, `${blobId}.json`), JSON.stringify(data), "utf-8");
  } catch (e) { logger.warn({ blobId, err: e }, "cache write failed"); }
}

function cacheLoad(blobId: string): unknown | null {
  try {
    const p = join(BLOB_CACHE_DIR, `${blobId}.json`);
    if (!existsSync(p)) return null;
    return JSON.parse(readFileSync(p, "utf-8")) as unknown;
  } catch { return null; }
}

const WALRUS_AGGREGATORS = [
  "https://walrus-mainnet-aggregator.nodeinfra.com",
  "https://walrus.globalstake.io",
  "https://aggregator.walrus-mainnet.walrus.space",
];

function extractBlobId(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const d = data as Record<string, unknown>;
  if (typeof d["blobId"] === "string") return d["blobId"];
  if (typeof d["blob_id"] === "string") return d["blob_id"];
  const nc = d["newlyCreated"] as { blobObject?: { blobId?: string } } | undefined;
  if (nc?.blobObject?.blobId) return nc.blobObject.blobId;
  const ac = d["alreadyCertified"] as { blobId?: string } | undefined;
  if (ac?.blobId) return ac.blobId;
  return "";
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

const router = Router();

router.put("/upload", async (req, res) => {
  if (!TATUM_API_KEY) {
    res.status(503).json({ error: "TATUM_API_KEY not configured" });
    return;
  }

  const body = req.body as { filename?: string; mimeType?: string; data?: string; meta?: unknown };
  if (!body.data) { res.status(400).json({ error: "data (base64) required" }); return; }

  let fileBytes: Buffer;
  try {
    fileBytes = Buffer.from(body.data, "base64");
  } catch {
    res.status(400).json({ error: "Invalid base64 data" });
    return;
  }

  logger.info({ bytes: fileBytes.length, filename: body.filename }, "walrus upload starting");

  const boundary = `----ProofStoreBoundary${Date.now()}`;
  const preamble = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${body.filename ?? "file.bin"}"\r\nContent-Type: ${body.mimeType ?? "application/octet-stream"}\r\n\r\n`,
    "utf-8"
  );
  const epilogue = Buffer.from(`\r\n--${boundary}--\r\n`, "utf-8");
  const payload = Buffer.concat([preamble, fileBytes, epilogue]);

  let lastError = "Unknown";
  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      const tatumRes = await fetch(TATUM_WALRUS_URL, {
        method: "POST",
        headers: {
          "x-api-key": TATUM_API_KEY,
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Content-Length": String(payload.length),
        },
        body: payload,
        signal: AbortSignal.timeout(30_000),
      });
      const text = await tatumRes.text();
      logger.info({ attempt, status: tatumRes.status, body: text.slice(0, 200) }, "tatum upload response");

      if (!tatumRes.ok) {
        lastError = `Tatum ${tatumRes.status}: ${text.slice(0, 200)}`;
        if (tatumRes.status >= 500 && attempt <= MAX_RETRIES) { await sleep(attempt * 1000); continue; }
        res.status(tatumRes.status).json({ error: lastError }); return;
      }

      let data: unknown;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }
      const blobId = extractBlobId(data);
      if (!blobId) { res.status(502).json({ error: "Tatum returned no blobId", detail: text.slice(0, 300) }); return; }

      cacheSave(blobId, { filename: body.filename, mimeType: body.mimeType, meta: body.meta });
      res.status(200).json({ blobId });
      return;
    } catch (e: unknown) {
      lastError = e instanceof Error ? e.message : "fetch error";
      logger.error({ attempt, err: e }, "tatum upload error");
      if (attempt <= MAX_RETRIES) { await sleep(attempt * 1000); continue; }
    }
  }
  res.status(502).json({ error: lastError });
});

router.get("/blob/:blobId", async (req, res) => {
  const { blobId } = req.params;
  if (!blobId) { res.status(400).json({ error: "blobId required" }); return; }

  const cached = cacheLoad(blobId);
  if (cached !== null) { res.status(200).json(cached); return; }

  const errors: string[] = [];
  for (const agg of WALRUS_AGGREGATORS) {
    try {
      const r = await fetch(`${agg}/v1/blobs/${encodeURIComponent(blobId)}`, { signal: AbortSignal.timeout(15_000) });
      if (!r.ok) { errors.push(`${agg} → ${r.status}`); continue; }
      const buf = Buffer.from(await r.arrayBuffer());
      try {
        const parsed = JSON.parse(buf.toString("utf-8")) as unknown;
        cacheSave(blobId, parsed);
        res.status(200).json(parsed);
        return;
      } catch { errors.push(`${agg} → not JSON`); }
    } catch (e: unknown) { errors.push(`${agg} → ${e instanceof Error ? e.message : "error"}`); }
  }

  res.status(404).json({ error: "Blob not yet available — may still be certifying on Walrus", detail: errors });
});

export default router;
