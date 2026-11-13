def edit(path, pairs):
    s = open(path, encoding="utf-8").read()
    for a, b in pairs:
        assert a in s, (path, a[:70])
        s = s.replace(a, b, 1)
    open(path, "w", encoding="utf-8").write(s)

IMG = "image: liveImage({ profilePhoto: l.seller.sellerProfile?.photoUrl, productPhotoKey: l.seller.products[0]?.photoKey, categorySlug: l.category.slug }).src,"

edit("src/app/[locale]/(public)/lives/page.tsx", [
    ('import { LiveCard } from "@/components/lives/live-card";', 'import { LiveCard } from "@/components/lives/live-card";\nimport { liveImage } from "@/lib/live-image";'),
    ("country: { code: l.countryCode, name: names.get(l.countryCode) ?? l.countryCode },", "country: { code: l.countryCode, name: names.get(l.countryCode) ?? l.countryCode },\n                  " + IMG),
])
edit("src/app/[locale]/(public)/lives/[pays]/page.tsx", [
    ('import { LiveCard } from "@/components/lives/live-card";', 'import { LiveCard } from "@/components/lives/live-card";\nimport { liveImage } from "@/lib/live-image";'),
    ("category: l.category, slug: l.seller.sellerProfile?.slug ?? null, verified: !!l.seller.sellerProfile?.verified,\n              }}", "category: l.category, slug: l.seller.sellerProfile?.slug ?? null, verified: !!l.seller.sellerProfile?.verified,\n                " + IMG + "\n              }}"),
])
print("ok")
