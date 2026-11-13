export const PLATFORMS = ["TIKTOK", "FACEBOOK", "INSTAGRAM", "YOUTUBE"] as const;
export type Platform = (typeof PLATFORMS)[number];

const HOSTS: Record<Platform, string[]> = {
  TIKTOK: ["tiktok.com"],
  FACEBOOK: ["facebook.com", "fb.watch", "fb.com"],
  INSTAGRAM: ["instagram.com"],
  YOUTUBE: ["youtube.com", "youtu.be"],
};

/** Détection de la plateforme par l'URL (section 15) ; null si le lien est mal formé ou inconnu (ANN-08). */
export function detectPlatform(input: string): { platform: Platform; url: string } | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.toLowerCase();
  for (const platform of PLATFORMS) {
    if (HOSTS[platform].some((h) => host === h || host.endsWith(`.${h}`))) return { platform, url: url.toString() };
  }
  return null;
}
