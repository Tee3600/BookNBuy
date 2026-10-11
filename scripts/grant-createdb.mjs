// One-off: grant CREATEDB so `prisma migrate dev` can use a shadow database.
// Connects as local superuser (dev-only defaults). Run: node scripts/grant-createdb.mjs
import pg from "pg";
const client = new pg.Client({ host: "localhost", port: 5432, user: "postgres", password: "booknbuy", database: "postgres" });
await client.connect();
await client.query("ALTER ROLE booknbuy CREATEDB");
console.log("CREATEDB granted");
await client.end();
