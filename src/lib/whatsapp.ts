// Liens WhatsApp sans API (section 19). Le numéro vient de l'environnement, jamais du code.
export function whatsappLink(message: string): string {
  const raw = process.env.OCD_WHATSAPP_NUMBER ?? "";
  const digits = raw.replace(/[^\d]/g, "");
  const text = encodeURIComponent(message);
  return digits ? `https://wa.me/${digits}?text=${text}` : `https://wa.me/?text=${text}`;
}
