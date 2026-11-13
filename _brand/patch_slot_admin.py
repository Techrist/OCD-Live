def edit(path, pairs):
    s = open(path, encoding="utf-8").read()
    for a, b in pairs:
        if a not in s:
            print("MISSING in", path, ":", a[:70])
        s = s.replace(a, b)
    open(path, "w", encoding="utf-8").write(s)

edit("src/components/booking/slot-step.tsx", [
    ('''                </button>
              </li>
            );
          })}
        </ul>
      )}''', '''                </button>
                {full && (
                  <button type="button" onClick={() => joinWaitlist(s.id)} className="soft mt-2 min-h-12 w-full rounded-full font-bold">
                    {t("waitlist")}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {notice && <p role="status" className="font-bold text-wa">{notice}</p>}'''),
    ('''  async function pick(slotId: string) {''', '''  // Créneau complet : le vendeur s'inscrit et sera prévenu sur WhatsApp en cas de désistement (RES-09).
  async function joinWaitlist(slotId: string) {
    setError(undefined);
    const res = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slotId }) }).catch(() => null);
    if (res?.status === 403) return router.push("/reserver/vendeur");
    if (res?.ok) return setNotice(t("waitlistDone"));
    setError(t("errorNetwork"));
  }

  async function pick(slotId: string) {'''),
    ('''  const [busy, setBusy] = useState(false);''', '''  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string>();'''),
])

edit("src/app/[locale]/(admin)/admin/reservations/[id]/page.tsx", [
    ('''      {b.status === "HELD" && (''', '''      {b.checkInAt && (
        <p className="pill w-fit">{t("booking.checkedIn", { time: formatDateTime(b.checkInAt, tz) })}</p>
      )}
      {sheet.success && (
        <section className="soft flex max-w-xl flex-col gap-2 rounded-[2rem] p-5">
          <h2 className="text-lg font-bold">{t("booking.sheet")}</h2>
          <p className="text-sm font-semibold">{sheet.data.address} · {sheet.data.phone}</p>
          <ul className="flex flex-col gap-1">
            {sheet.data.products.map((p, i) => (
              <li key={i} className="flex justify-between gap-3 text-sm font-bold"><span>{p.name}</span><span>{p.quantity} × {formatPrice(p.price)}</span></li>
            ))}
          </ul>
        </section>
      )}

      {b.status === "HELD" && ('''),
    ('''  const isAdmin = session.role === "ADMIN";''', '''  const isAdmin = session.role === "ADMIN";
  const sheet = productSheetSchema.safeParse(b.productSheet);'''),
    ('''import { getStudioTimezone } from "@/server/services/catalog";''', '''import { getStudioTimezone } from "@/server/services/catalog";
import { productSheetSchema } from "@/server/services/reservations";'''),
])
print("ok")
