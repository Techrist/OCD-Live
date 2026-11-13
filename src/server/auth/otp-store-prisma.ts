import "server-only";
import { db } from "@/server/db";
import type { OtpStore } from "./otp";

export const prismaOtpStore: OtpStore = {
  create: (data) => db.otpCode.create({ data }),
  latest: (phone) => db.otpCode.findFirst({ where: { phone }, orderBy: { createdAt: "desc" } }),
  countSince: (phone, since) => db.otpCode.count({ where: { phone, createdAt: { gte: since } } }),
  async activeLock(phone, now) {
    const row = await db.otpCode.findFirst({
      where: { phone, lockedUntil: { gt: now } },
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
