/**
 * Cache tag names, declared once.
 *
 * A response advertises its tags through the `headers()` rules in
 * next.config.ts, and a publish purges the same strings. The two only work
 * together while they are literally equal, and a mismatch fails silently: the
 * purge returns 200 and the CDN keeps serving the old page. Keeping one
 * declaration keeps them equal, so next.config.ts imports this module too.
 *
 * Nothing here may import runtime code: next.config.ts is loaded before the app
 * exists.
 */

export const BLOG_INDEX_TAG = "blog-index";
export const BLOG_LISTINGS_TAG = "blog-listings";
export const BLOG_POSTS_TAG = "blog-posts";
export const SITEMAP_TAG = "sitemap";
export const LLMS_FULL_TAG = "llms-full";

/** Every tag a publish clears. */
export const BLOG_PURGE_TAGS = [
  BLOG_POSTS_TAG,
  BLOG_INDEX_TAG,
  BLOG_LISTINGS_TAG,
  SITEMAP_TAG,
  LLMS_FULL_TAG,
] as const;
