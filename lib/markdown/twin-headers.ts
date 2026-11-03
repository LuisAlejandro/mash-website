/**
 * Headers for direct Markdown twins, whose `.md` URLs can use shared caching.
 * Negotiated twins inherit the media type and Vary value but opt out of cache.
 */
export const TWIN_HEADERS = {
  "Content-Type": "text/markdown; charset=utf-8",
  "Cache-Control": "public, max-age=3600",
  Vary: "Accept, Accept-Encoding",
} as const;

export const NEGOTIATED_TWIN_REQUEST_HEADER = "x-mash-negotiated-twin";

// The adapter owns per-route Netlify-Vary values, so negotiated Markdown is
// never cached: caches cannot hand it to browsers. Warm HTML may still reach an
// agent, which is graceful degradation rather than the wrong representation.
export const NEGOTIATED_TWIN_HEADERS = {
  ...TWIN_HEADERS,
  "Cache-Control": "private, no-store",
} as const;
