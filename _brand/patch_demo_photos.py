def edit(path, pairs):
    s = open(path, encoding="utf-8").read()
    for a, b in pairs:
        assert a in s, (path, a[:70])
        s = s.replace(a, b, 1)
    open(path, "w", encoding="utf-8").write(s)

# Une photo de démonstration est un fichier de public/images (chemin commençant par « / ») ; les autres vont dans le stockage.
edit("src/server/services/shop.ts", [
    ("photoUrl: r.photoKey ? await getStorage().getUrl(r.photoKey) : null,",
     "photoUrl: r.photoKey ? (r.photoKey.startsWith(\"/\") ? r.photoKey : await getStorage().getUrl(r.photoKey)) : null,"),
    ("if (product.photoKey) await getStorage().remove(product.photoKey).catch(() => {});",
     "if (product.photoKey && !product.photoKey.startsWith(\"/\")) await getStorage().remove(product.photoKey).catch(() => {});"),
])
edit("src/lib/live-image.ts", [
    ("if (input.productPhotoKey) return { src: `/api/files/${input.productPhotoKey}`, own: true };",
     "if (input.productPhotoKey) return { src: input.productPhotoKey.startsWith(\"/\") ? input.productPhotoKey : `/api/files/${input.productPhotoKey}`, own: true };"),
])
edit("prisma/seed.ts", [
    ("for (const prod of demoProductsFor(cat)) {", "for (const prod of demoProductsFor(cat, i)) {"),
])
edit("scripts/refresh-demo.mts", [
    ("for (const d of demo) {\n  for (const prod of demoProductsFor(d.category.slug)) {\n    const exists = await p.product.findFirst({ where: { sellerId: d.userId, name: prod.name } });\n    if (!exists) { await p.product.create({ data: { sellerId: d.userId, categoryId: d.categoryId, ...prod } }); products++; }\n  }\n}",
     "// Les produits des vendeurs de démonstration sont recréés à chaque fois (noms et photos à jour).\nawait p.product.deleteMany({ where: { sellerId: { in: demo.map((d) => d.userId) } } });\nfor (const d of demo) {\n  const index = Number(d.slug.replace(\"demo-\", \"\")) - 1;\n  for (const prod of demoProductsFor(d.category.slug, index)) {\n    await p.product.create({ data: { sellerId: d.userId, categoryId: d.categoryId, ...prod } });\n    products++;\n  }\n}"),
    ("select: { userId: true, categoryId: true, category: { select: { slug: true } } } });", "select: { userId: true, slug: true, categoryId: true, category: { select: { slug: true } } } });"),
])
print("ok")
