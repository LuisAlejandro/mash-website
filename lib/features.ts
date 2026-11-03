/**
 * Feature flags for optional modules.
 *
 * Server `FEATURE_*` flags gate routes, APIs, and server-only module loading.
 * The `NEXT_PUBLIC_*` mirrors are inlined into the client bundle and drive
 * navigation only. When enabling a module, set both.
 *
 * Both default to off, so a deploy with no environment configured behaves
 * exactly like the site did before the blog existed.
 */

export const FEATURE_BLOG = process.env.FEATURE_BLOG === "1";

/** Client-safe mirror. Prefer this in client components. */
export const PUBLIC_FEATURE_BLOG = process.env.NEXT_PUBLIC_FEATURE_BLOG === "1";
