import { describe, expect, it } from "vitest";
import { assertRole, ForbiddenError, hasRole, homeFor, TEAM_ROLES } from "@/server/auth/roles";
import { signSessionToken, verifySessionToken } from "@/server/auth/session-token";

const SECRET = "test-secret-test-secret-test-secret-123";
const seller = { sub: "u1", role: "SELLER", phone: "+237690000005" } as const;

describe("session signée", () => {
  it("aller-retour du jeton", async () => {
    const token = await signSessionToken(seller, SECRET);
    expect(await verifySessionToken(token, SECRET)).toEqual(seller);
  });

  it("refuse un jeton falsifié, une autre clé ou un jeton expiré", async () => {
    const token = await signSessionToken(seller, SECRET);
    expect(await verifySessionToken(token.slice(0, -2) + "xx", SECRET)).toBeNull();
    expect(await verifySessionToken(token, "autre-secret-autre-secret-autre-secret-1")).toBeNull();
    const expired = await signSessionToken(seller, SECRET, -10);
    expect(await verifySessionToken(expired, SECRET)).toBeNull();
  });

  it("refuse une clé trop courte", async () => {
    await expect(signSessionToken(seller, "court")).rejects.toThrow();
  });
});

describe("rôles côté serveur", () => {
  it("un vendeur n'accède pas au back-office, l'équipe oui", () => {
    expect(hasRole(seller, TEAM_ROLES)).toBe(false);
    expect(hasRole({ ...seller, role: "ADMIN" }, TEAM_ROLES)).toBe(true);
    expect(hasRole(null, TEAM_ROLES)).toBe(false);
  });

  it("assertRole lève une erreur sans le bon rôle", () => {
    expect(() => assertRole(seller, ["ADMIN"])).toThrow(ForbiddenError);
    expect(assertRole({ ...seller, role: "ADMIN" }, ["ADMIN"]).role).toBe("ADMIN");
  });

  it("redirige chaque rôle vers son espace", () => {
    expect(homeFor("SELLER")).toBe("/espace");
    expect(homeFor("VALIDATOR")).toBe("/admin");
  });
});
