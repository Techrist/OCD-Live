import "server-only";
import { randomBytes } from "node:crypto";
import { getStorage, sniffImage } from "@/server/adapters/storage";
import { db } from "@/server/db";

export const MAX_PROFILE_PHOTO_BYTES = 3 * 1024 * 1024;
const PREFIX = "/api/files/";

export type PhotoResult = { ok: true; url: string } | { ok: false; reason: "NO_PROFILE" | "INVALID_IMAGE" | "TOO_BIG" };

/** Photo du compte (aperçu sur les directs et la vitrine). Une nouvelle clé à chaque envoi : le cache navigateur est long. */
export async function setProfilePhoto(userId: string, photo: Buffer): Promise<PhotoResult> {
  const profile = await db.sellerProfile.findUnique({ where: { userId } });
  if (!profile) return { ok: false, reason: "NO_PROFILE" };
  if (photo.length > MAX_PROFILE_PHOTO_BYTES) return { ok: false, reason: "TOO_BIG" };
  const image = sniffImage(photo);
  if (!image) return { ok: false, reason: "INVALID_IMAGE" };
  const key = `profiles/${profile.id.toLowerCase()}-${randomBytes(4).toString("hex")}.${image.ext}`;
  await getStorage().put(key, photo, image.contentType);
  const url = `${PREFIX}${key}`;
  await db.sellerProfile.update({ where: { id: profile.id }, data: { photoUrl: url } });
  await removeFile(profile.photoUrl);
  return { ok: true, url };
}

export async function removeProfilePhoto(userId: string) {
  const profile = await db.sellerProfile.findUnique({ where: { userId } });
  if (!profile) return { ok: false };
  await db.sellerProfile.update({ where: { id: profile.id }, data: { photoUrl: null } });
  await removeFile(profile.photoUrl);
  return { ok: true };
}

async function removeFile(url: string | null) {
  if (url?.startsWith(`${PREFIX}profiles/`)) await getStorage().remove(url.slice(PREFIX.length)).catch(() => {});
}
