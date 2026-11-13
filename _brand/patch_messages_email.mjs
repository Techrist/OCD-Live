import fs from "node:fs";
const fr = {
  login: {
    emailLabel: "Ton adresse e-mail", send: "Recevoir mon code", codeLabel: "Code envoyé à {email}", changeEmail: "Changer d'adresse", resend: "Renvoyer le code",
    or: "ou", google: "Continuer avec Google", phoneLabel: "Ton numéro WhatsApp", phoneHint: "Première connexion : ce numéro sert aux commandes et aux rappels.",
    errors: { INVALID_EMAIL: "Adresse e-mail invalide.", SEND_FAILED: "L'e-mail n'a pas pu partir. Réessaie dans un instant.", PHONE_REQUIRED: "Ajoute ton numéro WhatsApp.", PHONE_TAKEN: "Ce numéro est déjà lié à un autre compte.", INVALID_PHONE: "Numéro invalide. Exemple : +228 90 00 00 00" },
  },
  seller: {
    emailLabel: "Ton adresse e-mail", audio: "Choisis ta catégorie, écris tes coordonnées, puis entre le code reçu par e-mail.",
    codeInfo: "On t'envoie un code sécurisé par e-mail pour vérifier ton adresse.", panelBadge: "Vérification par e-mail", panelTitle: "Vérifie ton adresse e-mail",
    editNumber: "Modifier mes informations", noMessage: "Tu n'as pas reçu l'e-mail ?", privacy: "Ton e-mail sert à te connecter ; ton numéro WhatsApp, à t'envoyer ton reçu, tes rappels et à organiser ton live.",
  },
};
const en = {
  login: {
    emailLabel: "Your email address", send: "Get my code", codeLabel: "Code sent to {email}", changeEmail: "Change address", resend: "Resend the code",
    or: "or", google: "Continue with Google", phoneLabel: "Your WhatsApp number", phoneHint: "First sign-in: this number is used for orders and reminders.",
    errors: { INVALID_EMAIL: "Invalid email address.", SEND_FAILED: "The email could not be sent. Try again in a moment.", PHONE_REQUIRED: "Add your WhatsApp number.", PHONE_TAKEN: "This number is already linked to another account.", INVALID_PHONE: "Invalid number. Example: +228 90 00 00 00" },
  },
  seller: {
    emailLabel: "Your email address", audio: "Pick your category, enter your details, then type the code you received by email.",
    codeInfo: "We email you a secure code to verify your address.", panelBadge: "Email verification", panelTitle: "Verify your email address",
    editNumber: "Edit my details", noMessage: "Didn't get the email?", privacy: "Your email is used to sign in; your WhatsApp number to send your receipt, reminders and organise your live.",
  },
};
for (const [lang, d] of [["fr", fr], ["en", en]]) {
  const file = `src/messages/${lang}.json`;
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  const { errors, ...login } = d.login;
  Object.assign(j.login, login);
  Object.assign(j.login.errors, errors);
  Object.assign(j.booking.seller, d.seller);
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n");
}
console.log("ok");
