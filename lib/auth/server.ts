import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { authDb } from "@/lib/db/pool";
import * as schema from "@/lib/db/schema";

/**
 * Better Auth instance. Loaded only when FEATURE_BLOG is "1"; see lib/auth.ts.
 *
 * Every secret is required rather than optional: a half-configured auth setup
 * should fail the build, not serve a sign-in button that cannot work.
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is required when FEATURE_BLOG=1. Set the Better Auth and GitHub OAuth secrets.`
    );
  }
  return value;
}

const secret = requireEnv("BETTER_AUTH_SECRET");
const baseURL = requireEnv("BETTER_AUTH_URL");
const githubClientId = requireEnv("GITHUB_CLIENT_ID");
const githubClientSecret = requireEnv("GITHUB_CLIENT_SECRET");

export const auth = betterAuth({
  secret,
  baseURL,
  // next.config.ts sets trailingSlash: true, so Next redirects
  // /api/auth/sign-in/social to the slashed form before the catch-all route
  // runs. Better Auth then answers an empty 404 for every endpoint, because its
  // router rejects a path whose trailing slash does not match the route. This
  // flag is honoured at runtime but still missing from the published types.
  advanced: { skipTrailingSlashes: true },
  database: drizzleAdapter(authDb, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  socialProviders: {
    github: {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
      // GitHub sends user:email by default; naming it keeps the requirement
      // visible to whoever registers the OAuth app.
      scope: ["read:user", "user:email"],
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // An account with no email can never match the allowlist, so reject
          // it at creation instead of storing a user who can never be admitted.
          if (!user.email?.trim()) {
            return false;
          }
          return { data: user };
        },
      },
    },
  },
});
