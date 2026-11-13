import re

def edit(path, pairs):
    s = open(path, encoding="utf-8").read()
    for a, b in pairs:
        if a not in s:
            print("MISSING in", path, ":", a[:70])
        s = s.replace(a, b)
    open(path, "w", encoding="utf-8").write(s)

edit("src/lib/format.ts", [("/** 90 -> « 1h30 »", "/** Majuscule à la première lettre seulement (les jours et mois s'écrivent en minuscules en français). */\nexport const ucfirst = (s: string): string => (s ? s[0].toUpperCase() + s.slice(1) : s);\n\n/** 90 -> « 1h30 »")])

edit("src/components/booking/slot-step.tsx", [
    ('import { hourLabel, slotTimes } from "@/lib/time";', 'import { ucfirst } from "@/lib/format";\nimport { hourLabel, slotTimes } from "@/lib/time";'),
    ('const monthLabel = fmt({ month: "long", year: "numeric" }, new Date(Date.UTC(y, m - 1, 1)));', 'const monthLabel = ucfirst(fmt({ month: "long", year: "numeric" }, new Date(Date.UTC(y, m - 1, 1))));'),
    ('const dayLabel = selected ? fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" }, new Date(`${selected}T12:00:00Z`)) : "";', 'const dayLabel = selected ? ucfirst(fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" }, new Date(`${selected}T12:00:00Z`))) : "";'),
    ('<h2 id="cal" className="text-2xl font-bold capitalize">', '<h2 id="cal" className="text-2xl font-bold">'),
    ('className={cn("text-xl leading-tight font-bold", selected && "capitalize")}', 'className="text-xl leading-tight font-bold"'),
    ('<span className="capitalize">{dayLabel}</span>', '<span>{dayLabel}</span>'),
])
edit("src/components/booking/payment-step.tsx", [
    ('import { formatDuration, formatPrice } from "@/lib/format";', 'import { formatDuration, formatPrice, ucfirst } from "@/lib/format";'),
    ('const dateLabel = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: studioTz }).format(new Date(summary.slot.startsAt));', 'const dateLabel = ucfirst(new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: studioTz }).format(new Date(summary.slot.startsAt)));'),
    ('<span className="capitalize">{dateLabel}</span>', '{dateLabel}'),
])
edit("src/app/[locale]/(public)/reserver/confirmation/[reference]/page.tsx", [
    ('import { formatPrice } from "@/lib/format";', 'import { formatPrice, ucfirst } from "@/lib/format";'),
    ('const date = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: tz }).format(booking.slot.startsAt);', 'const date = ucfirst(new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: tz }).format(booking.slot.startsAt));'),
    ('text-xl font-bold text-copper-800 capitalize">{date}', 'text-xl font-bold text-copper-800">{date}'),
])
print("ok")
