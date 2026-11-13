import re

p = "src/app/[locale]/(public)/page.tsx"
s = open(p, encoding="utf-8").read()

# Retire l'aperçu « N lives en direct » : le bandeau « En direct maintenant » le remplace.
s = s[: s.index("/** Lives publiés")] + s[s.index("export default async function HomePage"):]
s = s.replace('import { Building2, Home, Radio } from "lucide-react";', 'import { Building2, Home, Lock, MessageCircle } from "lucide-react";')
s = s.replace('import { db } from "@/server/db";\n', "")
s = s.replace("  const [t, stats] = await Promise.all([getTranslations(), liveStats()]);", "  const t = await getTranslations();")
a = s.index("          {stats && (")
b = s.index('          <div className="flex w-full flex-col gap-3">')
s = s[:a] + s[b:]

# Bouton audio sous le texte d'accroche (pastille « Écouter »).
a = s.index('            <AudioHint')
b = s.index("          </div>\n", s.index("/>", a))
audio_block = s[a : s.index("/>", a) + 2]
s = s.replace(audio_block, "")
s = s.replace('''              <p className="mt-2 text-lg text-ink/80">{t("home.lead")}</p>
            </div>
          </div>''', '''              <p className="mt-2 text-lg text-ink/80">{t("home.lead")}</p>
            </div>
          </div>
          <AudioHint
            text={t("home.audio")}
            lang={locale === "fr" ? "fr-FR" : "en-US"}
            listenLabel={t("audio.listen")}
            stopLabel={t("audio.stop")}
            label={t("audio.short")}
          />''')

# Deux boutons côte à côte sur grand écran + ligne de confiance.
s = s.replace('<div className="flex w-full flex-col gap-3">', '<div className="flex w-full flex-col gap-3 lg:grid lg:grid-cols-2">')
s = s.replace('''            <BigActionButton href="/reserver/mode?mode=REMOTE" icon={<Home />} label={t("home.remote")} hint={t("home.remoteHint")} variant="ink" />
          </div>''', '''            <BigActionButton href="/reserver/mode?mode=REMOTE" icon={<Home />} label={t("home.remote")} hint={t("home.remoteHint")} variant="ink" />
          </div>
          <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-bold text-ink/70">
            <span className="inline-flex items-center gap-1"><Lock aria-hidden="true" className="size-4 text-wa" /> {t("home.trust1")}</span>
            <span className="inline-flex items-center gap-1"><MessageCircle aria-hidden="true" className="size-4 text-copper-800" /> {t("home.trust2")}</span>
          </p>''')
# ResumeBanner reste au-dessus des boutons (dans la grille : pleine largeur)
s = s.replace("<ResumeBanner />", '<div className="lg:col-span-2"><ResumeBanner /></div>')
s = s.replace('export const dynamic = "force-dynamic";\n\n', 'export const dynamic = "force-dynamic";\n\n', 1)
open(p, "w", encoding="utf-8").write(s)
print("ok")
