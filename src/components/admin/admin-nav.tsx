import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Role } from "@/server/auth/session-token";

const LINKS: { href: string; key: string; roles: Role[] }[] = [
  { href: "/admin", key: "today", roles: ["ADMIN", "VALIDATOR", "ASSISTANT", "STUDIO"] },
  { href: "/admin/reservations", key: "bookings", roles: ["ADMIN", "STUDIO"] },
  { href: "/admin/validation", key: "validation", roles: ["ADMIN", "VALIDATOR"] },
  { href: "/admin/calendrier", key: "calendar", roles: ["ADMIN"] },
  { href: "/admin/packages", key: "packages", roles: ["ADMIN"] },
  { href: "/admin/notifications", key: "notifications", roles: ["ADMIN"] },
  { href: "/admin/journal", key: "journal", roles: ["ADMIN"] },
  { href: "/admin/parametres", key: "settings", roles: ["ADMIN"] },
];

/** Menu du back-office : chaque rôle ne voit que ses pages (les pages re-vérifient côté serveur). */
export async function AdminNav({ role }: { role: Role }) {
  const t = await getTranslations("admin.nav");
  return (
    <nav aria-label="Back-office" className="-mx-5 overflow-x-auto px-5 pb-1">
      <ul className="flex w-max gap-2">
        {LINKS.filter((l) => l.roles.includes(role)).map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="soft inline-flex min-h-12 items-center rounded-full px-5 font-bold whitespace-nowrap">
              {t(l.key)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
