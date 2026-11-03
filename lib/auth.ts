/**
 * Auth entry point.
 *
 * Mirrors lib/db/index.ts: the require branches let the bundler drop Better
 * Auth from a blog-off build, and the raw server flag is compared directly so
 * the condition stays a static literal.
 */
import type { auth as AuthInstance } from "./auth/server";

type AuthModule = { auth: typeof AuthInstance | null };

function loadAuthModule(): AuthModule {
  if (process.env.FEATURE_BLOG === "1") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("./auth/server") as AuthModule;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("./auth/noop") as AuthModule;
}

export const auth = loadAuthModule().auth;

export {
  isAllowlistedAdminEmail,
  parseAdminEmailAllowlist,
} from "./auth/allowlist";
