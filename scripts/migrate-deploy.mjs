import { spawn } from "node:child_process";

/**
 * Apply Drizzle migrations as part of a Netlify build.
 *
 * Deploys used to leave the schema to whoever remembered to run
 * `npm run db:migrate`. That fails in the worst possible order: the build
 * prerenders pages that query the database, so a missing table breaks the
 * build, and a missing column would only break production after the deploy
 * succeeded.
 *
 * Skips silently when the blog is off, so a landing-only deploy needs no
 * database. Deploy Previews are skipped by default: a pull request should not
 * mutate the production schema. Set MIGRATE_ON_PREVIEW=1 to opt in.
 *
 * Migrations are serialized with a Postgres advisory lock. Netlify can run
 * builds concurrently, and two builds applying the same DDL would collide. The
 * lock is only a mutex if one session holds it for the whole migration, so it
 * is taken over a persistent WebSocket connection: the HTTP driver ends its
 * session as soon as a query returns, which releases a session-level lock
 * before the DDL even starts.
 */

const LOCK_KEY = 4_912_027; // arbitrary but fixed; shared by every build

function log(message) {
  console.log(`[migrate] ${message}`);
}

function skip(reason) {
  log(`skipping: ${reason}`);
  process.exit(0);
}

const blogEnabled = process.env.FEATURE_BLOG === "1";
if (!blogEnabled) skip("FEATURE_BLOG is not 1");

const context = process.env.CONTEXT ?? "";
const migrateOnPreview = process.env.MIGRATE_ON_PREVIEW === "1";
if (context === "deploy-preview" && !migrateOnPreview) {
  skip("deploy preview; set MIGRATE_ON_PREVIEW=1 to migrate here too");
}

const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) {
  console.error(
    "[migrate] DATABASE_URL_UNPOOLED is required when FEATURE_BLOG=1. " +
      "Migrations need Neon's direct connection, not the pooled one."
  );
  process.exit(1);
}

const { Client, neonConfig } = await import("@neondatabase/serverless");
const { default: WebSocketConstructor } = await import("ws");
neonConfig.webSocketConstructor = WebSocketConstructor;

const client = new Client({ connectionString: url });
await client.connect();

// A peer that died holding the lock must fail this build instead of hanging it
// until Netlify's global build timeout.
await client.query("SET lock_timeout = '120s'");
await client.query("SELECT pg_advisory_lock($1)", [LOCK_KEY]);
log("advisory lock held");

let exitCode = 1;
try {
  exitCode = await new Promise((resolve) => {
    const child = spawn("npx", ["drizzle-kit", "migrate"], {
      stdio: "inherit",
      env: process.env,
      shell: process.platform === "win32",
    });
    child.on("exit", (code) => resolve(code ?? 1));
    child.on("error", (error) => {
      console.error(`[migrate] could not start drizzle-kit: ${error.message}`);
      resolve(1);
    });
  });

  if (exitCode === 0) log("migrations applied");
  else console.error(`[migrate] drizzle-kit exited with ${exitCode}`);
} finally {
  // Releases even on failure; the connection also drops it if this process dies.
  await client
    .query("SELECT pg_advisory_unlock($1)", [LOCK_KEY])
    .catch((error) => {
      console.error(
        `[migrate] could not release the advisory lock: ${error.message}`
      );
    });
  await client.end().catch(() => {});
}

process.exit(exitCode);
