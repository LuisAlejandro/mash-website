"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Downloads } from "@/lib/app-release";
import { RELEASES_URL, type PlatformId } from "@/lib/site";

export type AssetKey = keyof Downloads;
export type { Downloads };

export type Release = {
  state: "unavailable" | "ready";
  version: string;
  downloads: Downloads;
};

/**
 * Pre-fetch state. Nothing is known about the release yet, so every CTA links
 * to the releases page rather than to a file that may not exist.
 */
const UNAVAILABLE: Release = {
  state: "unavailable",
  version: "",
  downloads: {},
};

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
    () => "mac" as PlatformId
  );
}

/**
 * One release for the whole page, resolved on the server at prerender time and
 * handed down. No request leaves the browser, so the download path cannot be
 * stalled by GitHub's per-IP rate limit; the version refreshes when the page
 * revalidates or the site is rebuilt.
 */
export function ReleaseProvider({
  release,
  children,
}: {
  release: { version: string; downloads: Downloads } | null;
  children: ReactNode;
}) {
  const platform = usePlatformDetection();

  useEffect(() => {
    // CSS shows one platform's chords and hides the other's; both stay in the
    // markup so the static export carries each set.
    document.documentElement.dataset.platform = platform;
  }, [platform]);

  // A release with no asset this page can offer is not a release yet: every
  // CTA then points at the releases page instead of a missing file.
  const value: Release =
    release && Object.keys(release.downloads).length > 0
      ? {
          state: "ready",
          version: release.version,
          downloads: release.downloads,
        }
      : UNAVAILABLE;

  return (
    <ReleaseContext.Provider value={value}>
      <PlatformContext.Provider value={platform}>
        {children}
      </PlatformContext.Provider>
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
 * Primary action. On macOS it offers the Apple silicon DMG; on Linux it shows
 * the amd64 and arm64 .deb downloads side by side.
 */
export function ReleaseCta({
  className = "btn-solid",
}: {
  className?: string;
}) {
  const { state, version, downloads } = useRelease();
  const platform = usePlatform();

  if (platform === "linux") {
    const amd64 = downloads.linuxAmd64;
    const arm64 = downloads.linuxArm64;
    if (state === "ready" && (amd64 || arm64)) {
      return (
        <>
          {amd64 && (
            <a className={className} href={amd64} rel="noreferrer">
              Download {version} · amd64
            </a>
          )}
          {arm64 && (
            <a className={className} href={arm64} rel="noreferrer">
              Download {version} · arm64
            </a>
          )}
        </>
      );
    }
    return (
      <>
        <a className={className} href={RELEASES_URL} rel="noreferrer">
          Download · amd64
        </a>
        <a className={className} href={RELEASES_URL} rel="noreferrer">
          Download · arm64
        </a>
      </>
    );
  }

  if (state === "ready" && downloads.mac) {
    return (
      <a className={className} href={downloads.mac} rel="noreferrer">
        Download Mash {version} for macOS
      </a>
    );
  }

  return (
    <a className={className} href={RELEASES_URL} rel="noreferrer">
      Download Mash for macOS
    </a>
  );
}
