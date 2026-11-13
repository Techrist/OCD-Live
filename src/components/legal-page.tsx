import { getTranslations } from "next-intl/server";

type Section = { h?: string; p: string };

/** Page de texte (à propos, conditions, confidentialité) : titres et paragraphes lus dans messages/*.json. */
export async function LegalPage({ ns, sections }: { ns: "about" | "terms" | "privacy"; sections: { h?: string; p: string }[] | string[] }) {
  const t = await getTranslations(`legal.${ns}`);
  const list: Section[] = (sections as (string | Section)[]).map((s) => (typeof s === "string" ? { p: s } : s));
  return (
    <article className="band flex w-full flex-col gap-6 bg-white py-12 md:py-16">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <div className="flex max-w-3xl flex-col gap-5">
        {list.map((s, i) => (
          <section key={i} className="flex flex-col gap-1">
            {s.h && <h2 className="text-lg font-bold">{t(s.h)}</h2>}
            <p className="leading-relaxed">{t(s.p)}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
