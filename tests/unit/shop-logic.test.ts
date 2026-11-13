import { describe, expect, it } from "vitest";
import { clampQuantity, orderHref, parseShopFilters, shopQuery } from "@/lib/shop";
import { sniffImage } from "@/server/adapters/storage";

describe("filtres du shop (SHP-04)", () => {
  it("lit pays, ville, catégorie, prix et recherche", () => {
    expect(parseShopFilters({ pays: "tg", ville: " Lomé ", categorie: "mode", min: "1 000", max: "5000", q: "robe" })).toEqual({
      country: "TG", city: "Lomé", category: "mode", min: 1000, max: 5000, q: "robe",
    });
  });
  it("ignore les valeurs invalides et remet min/max dans l'ordre", () => {
    const f = parseShopFilters({ pays: "togo", min: "abc", max: "-4" });
    expect(f.country).toBeUndefined();
    expect(f.min).toBeUndefined();
    expect(f.max).toBeUndefined();
    expect(parseShopFilters({ min: "9000", max: "100" })).toMatchObject({ min: 100, max: 9000 });
  });
  it("prend la première valeur d'un paramètre répété", () => {
    expect(parseShopFilters({ q: ["a", "b"] }).q).toBe("a");
  });
  it("reconstruit l'adresse sans les filtres vides", () => {
    expect(shopQuery({})).toBe("");
    expect(shopQuery({ country: "CM", min: 0, q: "wax" })).toBe("?pays=CM&min=0&q=wax");
  });
});

describe("commande WhatsApp (SHP-02)", () => {
  it("passe par /api/go avec le message encodé et limité à 300 caractères", () => {
    const href = orderHref("abc", "Bonjour & merci");
    expect(href).toBe("/api/go?t=wa&id=abc&m=Bonjour%20%26%20merci");
    expect(decodeURIComponent(orderHref("x", "a".repeat(500)).split("m=")[1])).toHaveLength(300);
  });
  it("borne la quantité entre 1 et le stock (99 sans stock)", () => {
    expect(clampQuantity(0, 5)).toBe(1);
    expect(clampQuantity(9, 5)).toBe(5);
    expect(clampQuantity(200, null)).toBe(99);
    expect(clampQuantity(Number.NaN, 3)).toBe(1);
  });
});

describe("photos des produits", () => {
  it("reconnaît le type par les premiers octets, pas par le nom ou le type annoncé", () => {
    const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(10)]);
    const jpg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(20)]);
    const webp = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP"), Buffer.alloc(4)]);
    expect(sniffImage(png)?.ext).toBe("png");
    expect(sniffImage(jpg)?.ext).toBe("jpg");
    expect(sniffImage(webp)?.ext).toBe("webp");
    expect(sniffImage(Buffer.from("<svg onload=alert(1)></svg>"))).toBeNull();
    expect(sniffImage(Buffer.from("<?php echo 1; ?>"))).toBeNull();
  });
});
