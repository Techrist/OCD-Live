import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { getSecret, SESSION_COOKIE, verifySessionToken } from "./server/auth/session-token";

// Next.js 16 : « proxy » remplace « middleware ». / redirige vers /fr.
const intl = createMiddleware(routing);

const PROTECTED = /^\/(fr|en)\/(espace|admin)(\/|$)/;

// Contrôle optimiste : pas de session valide => /connexion. Le rôle exact est re-vérifié
// côté serveur dans chaque layout (requireRole) et chaque Server Action (assertRole).
export default async function proxy(req: NextRequest) {
  const match = req.nextUrl.pathname.match(PROTECTED);
  if (match) {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const session = token ? await verifySessionToken(token, getSecret()) : null;
    if (!session) return NextResponse.redirect(new URL(`/${match[1]}/connexion`, req.url));
  }
  return intl(req);
}

export const config = {
  matcher: ["/((?!api|dev|_next|_vercel|.*\\..*).*)"],
};
