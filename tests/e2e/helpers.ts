import "dotenv/config";
import { Client } from "pg";
import { expect, type Page } from "@playwright/test";
import { signSessionToken, SESSION_COOKIE, type Role } from "../../src/server/auth/session-token";

/** Connexion d'un compte du seed sans passer par l'OTP (évite la limite de 3 codes par 10 min et les collisions entre projets). */
export async function loginAs(page: Page, phone: string) {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  const { rows } = await db.query<{ id: string; role: Role }>('SELECT id, role FROM "User" WHERE phone = $1', [phone]);
  await db.end();
  expect(rows[0], `compte de test ${phone} introuvable : lancer npm run db:reset`).toBeTruthy();
  const token = await signSessionToken({ sub: rows[0].id, role: rows[0].role, phone }, process.env.SESSION_SECRET!);
  await page.context().addCookies([{ name: SESSION_COOKIE, value: token, url: "http://localhost:3000" }]);
}

/** Nouveau vendeur : parcours OTP réel de l'API (le code est renvoyé en développement). */
export async function loginNewSeller(page: Page) {
  const phone = `+2376${String(Date.now()).slice(-8)}`;
  const email = `e2e-${Date.now()}-${Math.floor(Math.random() * 1e4)}@ocdlive.test`;
  const req = await page.request.post("/api/auth/otp/request", { data: { email } });
  const { devCode, needsPhone } = await req.json();
  expect(needsPhone).toBe(true);
  const res = await page.request.post("/api/auth/otp/verify", { data: { email, code: devCode, phone } });
  expect((await res.json()).ok).toBe(true);
}
