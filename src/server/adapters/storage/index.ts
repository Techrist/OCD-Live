import "server-only";
import { mockStorage } from "./mock";
import { s3Storage } from "./s3";
import type { StorageProvider } from "./types";

/** STORAGE_PROVIDER=mock (défaut : dossier local) ou s3 (Neon Object Storage, Cloudflare R2 ou tout service compatible S3). */
export function getStorage(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER ?? "mock";
  if (provider === "s3") return s3Storage;
  if (provider !== "mock") throw new Error(`STORAGE_PROVIDER inconnu : ${provider} (valeurs : mock, s3)`);
  return mockStorage;
}

/** Type d'image reconnu par ses premiers octets (on ne se fie pas au type annoncé par le navigateur). */
export function sniffImage(buf: Buffer): { ext: "jpg" | "png" | "webp"; contentType: string } | null {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: "jpg", contentType: "image/jpeg" };
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: "png", contentType: "image/png" };
  if (buf.length > 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return { ext: "webp", contentType: "image/webp" };
  return null;
}
