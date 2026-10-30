import { REPO_URL } from "./site";

/**
 * The latest published app release, read at prerender time so static copy
 * (schema, FAQ, index.md) names the real version without anyone editing it.
 *
 * The repo is public, so the unauthenticated API is enough. Revalidation keeps
 * a long-lived deployment current; a failed lookup returns null and the copy
 * falls back to the releases page with no version claimed.
 */
export type LatestRelease = { version: string; publishedAt: string };

const API =
  REPO_URL.replace("https://github.com/", "https://api.github.com/repos/") +
  "/releases/latest";

export async function getLatestAppRelease(): Promise<LatestRelease | null> {
  try {
    const response = await fetch(API, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as {
      tag_name?: unknown;
      published_at?: unknown;
    };
    if (typeof payload.tag_name !== "string" || payload.tag_name.length === 0) {
      return null;
    }
    return {
      version: payload.tag_name,
      publishedAt:
        typeof payload.published_at === "string"
          ? payload.published_at.slice(0, 10)
          : "",
    };
  } catch {
    return null;
  }
}
