import { expect, test } from "@playwright/test";

// Garde-fou : aucun texte ne doit manquer dans messages/fr.json et messages/en.json sur les écrans du parcours.
const DRAFTS: Record<string, object> = {
  "reserver/mode": {},
  "reserver/vendeur": { mode: "REMOTE" },
  "reserver/package": { mode: "REMOTE", sellerDone: true, countryCode: "CM" },
  "reserver/creneau": { mode: "REMOTE", sellerDone: true, countryCode: "CM", packageSlug: "essai" },
};

for (const locale of ["fr", "en"]) {
  for (const [path, draft] of Object.entries(DRAFTS)) {
    test(`aucune clé de traduction manquante : /${locale}/${path}`, async ({ page }) => {
      const problems: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error" && /MISSING_MESSAGE|Could not resolve/.test(m.text())) problems.push(m.text().slice(0, 160));
      });
      await page.goto(`/${locale}`);
      await page.evaluate((d) => localStorage.setItem("ocd:booking:v1", JSON.stringify(d)), draft);
      await page.goto(`/${locale}/${path}`);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("h1")).toBeVisible();
      expect(problems).toEqual([]);
    });
  }
}

for (const locale of ["fr", "en"]) {
  for (const path of ["", "lives", "shop", "a-propos"]) {
    test(`pages publiques sans clé manquante : /${locale}/${path}`, async ({ page }) => {
      const problems: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error" && /MISSING_MESSAGE|Could not resolve/.test(m.text())) problems.push(m.text().slice(0, 160));
      });
      const res = await page.goto(`/${locale}/${path}`);
      expect(res?.status()).toBe(200);
      await page.waitForLoadState("networkidle");
      expect(problems).toEqual([]);
    });
  }
}
