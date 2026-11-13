import fs from "node:fs";
const fr = {
  extras: {
    title: "Ce qui est inclus dans ton live", subtitle: "Un live clé en main : tu apportes ton produit, on s'occupe du reste.",
    i1: { title: "Diffusion House of Challenge", text: "Ton live passe sur le compte TikTok du studio, devant sa communauté." },
    i2: { title: "Un accompagnement", text: "Régie au studio de Lomé, ou assistante en direct si tu es à distance." },
    i3: { title: "Ton produit mis en avant", text: "Produit, numéro WhatsApp et adresse présentés à l'écran et à l'oral." },
    i4: { title: "Reçu et rappels", text: "Reçu PDF, puis rappels WhatsApp la veille et une heure avant." },
    studioAlt: "Le studio OCD Live à Lomé", faqTitle: "Questions avant de réserver",
    q1: { q: "Puis-je reporter mon live ?", a: "Oui, gratuitement jusqu'à {hours} h avant le créneau, depuis Mon espace." },
    q2: { q: "Comment je paie ?", a: "Par Mobile Money au moment de la réservation. Ton créneau est bloqué 10 minutes pendant le paiement." },
    q3: { q: "Que se passe-t-il si je ne peux pas venir ?", a: "Annulation remboursée jusqu'à {hours} h avant. Après, le créneau n'est pas remboursé." },
    helpTitle: "Besoin d'aide pour réserver ?", helpText: "Un conseiller te répond sur WhatsApp et peut réserver avec toi.", helpCta: "Parler à un conseiller",
  },
  nav: { label: "Navigation de l'espace vendeur", overview: "Résumé", bookings: "Réservations", products: "Produits", live: "Mon live", showcase: "Vitrine", stats: "Statistiques", subscription: "Abonnement" },
  figures: { label: "Chiffres clés", upcoming: "Lives à venir", products: "Produits en ligne", views: "Vues (30 j)", whatsapp: "Clics WhatsApp (30 j)" },
  viewShowcase: "Voir ma vitrine",
  subActive: "Actif jusqu'au {date}", subNone: "Pas d'abonnement actif : passe en direct dans l'annuaire dès 5 000 F.", subManage: "Gérer", subStart: "S'abonner",
  productsHint: "Nom, prix, photo", submitHint: "Colle ton lien", showcaseHint: "Ta page publique", statsHint: "Vues et clics",
  lives: {
    statCountries: "{count, plural, =0 {Aucun pays} one {# pays} other {# pays}}",
    how: { title: "Comment apparaître ici", subtitle: "Trois étapes pour que les acheteurs te trouvent pendant ton live.",
      s1: { title: "Réserve ton live", text: "Choisis le studio ou la diffusion à distance, puis un créneau." },
      s2: { title: "Colle ton lien", text: "Pendant la fenêtre de validation, soumets le lien de ton live TikTok." },
      s3: { title: "Sois vu", text: "Une fois validé, ton live apparaît dans l'annuaire de ton pays pour la journée." } },
    shop: { title: "Les produits des vendeurs", subtitle: "Un coup de cœur ? Commande-le sur WhatsApp.", cta: "Voir OCD Shop" },
  },
};
const en = {
  extras: {
    title: "What's included in your live", subtitle: "A turnkey live: you bring the product, we handle the rest.",
    i1: { title: "House of Challenge broadcast", text: "Your live airs on the studio's TikTok account, in front of its community." },
    i2: { title: "Hands-on support", text: "Studio crew in Lomé, or a live assistant if you join remotely." },
    i3: { title: "Your product in the spotlight", text: "Product, WhatsApp number and address shown on screen and said out loud." },
    i4: { title: "Receipt and reminders", text: "PDF receipt, then WhatsApp reminders the day before and one hour before." },
    studioAlt: "The OCD Live studio in Lomé", faqTitle: "Questions before booking",
    q1: { q: "Can I reschedule my live?", a: "Yes, for free up to {hours} h before the slot, from My space." },
    q2: { q: "How do I pay?", a: "By Mobile Money when you book. Your slot is held for 10 minutes while you pay." },
    q3: { q: "What if I can't make it?", a: "Cancellation is refunded up to {hours} h before. After that, the slot isn't refunded." },
    helpTitle: "Need help booking?", helpText: "An advisor answers on WhatsApp and can book with you.", helpCta: "Talk to an advisor",
  },
  nav: { label: "Seller space navigation", overview: "Overview", bookings: "Bookings", products: "Products", live: "My live", showcase: "Showcase", stats: "Statistics", subscription: "Subscription" },
  figures: { label: "Key figures", upcoming: "Upcoming lives", products: "Products online", views: "Views (30 d)", whatsapp: "WhatsApp clicks (30 d)" },
  viewShowcase: "View my showcase",
  subActive: "Active until {date}", subNone: "No active subscription: go live in the directory from 5,000 F.", subManage: "Manage", subStart: "Subscribe",
  productsHint: "Name, price, photo", submitHint: "Paste your link", showcaseHint: "Your public page", statsHint: "Views and clicks",
  lives: {
    statCountries: "{count, plural, =0 {No countries} one {# country} other {# countries}}",
    how: { title: "How to show up here", subtitle: "Three steps so buyers find you during your live.",
      s1: { title: "Book your live", text: "Pick the studio or remote broadcast, then a slot." },
      s2: { title: "Paste your link", text: "During the validation window, submit your TikTok live link." },
      s3: { title: "Get seen", text: "Once approved, your live appears in your country's directory for the day." } },
    shop: { title: "Products from sellers", subtitle: "Love something? Order it on WhatsApp.", cta: "See OCD Shop" },
  },
};
for (const [lang, d] of [["fr", fr], ["en", en]]) {
  const file = `src/messages/${lang}.json`;
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  if (j.espace.nav) throw new Error("espace.nav existe déjà");
  j.booking.extras = d.extras;
  j.espace.nav = d.nav; j.espace.figures = d.figures;
  for (const k of ["viewShowcase", "subActive", "subNone", "subManage", "subStart", "productsHint", "submitHint", "showcaseHint", "statsHint"]) j.espace[k] = d[k];
  Object.assign(j.lives, d.lives);
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n");
}
console.log("ok");
