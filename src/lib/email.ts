import { z } from "zod";

/** Adresse e-mail normalisée : espaces retirés, minuscules (identifiant de connexion). */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email());
