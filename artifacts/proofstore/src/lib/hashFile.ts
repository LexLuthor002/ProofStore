function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashFile(file: File): Promise<{ sha256: string; sha512: string }> {
  const buffer = await file.arrayBuffer();
  const [s256, s512] = await Promise.all([
    crypto.subtle.digest("SHA-256", buffer),
    crypto.subtle.digest("SHA-512", buffer),
  ]);
  return { sha256: toHex(s256), sha512: toHex(s512) };
}

export async function hashBuffer(buffer: ArrayBuffer): Promise<{ sha256: string; sha512: string }> {
  const [s256, s512] = await Promise.all([
    crypto.subtle.digest("SHA-256", buffer),
    crypto.subtle.digest("SHA-512", buffer),
  ]);
  return { sha256: toHex(s256), sha512: toHex(s512) };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
