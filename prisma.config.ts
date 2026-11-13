import "dotenv/config";
import { defineConfig } from "prisma/config";

// `prisma generate` (lancé à l'installation, ex. sur Vercel) n'ouvre aucune connexion : une adresse factice suffit
// quand DATABASE_URL n'est pas encore définie. Les migrations et le seed, eux, exigent la vraie adresse.
const url = process.env.DATABASE_URL ?? "postgresql://user:password@localhost:5432/ocd_live";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  datasource: { url },
});
