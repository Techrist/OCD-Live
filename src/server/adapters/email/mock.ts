import type { EmailProvider } from "./types";

/** Mode simulation : rien n'est envoyé. En développement, le code s'affiche sous le champ de saisie. */
export const mockEmail: EmailProvider = {
  async send() {},
};
