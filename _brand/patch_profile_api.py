p = "src/app/api/seller/profile/route.ts"
s = open(p, encoding="utf-8").read()
s = s.replace('  activity: z.string().trim().min(1).max(120),\n', '  activity: z.string().trim().max(120).optional(),\n')
s = s.replace('  city: z.string().trim().min(1).max(80),', '  city: z.string().trim().max(80).default(""),')
s = s.replace('''    await db.user.update({ where: { id: session.sub }, data: { name: d.name, countryCode: d.countryCode, city: d.city } });''', '''    await db.user.update({ where: { id: session.sub }, data: { name: d.name, countryCode: d.countryCode, city: d.city || null } });''')
s = s.replace('const data = { shopName: d.shopName, activity: d.activity, categoryId: d.categoryId };', 'const data = { shopName: d.shopName, activity: d.activity?.trim() || category.name, categoryId: d.categoryId };')
s = s.replace('profile: p && user?.name && user.countryCode && user.city\n      ? { name: user.name, shopName: p.shopName, activity: p.activity, categoryId: p.categoryId, countryCode: user.countryCode, city: user.city }', 'profile: p && user?.name && user.countryCode\n      ? { name: user.name, shopName: p.shopName, activity: p.activity, categoryId: p.categoryId, countryCode: user.countryCode, city: user.city ?? "" }')
open(p, "w", encoding="utf-8").write(s)
print("ok")
