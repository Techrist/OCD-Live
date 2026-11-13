p = "src/components/booking/slot-step.tsx"
s = open(p, encoding="utf-8").read()
old = '<h2 id="slots" className="text-xl leading-tight font-bold capitalize">{selected ? dayLabel : t("pickDay")}</h2>'
assert old in s
s = s.replace(old, '<h2 id="slots" className={cn("text-xl leading-tight font-bold", selected && "capitalize")}>{selected ? dayLabel : t("pickDay")}</h2>')
open(p, "w", encoding="utf-8").write(s)
print("ok")
