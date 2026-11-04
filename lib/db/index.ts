/**
 * Database entry point.
 *
 * The two require branches let the bundler drop the unused one when
 * process.env.FEATURE_BLOG is a build-time literal. Compare the raw server
 * flag here rather than importing lib/features, because that module ORs in the
 * NEXT_PUBLIC mirror and the result is no longer a static literal.
 */
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

import type * as schema from "./schema";

type AppDb = NeonHttpDatabase<typeof schema>;

type DbModule = { db: AppDb | null };

function loadDbModule(): DbModule {
  if (process.env.FEATURE_BLOG === "1") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("./client") as DbModule;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("./noop") as DbModule;
}

export const db = loadDbModule().db;

export {
  account,
  posts,
  postStatusEnum,
  session,
  user,
  verification,
} from "./schema";
export type { NewPost, Post } from "./schema";
