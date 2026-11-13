import fs from "node:fs";
const add = {
  fr: {
    subtitle: "Reçois un code par e-mail, sans mot de passe. Un nouveau compte se crée tout seul à ta première connexion.",
    secure: "Ton e-mail sert uniquement à te connecter. On ne t'écrit jamais pour te demander un code.",
    panel: {
      title: "Ton espace vendeur t'attend.",
      text: "Réserve ton live, suis tes statistiques et mets tes produits en ligne depuis un seul endroit.",
      p1: "Réserve et reporte tes lives en quelques touches",
      p2: "Ta vitrine et tes lives visibles dans l'annuaire",
      p3: "Tes produits dans OCD Shop, commandés sur WhatsApp",
    },
  },
  en: {
    subtitle: "Get a code by email, no password. A new account is created automatically on your first sign-in.",
    secure: "Your email is only used to sign you in. We never write to ask you for a code.",
    panel: {
      title: "Your seller space is waiting.",
      text: "Book your live, follow your statistics and put your products online from one place.",
      p1: "Book and reschedule lives in a few taps",
      p2: "Your showcase and lives visible in the directory",
      p3: "Your products in OCD Shop, ordered on WhatsApp",
    },
  },
};
for (const [l, d] of Object.entries(add)) {
  const p = `src/messages/${l}.json`;
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  Object.assign(j.login, d);
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n");
}
console.log("ok");
