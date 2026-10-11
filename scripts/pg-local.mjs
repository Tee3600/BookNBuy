// Local Postgres without Docker/admin (Phase: live local mode).
// Uses embedded-postgres binaries (PG 16). Data persists in ./pgdata.
// Run: node scripts/pg-local.mjs   (keep running; Ctrl+C to stop)
import EmbeddedPostgres from "embedded-postgres";

const pg = new EmbeddedPostgres({
  databaseDir: "./pgdata",
  user: "postgres",
  password: "booknbuy",
  port: 5432,
  persistent: true,
});

try {
  await pg.initialise();
} catch (e) {
  console.log("initialise skipped (cluster exists?):", String(e).slice(0, 120));
}
await pg.start();
console.log("PG_UP on 5432");

const client = pg.getPgClient();
await client.connect();
await client.query(
  "DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='booknbuy') THEN CREATE ROLE booknbuy LOGIN PASSWORD 'booknbuy'; END IF; END $$;"
);
const dbs = await client.query("SELECT 1 FROM pg_database WHERE datname='booknbuy'");
if (dbs.rowCount === 0) {
  await client.query("CREATE DATABASE booknbuy OWNER booknbuy");
  console.log("database booknbuy created");
} else {
  console.log("database booknbuy exists");
}
await client.end();

// Hold the process so Postgres keeps running.
setInterval(() => {}, 10000);
