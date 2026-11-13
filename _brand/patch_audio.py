def edit(path, pairs):
    s = open(path, encoding="utf-8").read()
    for a, b in pairs:
        if a not in s:
            print("MISSING in", path, ":", a[:70])
        s = s.replace(a, b)
    open(path, "w", encoding="utf-8").write(s)

edit("src/components/ui/audio-hint.tsx", [
    ("  stopLabel: string;\n};", "  stopLabel: string;\n  /** Texte court affiché à côté de l'icône (ex. « Écouter ») : pastille comme dans la maquette. */\n  label?: string;\n};"),
    ("export function AudioHint({ text, src, lang = \"fr-FR\", listenLabel, stopLabel }: Props) {", "export function AudioHint({ text, src, lang = \"fr-FR\", listenLabel, stopLabel, label }: Props) {"),
    ('className="soft grid size-12 shrink-0 place-items-center rounded-full"', 'className={label ? "soft flex min-h-12 shrink-0 items-center gap-2 rounded-full px-4 font-bold" : "soft grid size-12 shrink-0 place-items-center rounded-full"}'),
    ('{playing ? <Square className="size-5" aria-hidden="true" /> : <Volume2 className="size-6" aria-hidden="true" />}', '{playing ? <Square className="size-5" aria-hidden="true" /> : <Volume2 className="size-6" aria-hidden="true" />}\n      {label && <span>{label}</span>}'),
])
edit("src/app/[locale]/(public)/reserver/layout.tsx", [("max-w-md flex-col gap-6 px-4 pt-4", "max-w-5xl flex-col gap-6 px-5 pt-2")])
print("ok")
