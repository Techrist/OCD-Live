import { z } from "zod";

// État du parcours /reserver/* : sauvegardé dans localStorage (RES-06), repris à l'étape en cours.
export const STEPS = ["mode", "vendeur", "package", "creneau", "paiement"] as const;
export type Step = (typeof STEPS)[number];
export const STEP_COUNT = STEPS.length;
export const DRAFT_KEY = "ocd:booking:v1";

export const draftSchema = z.object({
  mode: z.enum(["ONSITE", "REMOTE"]).optional(),
  categoryId: z.string().optional(),
  countryCode: z.string().optional(),
  activity: z.string().optional(),
  shopName: z.string().optional(),
  name: z.string().optional(),
  city: z.string().optional(),
  sellerDone: z.boolean().optional(), // numéro vérifié par OTP et profil enregistré
  packageSlug: z.string().optional(),
  slotId: z.string().optional(),
  bookingId: z.string().optional(),
});
export type BookingDraft = z.infer<typeof draftSchema>;

export function parseDraft(raw: string | null): BookingDraft {
  if (!raw) return {};
  try {
    const parsed = draftSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

/** Première étape dont les choix manquent : c'est là que le parcours reprend. */
export function firstIncompleteStep(d: BookingDraft): Step {
  if (!d.mode) return "mode";
  if (!d.sellerDone) return "vendeur";
  if (!d.packageSlug) return "package";
  if (!d.slotId) return "creneau";
  return "paiement";
}

export function stepNumber(step: Step): number {
  return STEPS.indexOf(step) + 1;
}

/** Une étape n'est accessible que si toutes les précédentes sont complètes. */
export function canEnter(step: Step, d: BookingDraft): boolean {
  return stepNumber(step) <= stepNumber(firstIncompleteStep(d));
}

export function packageFitsMode(packageMode: "ONSITE" | "REMOTE" | "BOTH", mode: "ONSITE" | "REMOTE"): boolean {
  return packageMode === "BOTH" || packageMode === mode;
}
