import { setRequestLocale } from "next-intl/server";
import { EspaceNav } from "@/components/espace/espace-nav";
import { requireRole } from "@/server/auth/session";

// Espace vendeur : réservé au rôle SELLER (un membre de l'équipe est renvoyé vers /admin).
export default async function EspaceLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole(locale, ["SELLER"]);
  return (
    <>
      <EspaceNav />
      <div className="pt-6 pb-10">{children}</div>
    </>
  );
}
