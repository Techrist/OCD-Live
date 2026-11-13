p = "src/app/globals.css"
s = open(p, encoding="utf-8").read()
a = s.index("/* Titres condensés")
b = s.index("/* Carte : fond blanc")
new = '''/* Titres condensés (Anton) : un seul poids, serrés, comme sur la maquette.
   Les tailles par défaut sont dans la couche « base » : une classe text-* les remplace (pages internes plus discrètes). */
@layer base {
  h1,
  h2 {
    font-family: var(--font-display), var(--font-sans);
    letter-spacing: 0.005em;
    line-height: 1.05;
  }
  h1 {
    font-size: clamp(2.5rem, 7vw, 4.75rem);
  }
  h2 {
    font-size: clamp(2rem, 4.5vw, 3.25rem);
  }
}
h1,
h2 {
  font-weight: 400 !important; /* Anton n'a qu'un poids : pas de faux gras */
}

'''
s = s[:a] + new + s[b:]
open(p, "w", encoding="utf-8").write(s)
print("ok")
