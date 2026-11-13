-- CreateEnum
CREATE TYPE "StatType" AS ENUM ('VIEW', 'LIVE_CLICK', 'WHATSAPP_CLICK');

-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'PENDING';

-- CreateTable
CREATE TABLE "StatEvent" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "type" "StatType" NOT NULL,
    "visitorId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StatEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitlistEntry" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StatEvent_sellerId_day_idx" ON "StatEvent"("sellerId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "StatEvent_sellerId_type_visitorId_day_key" ON "StatEvent"("sellerId", "type", "visitorId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_slotId_sellerId_key" ON "WaitlistEntry"("slotId", "sellerId");

