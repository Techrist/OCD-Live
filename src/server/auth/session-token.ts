import { jwtVerify, SignJWT } from "jose";

// Pur (compatible proxy/edge) : signature et lecture du jeton de session.
export const SESSION_COOKIE = "ocd_session";
export const SESSION_MAX_AGE_S = 30 * 24 * 3600;

export const ROLES = ["SELLER", "VALIDATOR", "ASSISTANT", "STUDIO", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];
export type SessionPayload = { sub: string; role: Role; phone: string; email?: string };

function key(secret: string) {
  if (secret.length < 32) throw new Error("SESSION_SECRET doit faire 32 caractères minimum");
  return new TextEncoder().encode(secret);
}

export function getSecret(): string {
  return process.env.SESSION_SECRET ?? "";
}

export async function signSessionToken(payload: SessionPayload, secret: string, maxAgeS = SESSION_MAX_AGE_S) {
  return new SignJWT({ role: payload.role, phone: payload.phone, ...(payload.email ? { email: payload.email } : {}) })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeS}s`)
    .sign(key(secret));
}

export async function verifySessionToken(token: string, secret: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key(secret), { algorithms: ["HS256"] });
    const role = payload.role as Role;
    if (!payload.sub || !ROLES.includes(role) || typeof payload.phone !== "string") return null;
    return { sub: payload.sub, role, phone: payload.phone, ...(typeof payload.email === "string" ? { email: payload.email } : {}) };
  } catch {
    return null;
  }
}
