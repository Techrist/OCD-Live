import { describe, expect, it } from "vitest";
import { OTP_POLICY, requestOtp, verifyOtp, type OtpRecord, type OtpStore } from "@/server/auth/otp";

const SECRET = "test-secret-test-secret-test-secret-123";
const PHONE = "+22890000001";

function memoryStore(): OtpStore & { rows: (OtpRecord & { createdAt: Date })[] } {
  const rows: (OtpRecord & { createdAt: Date })[] = [];
  let n = 0;
  return {
    rows,
    async create(d) {
      const r = { id: `o${++n}`, ...d, attempts: 0, lockedUntil: null, createdAt: new Date() };
      rows.push(r);
      return r;
    },
    async latest(phone) {
      return [...rows].reverse().find((r) => r.identifier === phone) ?? null;
    },
    async countSince(phone, since) {
      return rows.filter((r) => r.identifier === phone && r.createdAt >= since).length;
    },
    async activeLock(phone, now) {
      return rows.find((r) => r.identifier === phone && r.lockedUntil && r.lockedUntil > now)?.lockedUntil ?? null;
    },
    async update(id, patch) {
      Object.assign(rows.find((r) => r.id === id)!, patch);
    },
    async remove(id) {
      rows.splice(rows.findIndex((r) => r.id === id), 1);
    },
  };
}

const noSend = async () => {};

describe("OTP (VEN-01)", () => {
  it("un bon code ouvre la session et ne sert qu'une fois", async () => {
    const store = memoryStore();
    const req = await requestOtp(store, noSend, PHONE, SECRET);
    if (!req.ok) throw new Error("demande refusée");
    expect(req.code).toMatch(/^\d{6}$/);
    expect(await verifyOtp(store, PHONE, req.code, SECRET)).toEqual({ ok: true });
    expect((await verifyOtp(store, PHONE, req.code, SECRET)).ok).toBe(false);
  });

  it("n'enregistre jamais le code en clair", async () => {
    const store = memoryStore();
    const req = await requestOtp(store, noSend, PHONE, SECRET);
    if (!req.ok) throw new Error();
    expect(store.rows[0].codeHash).not.toContain(req.code);
  });

  it("au 6e code faux, le numéro est bloqué 15 minutes", async () => {
    const store = memoryStore();
    const now = new Date("2026-12-01T10:00:00Z");
    await requestOtp(store, noSend, PHONE, SECRET, now);
    for (let i = 1; i <= OTP_POLICY.maxAttempts; i++) {
      const r = await verifyOtp(store, PHONE, "000000", SECRET, now);
      expect(r).toMatchObject({ ok: false, reason: "WRONG", attemptsLeft: OTP_POLICY.maxAttempts - i });
    }
    const sixth = await verifyOtp(store, PHONE, "000000", SECRET, now);
    expect(sixth).toMatchObject({ ok: false, reason: "LOCKED" });
    // Toujours bloqué 14 min plus tard, y compris pour une nouvelle demande de code.
    const later = new Date(now.getTime() + 14 * 60_000);
    expect(await requestOtp(store, noSend, PHONE, SECRET, later)).toMatchObject({ ok: false, reason: "LOCKED" });
    // Libéré après 15 min.
    const free = new Date(now.getTime() + 16 * 60_000);
    expect((await requestOtp(store, noSend, PHONE, SECRET, free)).ok).toBe(true);
  });

  it("limite à 3 demandes par 10 minutes et par numéro", async () => {
    const store = memoryStore();
    for (let i = 0; i < OTP_POLICY.requestLimit; i++) expect((await requestOtp(store, noSend, PHONE, SECRET)).ok).toBe(true);
    expect(await requestOtp(store, noSend, PHONE, SECRET)).toEqual({ ok: false, reason: "RATE_LIMITED" });
    expect((await requestOtp(store, noSend, "+22890000002", SECRET)).ok).toBe(true);
  });

  it("refuse un code expiré (5 min)", async () => {
    const store = memoryStore();
    const now = new Date("2026-12-01T10:00:00Z");
    const req = await requestOtp(store, noSend, PHONE, SECRET, now);
    if (!req.ok) throw new Error();
    const late = new Date(now.getTime() + OTP_POLICY.ttlMs + 1000);
    expect(await verifyOtp(store, PHONE, req.code, SECRET, late)).toEqual({ ok: false, reason: "EXPIRED" });
  });
});
