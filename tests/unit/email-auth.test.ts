import { afterEach, describe, expect, it, vi } from "vitest";
import { emailSchema } from "@/lib/email";
import { brevoEmail } from "@/server/adapters/email/brevo";
import { otpEmail } from "@/server/auth/otp-email";

describe("connexion par e-mail", () => {
  it("normalise l'adresse (espaces, majuscules) et refuse les adresses invalides", () => {
    expect(emailSchema.parse("  Aicha@Exemple.COM ")).toBe("aicha@exemple.com");
    expect(emailSchema.safeParse("pas-une-adresse").success).toBe(false);
    expect(emailSchema.safeParse("a@b").success).toBe(false);
  });

  it("l'e-mail contient le code dans le corps, jamais dans l'objet, en français et en anglais", () => {
    const fr = otpEmail("123456", "fr");
    const en = otpEmail("123456", "en");
    expect(fr.subject).not.toContain("123456");
    expect(fr.html).toContain("123456");
    expect(fr.text).toContain("valable 5 minutes");
    expect(en.subject).toBe("Your OCD Live sign-in code");
    expect(en.text).toContain("valid for 5 minutes");
  });
});

describe("adaptateur Brevo", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("envoie le message à l'API Brevo avec la clé en en-tête, jamais dans l'adresse", async () => {
    vi.stubEnv("BREVO_API_KEY", "cle-secrete");
    vi.stubEnv("EMAIL_FROM", "contact@ocdlive.test");
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    await brevoEmail.send({ to: "a@b.co", subject: "Sujet", html: "<p>x</p>", text: "x" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    expect(init.headers["api-key"]).toBe("cle-secrete");
    const body = JSON.parse(init.body);
    expect(body.sender.email).toBe("contact@ocdlive.test");
    expect(body.to).toEqual([{ email: "a@b.co" }]);
  });

  it("échoue clairement sans clé ou si Brevo refuse, sans révéler la clé", async () => {
    vi.stubEnv("BREVO_API_KEY", "");
    await expect(brevoEmail.send({ to: "a@b.co", subject: "s", html: "h", text: "t" })).rejects.toThrow(/BREVO_API_KEY/);
    vi.stubEnv("BREVO_API_KEY", "cle-secrete");
    vi.stubEnv("EMAIL_FROM", "contact@ocdlive.test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 401 })));
    const err = await brevoEmail.send({ to: "a@b.co", subject: "s", html: "h", text: "t" }).catch((e: Error) => e);
    expect((err as Error).message).toContain("401");
    expect((err as Error).message).not.toContain("cle-secrete");
  });
});
