/**
 * Stub used when FEATURE_BLOG is off, so a blog-off build never pulls the
 * Neon driver in. Reaching for `db` in that state is a programming error and
 * the callers in lib/blog raise a clear one.
 */
export const db = null;
