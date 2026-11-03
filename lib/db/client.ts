import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

/**
 * Neon HTTP client, used for every public blog read.
 *
 * Loaded only when FEATURE_BLOG is "1"; see lib/db/index.ts for the branch
 * that keeps this module out of a blog-off build. Missing configuration is a
 * build failure rather than a site that renders an empty blog.
 */
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required when FEATURE_BLOG=1. Set the pooled Neon connection string."
  );
}

const sql = neon(databaseUrl);

export const db = drizzle({ client: sql, schema });
