import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

export type ReceiptData = {
  number: string;
  reference: string;
  sellerName: string;
  shopName: string;
  phone: string;
  packageName: string;
  dateLabel: string; // ex. « mardi 1 décembre 2026 · 08:00 (heure de Lomé) »
  modeLabel: string;
  method: string;
  amountLabel: string; // ex. « 15 000 FCFA »
  qrDataUrl?: string;
  studio: string;
};

const COPPER = "#B4541A";
const s = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 12, color: "#0A0A10" },
  head: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 3, borderBottomColor: COPPER, paddingBottom: 12 },
  brand: { fontSize: 26, fontFamily: "Helvetica-Bold", color: COPPER },
  live: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", marginTop: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: "#DDD" },
  label: { color: "#555" },
  value: { fontFamily: "Helvetica-Bold", maxWidth: 330, textAlign: "right" },
  total: { marginTop: 16, padding: 12, backgroundColor: "#F4F1EC", flexDirection: "row", justifyContent: "space-between" },
  totalText: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  qrBox: { marginTop: 24, alignItems: "center" },
  qr: { width: 130, height: 130 },
  foot: { marginTop: 18, fontSize: 10, color: "#555", textAlign: "center" },
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}

/** Reçu A4 : numéro unique, détail de la réservation et QR code de check-in (PAY-04). */
export function ReceiptPdf({ d }: { d: ReceiptData }) {
  return (
    <Document title={`Recu ${d.number}`} author="OCD Live">
      <Page size="A4" style={s.page}>
        <View style={s.head}>
          <Text style={s.brand}>OCD Live</Text>
          <Text style={s.live}>{d.studio}</Text>
        </View>
        <Text style={s.title}>{`Reçu ${d.number}`}</Text>
        <Row label="Réservation" value={d.reference} />
        <Row label="Vendeur" value={`${d.sellerName} · ${d.shopName}`} />
        <Row label="WhatsApp" value={d.phone} />
        <Row label="Offre" value={d.packageName} />
        <Row label="Mode" value={d.modeLabel} />
        <Row label="Date et heure" value={d.dateLabel} />
        <Row label="Moyen de paiement" value={d.method} />
        <View style={s.total}>
          <Text style={s.totalText}>Total payé</Text>
          <Text style={s.totalText}>{d.amountLabel}</Text>
        </View>
        {d.qrDataUrl && (
          <View style={s.qrBox}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={d.qrDataUrl} style={s.qr} />
            <Text style={s.foot}>Présentez ce QR code à votre arrivée au studio (check-in).</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
