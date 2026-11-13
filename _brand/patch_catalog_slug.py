p = "src/server/services/catalog.ts"
s = open(p, encoding="utf-8").read()
old = 'select: { id: true, name: true, icon: true } });'
assert old in s
s = s.replace(old, 'select: { id: true, slug: true, name: true, icon: true } });')
open(p, "w", encoding="utf-8").write(s)
print("ok")
