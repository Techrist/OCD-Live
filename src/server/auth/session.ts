import "server-only";
import { cookies } from "next/headers";
import { redirect } from "@/i18n/navigation";
import { hasRole, homeFor } from "./roles";
import {
  getSecret,
  SESSION_COOKIE,
  SESSION_MAX_AGE_S,
  signSessionToken,
  verifySessionToken,
  type Role,
  type SessionPayload,
} from "./session-token";

export async function startSession(payload: SessionPayload) {
  const token = await signSessionToken(payload, getSecret());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function readSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? verifySessionToken(token, getSecret()) : null;
}

/** Pour les pages et layouts : redirige vers la connexion, ou vers l'espace du rôle si l'accès est refusé. */
export async function requireRole(locale: string, allowed: Role[]): Promise<SessionPayload> {
  const session = await readSession();
  if (!session) return redirect({ href: "/connexion", locale });
  if (!hasRole(session, allowed)) return redirect({ href: homeFor(session.role), locale });
  return session;
}
