import "server-only";
import { createNeonAuth } from "@neon/auth/next/server";

// Neon Auth (Managed Better Auth) sert uniquement à « Continuer avec Google » ; nos comptes, rôles et sessions restent dans notre base.
export const neonAuth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL ?? "https://neon-auth.invalid",
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET ?? "x".repeat(32) },
});

export const googleEnabled = () => !!process.env.NEON_AUTH_BASE_URL && !!process.env.NEON_AUTH_COOKIE_SECRET;
