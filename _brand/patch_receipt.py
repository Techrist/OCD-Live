p = "src/server/receipts/load-receipt.ts"
s = open(p, encoding="utf-8").read()
start = s.index("/** Données du reçu")
new = '''/** Données du reçu, ou null si le reçu n'existe pas ou n'est pas accessible à cette session. */
export async function loadReceipt(number: string, session: SessionPayload): Promise<ReceiptData | null> {
  const receipt = await db.receipt.findUnique({
    where: { number },
    include: {
      payment: {
        include: {
          booking: { include: { seller: { include: { sellerProfile: true } }, package: true, slot: true } },
          subscription: { include: { seller: { include: { sellerProfile: true } } } },
        },
      },
    },
  });
  if (!receipt) return null;
  const booking = receipt.payment.booking;
  const subscription = receipt.payment.subscription;
  const seller = booking?.seller ?? subscription?.seller;
  if (!seller) return null;
  const isOwner = seller.id === session.sub;
  const isStaff = session.role === "ADMIN" || session.role === "STUDIO";
  if (!isOwner && !isStaff) return null;

  const tz = await getStudioTimezone();
  const amount = new Intl.NumberFormat("fr-FR").format(receipt.payment.amount).replace(/[\u202f\u00a0]/g, " ");
  const common = {
    number: receipt.number,
    sellerName: seller.name ?? seller.phone,
    shopName: seller.sellerProfile?.shopName ?? "-",
    phone: seller.phone,
    method: METHODS[receipt.payment.method] ?? receipt.payment.method,
    amountLabel: `${amount} ${CURRENCY[receipt.payment.currency] ?? receipt.payment.currency}`,
    studio: "Studio à Lomé, Togo",
  };
  if (booking) {
    return {
      ...common,
      reference: booking.reference,
      packageName: booking.package.name,
      dateLabel: `${formatInTimeZone(booking.slot.startsAt, tz, "dd/MM/yyyy 'à' HH:mm")} (heure de Lomé)`,
      modeLabel: booking.mode === "ONSITE" ? "Au studio à Lomé" : "À distance",
      qrDataUrl: await QRCode.toDataURL(checkInUrl(booking.reference), { margin: 1, width: 260 }),
    };
  }
  // Reçu d'abonnement annuaire : pas de QR de check-in, on affiche la période.
  const sub = subscription!;
  return {
    ...common,
    reference: `SUB-${sub.id.slice(-8).toUpperCase()}`,
    packageName: "Abonnement annuaire des lives",
    dateLabel: `${formatInTimeZone(sub.startsAt, tz, "dd/MM/yyyy")} au ${formatInTimeZone(sub.endsAt, tz, "dd/MM/yyyy")}`,
    modeLabel: "En ligne",
    qrDataUrl: undefined,
  };
}
'''
open(p, "w", encoding="utf-8").write(s[:start] + new)

p = "src/server/receipts/receipt-pdf.tsx"
s = open(p, encoding="utf-8").read()
s = s.replace("  qrDataUrl: string;", "  qrDataUrl?: string;")
s = s.replace('''        <View style={s.qrBox}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={d.qrDataUrl} style={s.qr} />
          <Text style={s.foot}>Présentez ce QR code à votre arrivée au studio (check-in).</Text>
        </View>''', '''        {d.qrDataUrl && (
          <View style={s.qrBox}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={d.qrDataUrl} style={s.qr} />
            <Text style={s.foot}>Présentez ce QR code à votre arrivée au studio (check-in).</Text>
          </View>
        )}''')
open(p, "w", encoding="utf-8").write(s)
print("ok")
