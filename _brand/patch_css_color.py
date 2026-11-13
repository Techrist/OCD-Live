p = "src/app/globals.css"
s = open(p, encoding="utf-8").read()
s = s.replace(".soft {\n  background-color: #fff;", ".soft {\n  color: var(--ocd-ink);\n  background-color: #fff;", 1)
s = s.replace(".pill {\n  display: inline-flex;", ".pill {\n  color: var(--ocd-ink);\n  display: inline-flex;", 1)
s = s.replace(".nav-float {\n  background:", ".nav-float {\n  color: var(--ocd-ink);\n  background:", 1)
open(p, "w", encoding="utf-8").write(s)
print("ok")
