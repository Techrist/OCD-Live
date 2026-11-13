p = "src/app/[locale]/(vendeur)/espace/page.tsx"
s = open(p, encoding="utf-8").read()
s = s.replace('import { CalendarPlus, ListChecks } from "lucide-react";', 'import { BadgeDollarSign, BarChart3, CalendarPlus, ListChecks, Radio, Store } from "lucide-react";')
s = s.replace('''      <BigActionButton href="/espace/reservations" icon={<ListChecks />} label={t("bookings")} variant="light" />''', '''      <BigActionButton href="/espace/reservations" icon={<ListChecks />} label={t("bookings")} variant="light" />
      <BigActionButton href="/espace/soumettre-live" icon={<Radio />} label={t("submitLive")} variant="light" />
      <BigActionButton href="/espace/abonnement" icon={<BadgeDollarSign />} label={t("subscription")} variant="light" />
      <BigActionButton href="/espace/vitrine" icon={<Store />} label={t("showcase")} variant="light" />
      <BigActionButton href="/espace/statistiques" icon={<BarChart3 />} label={t("stats")} variant="light" />''')
open(p, "w", encoding="utf-8").write(s)

p = "src/components/bottom-nav.tsx"
s = open(p, encoding="utf-8").read()
s = s.replace('import { CalendarPlus, House, UserRound, type LucideIcon } from "lucide-react";', 'import { CalendarPlus, House, Radio, UserRound, type LucideIcon } from "lucide-react";')
s = s.replace('href: "/" | "/reserver" | "/espace"; icon: LucideIcon; key: "home" | "book" | "space"', 'href: "/" | "/reserver" | "/lives" | "/espace"; icon: LucideIcon; key: "home" | "book" | "lives" | "space"')
s = s.replace('  { href: "/espace", icon: UserRound, key: "space" },', '  { href: "/lives", icon: Radio, key: "lives" },\n  { href: "/espace", icon: UserRound, key: "space" },')
open(p, "w", encoding="utf-8").write(s)

p = "src/components/admin/admin-nav.tsx"
s = open(p, encoding="utf-8").read()
s = s.replace('  { href: "/admin/calendrier",', '  { href: "/admin/validation", key: "validation", roles: ["ADMIN", "VALIDATOR"] },\n  { href: "/admin/calendrier",')
open(p, "w", encoding="utf-8").write(s)
print("ok")
