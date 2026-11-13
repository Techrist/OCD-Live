import { afterEach, describe, expect, it } from "vitest";
import { whatsappLink } from "@/lib/whatsapp";

describe("lien WhatsApp (section 19)", () => {
  afterEach(() => {
    delete process.env.OCD_WHATSAPP_NUMBER;
  });

  it("utilise le numéro de l'environnement et encode le message", () => {
    process.env.OCD_WHATSAPP_NUMBER = "+228 90 00 00 01";
    expect(whatsappLink("Bonjour OCD")).toBe("https://wa.me/22890000001?text=Bonjour%20OCD");
  });

  it("n'invente jamais de numéro quand la variable est vide", () => {
    expect(whatsappLink("Salut")).toBe("https://wa.me/?text=Salut");
  });
});
