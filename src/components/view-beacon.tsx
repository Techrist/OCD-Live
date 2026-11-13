"use client";

import { useEffect } from "react";

/** Compte une vue de la vitrine (une fois par visiteur et par jour, décidé côté serveur). */
export function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    void fetch("/api/stats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }) }).catch(() => {});
  }, [slug]);
  return null;
}
