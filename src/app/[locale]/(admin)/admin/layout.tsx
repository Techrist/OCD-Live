import { setRequestLocale } from "next-intl/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { TEAM_ROLES } from "@/server/auth/roles";
import { requireRole } from "@/server/auth/session";

// Back-office : réservé à l'équipe. Un vendeur est redirigé vers /espace.
export default async function AdminLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireRole(locale, TEAM_ROLES);
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-5 pt-2">
      <AdminNav role={session.role} />
      {children}
    </div>
  );
}
