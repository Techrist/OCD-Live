p = "src/server/services/reservations.ts"
s = open(p, encoding="utf-8").read()
s = s.replace('import { notifyWaitlist } from "./notifications";', 'import { notifyWaitlist } from "./notifications";\nimport { syncProductsFromSheet } from "./shop";')
old = '''  return { ok: res.count > 0 };
}

export type CheckInResult'''
assert old in s
s = s.replace(old, '''  if (res.count > 0) await syncProductsFromSheet(sellerId, sheet.products); // SHP-03 : alimente la vitrine et le shop
  return { ok: res.count > 0 };
}

export type CheckInResult''')
open(p, "w", encoding="utf-8").write(s)
print("ok")
