import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const PAGES = ["", "/reserver/mode", "/shop","/a-propos", "/conditions", "/confidentialite"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return PAGES.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${base}/${locale}${path}`,
      changeFrequency: path === "" ? ("daily" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.6,
      alternates: { languages: Object.fromEntries(routing.locales.map((l) => [l, `${base}/${l}${path}`])) },
    })),
  );
}
