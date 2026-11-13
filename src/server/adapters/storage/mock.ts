import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageProvider } from "./types";

export const UPLOAD_DIR = path.join(process.cwd(), ".uploads");

// Clés autorisées : « dossier/nom.ext » en minuscules, sans « .. » (empêche de sortir du dossier d'envoi).
export const SAFE_KEY = /^[a-z0-9_-]+(\/[a-z0-9_-]+)*\.(jpg|png|webp)$/;

export function filePath(key: string): string {
  if (!SAFE_KEY.test(key)) throw new Error("Clé de fichier invalide");
  return path.join(UPLOAD_DIR, ...key.split("/"));
}

/** Mode simulation : fichiers dans ./.uploads, servis par la route locale /api/files/<clé> (section 19). */
export const mockStorage: StorageProvider = {
  async put(key, body) {
    const file = filePath(key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, body);
  },
  async getUrl(key) {
    return `/api/files/${key}`;
  },
  async get(key) {
    try {
      const ext = key.split(".").pop() as string;
      return { body: new Uint8Array(await readFile(filePath(key))), contentType: { jpg: "image/jpeg", png: "image/png", webp: "image/webp" }[ext] ?? "application/octet-stream" };
    } catch {
      return null;
    }
  },
  async remove(key) {
    await rm(filePath(key), { force: true });
  },
};
