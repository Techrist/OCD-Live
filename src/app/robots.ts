import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/dev/", "/fr/admin", "/en/admin", "/fr/espace", "/en/espace", "/fr/connexion", "/en/connexion"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
