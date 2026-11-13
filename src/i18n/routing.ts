import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "always",
  localeDetection: false, // « / » redirige toujours vers /fr (section 18)
});

export type Locale = (typeof routing.locales)[number];
