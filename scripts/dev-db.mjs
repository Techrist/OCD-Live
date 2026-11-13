// PostgreSQL local sans Docker (embedded-postgres), pour développer et tester.
// Usage : npm run dev:db   (laisser tourner dans un terminal). Données dans .pgdata/
import { existsSync } from "node:fs";
import EmbeddedPostgres from "embedded-postgres";

const dir = new URL("../.pgdata", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");
const pg = new EmbeddedPostgres({ databaseDir: dir, user: "ocd", password: "ocd", port: 5432, persistent: true });

const fresh = !existsSync(dir + "/PG_VERSION");
if (fresh) await pg.initialise();
await pg.start();
if (fresh) await pg.createDatabase("ocdlive");
console.log("PostgreSQL prêt : postgresql://ocd:ocd@localhost:5432/ocdlive");

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
