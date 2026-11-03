/**
 * Response headers shared by every Markdown twin.
 *
 * They live in one module so the `.md` routes, the homepage twin and a later
 * `Accept`-negotiated response cannot drift apart. `Vary` names `Accept` even
 * before negotiation exists, because the same URL already serves one
 * representation today and must never be cached for another one later.
 */
export const TWIN_HEADERS = {
  "Content-Type": "text/markdown; charset=utf-8",
  "Cache-Control": "public, max-age=3600",
  Vary: "Accept, Accept-Encoding",
} as const;
