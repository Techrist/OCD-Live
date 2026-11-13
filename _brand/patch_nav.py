def edit(path, pairs):
    s = open(path, encoding="utf-8").read()
    for a, b in pairs:
        if a not in s:
            print("MISSING in", path, ":", a[:70])
        s = s.replace(a, b)
    open(path, "w", encoding="utf-8").write(s)

edit("src/components/whatsapp-float.tsx", [("fixed right-4 bottom-24 z-40", "fixed right-4 bottom-24 z-40 md:right-6 md:bottom-6")])
edit("src/components/site-footer.tsx", [("pb-32 text-white", "pb-32 text-white md:pb-10")])
print("ok")
