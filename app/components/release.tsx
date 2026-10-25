"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { PLATFORMS, type PlatformId } from "@/lib/site";

const LATEST_RELEASE = "https://api.github.com/repos/LuisAlejandro/mash/releases/latest";

/**
 * The asset names `artifacts.yml` publishes, one per platform. Linux ships a
 * .deb per architecture; the page offers amd64, with arm64 a click away in the
 * release notes, because a browser cannot tell the two apart.
 */
const ASSETS: Record<PlatformId, RegExp> = {
  mac: /^Mash-.+-mac-arm64\.dmg$/i,
  linux: /^letsmash-.+-linux-amd64\.deb$/i,
};

export type Downloads = Partial<Record<PlatformId, string>>;

export type Release = {
  state: "unavailable" | "ready";
  version: string;
  downloads: Downloads;
};

/** Server-rendered truth: no public release has been seen yet. */
const UNAVAILABLE: Release = { state: "unavailable", version: "", downloads: {} };

type Asset = { name?: unknown; browser_download_url?: unknown };

function parseRelease(payload: unknown): Release | null {
  if (typeof payload !== "object" || payload === null) return null;
  const { tag_name: tag, assets } = payload as { tag_name?: unknown; assets?: unknown };
  if (typeof tag !== "string" || tag.length === 0) return null;
  if (!Array.isArray(assets)) return null;

  const downloads: Downloads = {};
  for (const [platform, pattern] of Object.entries(ASSETS) as [PlatformId, RegExp][]) {
    const match = (assets as Asset[]).find(
      (asset) =>
        typeof asset?.name === "string" &&
        pattern.test(asset.name) &&
        typeof asset.browser_download_url === "string",
    );
    if (match && typeof match.browser_download_url === "string") {
      downloads[platform] = match.browser_download_url;
    }
  }

  // A release with no asset this page can offer is not a release yet.
  if (Object.keys(downloads).length === 0) return null;

  return { state: "ready", version: tag, downloads };
}

const ReleaseContext = createContext<Release>(UNAVAILABLE);
const PlatformContext = createContext<PlatformId>("mac");

/** Best guess at the visitor's platform, used only to order the UI. */
function detectPlatform(): PlatformId {
  const hint = `${navigator.userAgent} ${navigator.platform ?? ""}`;
  // Android reports "Linux" too, and Mash has no Android build; treating it as
  // Linux would offer a .deb to a phone.
  if (/android/i.test(hint)) return "mac";
  if (/linux|x11|ubuntu|debian/i.test(hint)) return "linux";
  return "mac";
}

/**
 * The platform is a property of the browser, not React state, so it is read
 * through a store: the server and the hydrating render both say "mac" (what
 * the HTML contains), and the client settles on the real value in one pass
 * instead of a second render triggered from an effect.
 */
const neverChanges = () => () => {};
function usePlatformDetection(): PlatformId {
  return useSyncExternalStore(
    neverChanges,
    detectPlatform,
    () => "mac" as PlatformId,
  );
}

/**
 * One latest-release request for the whole page. The server render is the
 * coming-soon state, so no dead download can ever ship; a resolved release
 * upgrades every CTA together.
 */
export function ReleaseProvider({ children }: { children: ReactNode }) {
  const [release, setRelease] = useState<Release>(UNAVAILABLE);
  const platform = usePlatformDetection();

  useEffect(() => {
    // CSS shows one platform's chords and hides the other's; both stay in the
    // markup so the static export carries each set.
    document.documentElement.dataset.platform = platform;
  }, [platform]);

  useEffect(() => {
    const controller = new AbortController();
    let live = true;

    fetch(LATEST_RELEASE, { signal: controller.signal, credentials: "omit" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: unknown) => {
        const next = parseRelease(payload);
        if (live && next) setRelease(next);
      })
      .catch(() => {});

    return () => {
      live = false;
      controller.abort();
    };
  }, []);

  return (
    <ReleaseContext.Provider value={release}>
      <PlatformContext.Provider value={platform}>{children}</PlatformContext.Provider>
    </ReleaseContext.Provider>
  );
}

export function useRelease(): Release {
  return useContext(ReleaseContext);
}

/** The visitor's platform, defaulting to macOS until the client says otherwise. */
export function usePlatform(): PlatformId {
  return useContext(PlatformContext);
}

/**
 * Primary action. A download once this platform has an asset, never before.
 * The server render and the first client render agree on macOS, so the markup
 * matches until the effect runs.
 */
export function ReleaseCta({ className = "btn-solid" }: { className?: string }) {
  const { state, version, downloads } = useRelease();
  const platform = usePlatform();
  const href = downloads[platform];
  const label = PLATFORMS[platform].label;

  if (state === "ready" && href) {
    return (
      <a className={className} href={href} rel="noreferrer">
        Download Mash {version} for {label}
      </a>
    );
  }

  return (
    <span className={`${className} is-pending`} aria-disabled="true">
      Coming soon to macOS and Linux
    </span>
  );
}
