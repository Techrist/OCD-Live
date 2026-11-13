p = "tests/e2e/booking-flow.spec.ts"
s = open(p, encoding="utf-8").read()
# Écran 2 : tout sur une page (catégorie, coordonnées), puis le code à droite.
a = s.index('  // Écran 2')
b = s.index('  // Écran 3')
s = s[:a] + '''  // Écran 2 : catégorie, coordonnées, puis code WhatsApp (affiché en développement).
  await page.getByRole("button", { name: "Nourriture" }).click();
  await page.getByLabel("Ton nom complet").fill("Test Playwright");
  await page.getByLabel("Nom de ta boutique").fill("Boutique E2E");
  await page.getByLabel("Ton pays").selectOption({ label: "Cameroun (+237)" });
  await page.getByLabel("Ton numéro WhatsApp").fill(phone);
  await page.getByRole("button", { name: "Recevoir mon code" }).click();
  const hint = await page.getByText(/Code de test : \d{6}/).textContent();
  await page.getByLabel("Entre ton code à 6 chiffres").fill(hint!.match(/\d{6}/)![0]);
  await page.getByRole("button", { name: "Valider mon code et continuer" }).click();

''' + s[b:]
s = s.replace('await page.getByRole("button", { name: /Choisir/ }).first().click();', 'await page.getByRole("button", { name: /^Choisir/ }).first().click();')
s = s.replace('const slots = page.locator("ul button:not([disabled])");', 'const slots = page.locator("button[data-slot]:not([disabled])");')
s = s.replace('''  // Écran 5 : paiement mobile money simulé.''', '''  await page.getByRole("button", { name: "Continuer vers le paiement" }).click();

  // Écran 5 : paiement mobile money simulé.''')
s = s.replace('await expect(page.getByText(/Il te reste/)).toBeVisible();', 'await expect(page.getByText(/Créneau verrouillé pour/)).toBeVisible();')
s = s.replace('await page.getByRole("button", { name: "Orange Money" }).click();', 'await page.getByRole("button", { name: "Orange Money" }).click();')
s = s.replace('getByRole("heading", { name: "Réservation confirmée !" })', 'getByText("Ton direct est officiellement programmé.")')
open(p, "w", encoding="utf-8").write(s)
print("ok")
