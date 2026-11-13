p = "src/app/[locale]/(public)/page.tsx"
s = open(p, encoding="utf-8").read()
old = '''            </div>

          </div>

          <div className="flex w-full flex-col gap-3 lg:grid lg:grid-cols-2">'''
new = '''            </div>
          </div>
          <AudioHint
            text={t("home.audio")}
            lang={locale === "fr" ? "fr-FR" : "en-US"}
            listenLabel={t("audio.listen")}
            stopLabel={t("audio.stop")}
            label={t("audio.short")}
          />

          <div className="flex w-full flex-col gap-3 lg:grid lg:grid-cols-2">'''
assert old in s
open(p, "w", encoding="utf-8").write(s.replace(old, new))
print("ok")
