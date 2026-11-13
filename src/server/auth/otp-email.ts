import { OTP_POLICY } from "./otp";

const minutes = OTP_POLICY.ttlMs / 60_000;

/** E-mail du code de connexion, en français ou en anglais (le code n'est jamais mis dans l'objet du message). */
export function otpEmail(code: string, locale: string) {
  const en = locale === "en";
  const subject = en ? "Your OCD Live sign-in code" : "Ton code de connexion OCD Live";
  const intro = en ? `Your sign-in code is valid for ${minutes} minutes:` : `Ton code de connexion est valable ${minutes} minutes :`;
  const outro = en ? "If you did not ask for this code, you can ignore this message." : "Si tu n'as rien demandé, ignore simplement ce message.";
  const html = `<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;color:#0a0a10">
<p style="font-weight:bold;color:#b4541a;font-size:20px;margin:0 0 16px">OCD Live</p>
<p>${intro}</p>
<p style="font-size:34px;font-weight:bold;letter-spacing:8px;background:#fbe3b5;border-radius:12px;padding:16px;text-align:center;margin:16px 0">${code}</p>
<p style="color:#555;font-size:14px">${outro}</p></div>`;
  return { subject, html, text: `${intro} ${code}\n\n${outro}` };
}
