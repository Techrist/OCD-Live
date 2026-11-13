"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export function LogoutButton() {
  const t = useTranslations("login");
  const router = useRouter();
  return (
    <button
      type="button"
      className="soft min-h-12 rounded-full px-5 font-bold"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
    >
      {t("logout")}
    </button>
  );
}
