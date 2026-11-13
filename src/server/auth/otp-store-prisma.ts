import "server-only";
import { db } from "@/server/db";
import type { OtpStore } from "./otp";

export const prismaOtpStore: OtpStore = {
  create: (data) => db.otpCode.create({ data }),
  latest: (identifier) => db.otpCode.findFirst({ where: { identifier }, orderBy: { createdAt: "desc" } }),
  countSince: (identifier, since) => db.otpCode.count({ where: { identifier, createdAt: { gte: since } } }),
  async activeLock(identifier, now) {
    const row = await db.otpCode.findFirst({
      where: { identifier, lockedUntil: { gt: now } },
      orderBy: { lockedUntil: "desc" },
    });
    return row?.lockedUntil ?? null;
  },
  async update(id, patch) {
    await db.otpCode.update({ where: { id }, data: patch });
  },
  async remove(id) {
    await db.otpCode.delete({ where: { id } });
  },
};
