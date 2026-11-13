import type { Role, SessionPayload } from "./session-token";

export const TEAM_ROLES: Role[] = ["ADMIN", "VALIDATOR", "ASSISTANT", "STUDIO"];

export class ForbiddenError extends Error {
  constructor() {
    super("Accès refusé");
  }
}

export function hasRole(session: SessionPayload | null, allowed: Role[]): boolean {
  return !!session && allowed.includes(session.role);
}

/** À appeler au début de chaque Server Action : le rôle est toujours vérifié côté serveur. */
export function assertRole(session: SessionPayload | null, allowed: Role[]): SessionPayload {
  if (!session || !allowed.includes(session.role)) throw new ForbiddenError();
  return session;
}

/** Page d'accueil après connexion selon le rôle. */
export function homeFor(role: Role): "/espace" | "/admin" {
  return role === "SELLER" ? "/espace" : "/admin";
}
