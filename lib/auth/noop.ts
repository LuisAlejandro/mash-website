/**
 * Stub used when FEATURE_BLOG is off, so a blog-off build never pulls Better
 * Auth in. Callers treat a null instance as "nobody is signed in".
 */
export const auth = null;
