import { z } from "zod";

/** Numéro WhatsApp au format E.164 : espaces et tirets tolérés, « 00 » converti en « + ». */
export function normalizePhone(input: string): string {
  const cleaned = input.replace(/[\s().-]/g, "");
  return cleaned.startsWith("00") ? `+${cleaned.slice(2)}` : cleaned;
}

export const phoneSchema = z
  .string()
  .transform(normalizePhone)
  .refine((v) => /^\+[1-9]\d{7,14}$/.test(v), { message: "invalid_phone" });

export const codeSchema = z.string().regex(/^\d{6}$/, { message: "invalid_code" });
