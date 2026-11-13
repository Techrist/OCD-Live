import type { EmailProvider } from "./types";

// Brevo (API e-mail transactionnelle). Variables : BREVO_API_KEY, EMAIL_FROM (expéditeur validé dans Brevo), EMAIL_FROM_NAME.
export const brevoEmail: EmailProvider = {
  async send({ to, subject, html, text }) {
    const apiKey = process.env.BREVO_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) throw new Error("BREVO_API_KEY et EMAIL_FROM sont requis (EMAIL_PROVIDER=brevo)");
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        sender: { email: from, name: process.env.EMAIL_FROM_NAME || "OCD Live" },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Brevo a refusé l'envoi (HTTP ${res.status})`);
  },
};
