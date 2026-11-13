import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

// Politique OTP de la section 17/19 : code à 6 chiffres, expire en 5 min, 5 tentatives,
// 3 demandes par 10 min et par identifiant, blocage de 15 min au 6e code faux.
export const OTP_POLICY = {
  ttlMs: 5 * 60_000,
  maxAttempts: 5,
  requestLimit: 3,
  requestWindowMs: 10 * 60_000,
  lockMs: 15 * 60_000,
} as const;

export type OtpRecord = {
  id: string;
  identifier: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  lockedUntil: Date | null;
};

export interface OtpStore {
  create(data: { identifier: string; codeHash: string; expiresAt: Date }): Promise<OtpRecord>;
  latest(identifier: string): Promise<OtpRecord | null>;
  countSince(identifier: string, since: Date): Promise<number>;
  activeLock(identifier: string, now: Date): Promise<Date | null>;
  update(id: string, patch: { attempts?: number; lockedUntil?: Date }): Promise<void>;
  remove(id: string): Promise<void>;
}

export type OtpSender = (identifier: string, code: string) => Promise<void>;

export type RequestResult =
  | { ok: true; code: string }
  | { ok: false; reason: "LOCKED"; until: Date }
  | { ok: false; reason: "RATE_LIMITED" };

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "LOCKED"; until: Date }
  | { ok: false; reason: "EXPIRED" }
  | { ok: false; reason: "WRONG"; attemptsLeft: number };

export function hashCode(code: string, secret: string): string {
  return createHmac("sha256", secret).update(code).digest("hex");
}

export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function requestOtp(
  store: OtpStore,
  send: OtpSender,
  identifier: string,
  secret: string,
  now: Date = new Date(),
): Promise<RequestResult> {
  const lock = await store.activeLock(identifier, now);
  if (lock) return { ok: false, reason: "LOCKED", until: lock };
  const recent = await store.countSince(identifier, new Date(now.getTime() - OTP_POLICY.requestWindowMs));
  if (recent >= OTP_POLICY.requestLimit) return { ok: false, reason: "RATE_LIMITED" };
  const code = generateCode();
  await store.create({ identifier, codeHash: hashCode(code, secret), expiresAt: new Date(now.getTime() + OTP_POLICY.ttlMs) });
  await send(identifier, code);
  return { ok: true, code };
}

export async function verifyOtp(
  store: OtpStore,
  identifier: string,
  code: string,
  secret: string,
  now: Date = new Date(),
): Promise<VerifyResult> {
  const lock = await store.activeLock(identifier, now);
  if (lock) return { ok: false, reason: "LOCKED", until: lock };
  const record = await store.latest(identifier);
  if (!record || record.expiresAt <= now) return { ok: false, reason: "EXPIRED" };

  // Le 6e essai est refusé : le numéro est bloqué 15 minutes.
  if (record.attempts >= OTP_POLICY.maxAttempts) {
    const until = new Date(now.getTime() + OTP_POLICY.lockMs);
    await store.update(record.id, { lockedUntil: until });
    return { ok: false, reason: "LOCKED", until };
  }

  const expected = Buffer.from(record.codeHash, "hex");
  const given = Buffer.from(hashCode(code, secret), "hex");
  if (expected.length === given.length && timingSafeEqual(expected, given)) {
    await store.remove(record.id);
    return { ok: true };
  }
  const attempts = record.attempts + 1;
  await store.update(record.id, { attempts });
  return { ok: false, reason: "WRONG", attemptsLeft: OTP_POLICY.maxAttempts - attempts };
}
