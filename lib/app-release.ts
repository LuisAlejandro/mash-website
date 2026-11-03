import { REPO_URL } from "./site";

/**
 * The latest published app release, read at prerender time so static copy
 * (schema, FAQ, index.md) names the real version without anyone editing it,
 * and so the download CTAs can link straight to a file.
 *
 * The repo is public, so the unauthenticated API is enough. One fetch serves
 * every visitor: the browser never calls GitHub, which keeps the 60-per-hour
 * unauthenticated rate limit out of the download path entirely.
 *
 * Revalidation is deliberately slow. A version bump is not urgent, and the
 * slower the lookup, the fewer calls it makes; a deploy refreshes it anyway.
 * A failed lookup returns null and the copy falls back to the releases page
 * with no version claimed.
 */
export type DownloadKey = "mac" | "linuxAmd64" | "linuxArm64";

export type Downloads = Partial<Record<DownloadKey, string>>;

export type LatestRelease = {
  version: string;
  publishedAt: string;
  /** Empty when a release carries no asset this page can offer. */
  downloads: Downloads;
};

const API =
  REPO_URL.replace("https://github.com/", "https://api.github.com/repos/") +
  "/releases/latest";

/** How long a successful lookup is reused before GitHub is asked again. */
const REVALIDATE_SECONDS = 12 * 60 * 60;

/**
 * The asset names `artifacts.yml` publishes: one macOS DMG and two Linux .deb
 * packages (amd64 and arm64). A release stays a draft until all of them are
 * attached, so a published release normally has every one of these.
 */
const ASSETS: Record<DownloadKey, RegExp> = {
  mac: /^Mash-.+-mac-arm64\.dmg$/i,
  linuxAmd64: /^letsmash-.+-linux-amd64\.deb$/i,
  linuxArm64: /^letsmash-.+-linux-arm64\.deb$/i,
};

type Asset = { name?: unknown; browser_download_url?: unknown };

function collectDownloads(assets: unknown): Downloads {
  const downloads: Downloads = {};
  if (!Array.isArray(assets)) return downloads;

  for (const key of Object.keys(ASSETS) as DownloadKey[]) {
    const match = (assets as Asset[]).find(
      (asset) =>
        typeof asset?.name === "string" &&
        ASSETS[key].test(asset.name) &&
        typeof asset.browser_download_url === "string"
    );
    if (match && typeof match.browser_download_url === "string") {
      downloads[key] = match.browser_download_url;
    }
  }

  return downloads;
}

export async function getLatestAppRelease(): Promise<LatestRelease | null> {
  try {
    const response = await fetch(API, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as {
      tag_name?: unknown;
      published_at?: unknown;
      assets?: unknown;
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
      downloads: collectDownloads(payload.assets),
    };
  } catch {
    return null;
  }
}
