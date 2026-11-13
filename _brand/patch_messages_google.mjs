import fs from "node:fs";
const add = {
  fr: { errors: { GOOGLE_FAILED: "Connexion Google impossible. Réessaie ou utilise ton e-mail.", NO_SESSION: "Session Google introuvable. Recommence la connexion.", EMAIL_NOT_VERIFIED: "Ton adresse Google n'est pas vérifiée.", DISABLED: "La connexion Google n'est pas disponible." }, googleWait: "Connexion en cours…" },
  en: { errors: { GOOGLE_FAILED: "Google sign-in failed. Try again or use your email.", NO_SESSION: "Google session not found. Start again.", EMAIL_NOT_VERIFIED: "Your Google address is not verified.", DISABLED: "Google sign-in is not available." }, googleWait: "Signing you in…" },
};
for (const [l, d] of Object.entries(add)) {
  const p = `src/messages/${l}.json`;
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  Object.assign(j.login.errors, d.errors);
  j.login.googleWait = d.googleWait;
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n");
}
console.log("ok");
