import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

import * as schema from "./schema";

/**
 * Neon WebSocket pool, used only by Better Auth.
 *
 * The HTTP driver in lib/db/client.ts cannot run interactive transactions,
 * which Better Auth needs for session and account writes, so auth gets its own
 * connection over the unpooled URL. The pool is cached on globalThis so that
 * module reloads in development do not leak a new pool per request.
 */
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL_UNPOOLED;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL_UNPOOLED is required when FEATURE_BLOG=1 for the auth connection pool. Set Neon's direct (unpooled) connection string."
  );
}

type GlobalAuthPool = typeof globalThis & { __authNeonPool?: Pool };

function getAuthPool(): Pool {
  const globalWithPool = globalThis as GlobalAuthPool;
  if (!globalWithPool.__authNeonPool) {
    globalWithPool.__authNeonPool = new Pool({ connectionString });
  }
  return globalWithPool.__authNeonPool;
}

export const authDb = drizzle({ client: getAuthPool(), schema });
