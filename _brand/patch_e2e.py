p = "tests/e2e/v1.spec.ts"
s = open(p, encoding="utf-8").read()
start = s.index("// Connexion rapide")
end = s.index('test("un vendeur s\'abonne')
s = s[:start] + 'import { loginAs, loginNewSeller } from "./helpers";\n\n' + s[end:]
s = s.replace('import { expect, test, type Page } from "@playwright/test";', 'import { expect, test } from "@playwright/test";')
s = s.replace('await login(page, `+2376${String(Date.now()).slice(-8)}`);', 'await loginNewSeller(page);')
s = s.replace('await login(page, "+22890000002"); // VALIDATOR', 'await loginAs(page, "+22890000002"); // VALIDATOR')
s = s.replace('await login(page, "+237690000005"); // SELLER avec abonnement', 'await loginAs(page, "+237690000005"); // SELLER avec abonnement')
open(p, "w", encoding="utf-8").write(s)
print("ok")
