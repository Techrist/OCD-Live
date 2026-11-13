p = "src/app/[locale]/(public)/a-propos/page.tsx"
s = open(p, encoding="utf-8").read()
s = s.replace('import { Building2, Clock, Headphones, MapPin, ShieldCheck, Smartphone, Radio } from "lucide-react";', 'import { Building2, Clock, Headphones, MapPin, ShieldCheck, Smartphone, Radio } from "lucide-react";\nimport Image from "next/image";')
old = '''        <p className="text-lg">{t("studioText")}</p>'''
assert old in s
s = s.replace(old, '''        <p className="text-lg">{t("studioText")}</p>
        <div className="relative aspect-[3/2] overflow-hidden rounded-2xl"><Image src="/images/studio.webp" alt="" fill sizes="(min-width: 1024px) 960px, 100vw" className="object-cover" /></div>''')
s = s.replace('className="soft flex flex-col gap-3 rounded-[2.5rem] p-6 md:p-8"', 'className="sheet flex flex-col gap-4 p-6 md:p-8"')
s = s.replace('className="soft rounded-[2.5rem] p-6 md:p-8"', 'className="sheet p-6 md:p-8"')
s = s.replace('className="grad-btn rounded-[2.5rem] p-6 md:p-8"', 'className="rounded-[2.5rem] bg-[image:var(--hero)] p-6 text-white md:p-8"')
s = s.replace('className="grad-btn flex flex-col items-start gap-4 rounded-[2.5rem] p-6 md:flex-row md:items-center md:justify-between"', 'className="flex flex-col items-start gap-4 rounded-[2.5rem] bg-[image:var(--hero)] p-6 text-white md:flex-row md:items-center md:justify-between"')
open(p, "w", encoding="utf-8").write(s)
print("ok")
