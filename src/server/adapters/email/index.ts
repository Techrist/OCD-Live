import "server-only";
import { brevoEmail } from "./brevo";
import { mockEmail } from "./mock";
import type { EmailProvider } from "./types";

/** EMAIL_PROVIDER=mock (défaut) ou brevo. */
export function getEmail(): EmailProvider {
  const provider = process.env.EMAIL_PROVIDER ?? "mock";
  if (provider === "brevo") return brevoEmail;
  if (provider !== "mock") throw new Error(`EMAIL_PROVIDER inconnu : ${provider} (valeurs : mock, brevo)`);
  return mockEmail;
}
