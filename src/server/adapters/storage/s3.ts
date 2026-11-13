import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SAFE_KEY } from "./mock";
import type { StorageProvider } from "./types";

// Neon Object Storage (compatible S3). Identifiants, adresse et région viennent des variables standard
// AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ENDPOINT_URL_S3 et AWS_REGION ; le bucket de S3_BUCKET (« assets » par défaut).
let client: S3Client | undefined;
const s3 = () => (client ??= new S3Client({ forcePathStyle: true })); // Neon impose l'adressage par chemin
const bucket = () => process.env.S3_BUCKET || "assets";

function safe(key: string) {
  if (!SAFE_KEY.test(key)) throw new Error("Clé de fichier invalide");
  return key;
}

export const s3Storage: StorageProvider = {
  async put(key, body, contentType) {
    await s3().send(new PutObjectCommand({ Bucket: bucket(), Key: safe(key), Body: body, ContentType: contentType, CacheControl: "public, max-age=31536000, immutable" }));
  },
  async getUrl(key) {
    return `/api/files/${key}`;
  },
  async get(key) {
    try {
      const res = await s3().send(new GetObjectCommand({ Bucket: bucket(), Key: safe(key) }));
      if (!res.Body) return null;
      return { body: await res.Body.transformToByteArray(), contentType: res.ContentType ?? "application/octet-stream" };
    } catch (e) {
      if ((e as { name?: string }).name === "NoSuchKey") return null;
      throw e;
    }
  },
  async remove(key) {
    await s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: safe(key) }));
  },
};
