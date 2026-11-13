p = "src/app/[locale]/layout.tsx"
s = open(p, encoding="utf-8").read()
s = s.replace('import { Urbanist } from "next/font/google";', 'import { Anton, Urbanist } from "next/font/google";')
s = s.replace('const urbanist = Urbanist({ subsets: ["latin"], variable: "--font-urbanist", display: "swap" });', 'const urbanist = Urbanist({ subsets: ["latin"], variable: "--font-urbanist", display: "swap" });\n// Titres condensés : un seul poids (400), chargé uniquement pour les titres.\nconst anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display", display: "swap" });')
s = s.replace("className={urbanist.variable}", "className={`${urbanist.variable} ${anton.variable}`}")
open(p, "w", encoding="utf-8").write(s)
print("ok")
