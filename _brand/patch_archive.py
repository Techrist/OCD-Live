def edit(path, pairs):
    s = open(path, encoding="utf-8").read()
    for a, b in pairs:
        if a not in s:
            print("MISSING in", path, ":", a[:70])
        s = s.replace(a, b)
    open(path, "w", encoding="utf-8").write(s)

edit("src/server/services/directory.ts", [(
'''export async function archiveExpiredLives(now: Date = new Date()): Promise<number> {
  const res = await db.liveSubmission.updateMany({
    where: { status: { in: ["PUBLISHED", "PENDING"] }, expiresAt: { lte: now } },''',
'''export async function archiveExpiredLives(now: Date = new Date(), onlySellerIds?: string[]): Promise<number> {
  const res = await db.liveSubmission.updateMany({
    where: { status: { in: ["PUBLISHED", "PENDING"] }, expiresAt: { lte: now }, ...(onlySellerIds ? { sellerId: { in: onlySellerIds } } : {}) },''')])
edit("tests/integration/v1.test.ts", [("dir.archiveExpiredLives(afterWindow)", "dir.archiveExpiredLives(afterWindow, made.users)")])
edit("prisma/seed.ts", [("expiresAt: new Date(now.getTime() + 3 * 3_600_000)", "expiresAt: new Date(now.getTime() + 7 * 86_400_000)")])
print("ok")
