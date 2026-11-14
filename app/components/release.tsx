"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Downloads } from "@/lib/app-release";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";
import { UI } from "@/lib/i18n/ui";
import { RELEASES_URL, type PlatformId } from "@/lib/site";
import {
  DownloadButton,
  type Download,
  type DownloadOption,
} from "./download-menu";

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

type ReleaseCopy = (typeof UI)[Locale]["release"];

/**
 * What a platform's download button offers. Each published build is one
 * option; with none, the button goes to the releases page.
 */
export function platformDownload(
  platform: PlatformId,
  { state, version, downloads }: Release,
  copy: ReleaseCopy
): Download {
  const ready = state === "ready";
  const fallback: Download = {
    label:
      platform === "linux" ? copy.downloadLinuxLatest : copy.downloadMacLatest,
    options: [{ name: copy.appleSilicon, href: RELEASES_URL }],
    offered: false,
  };

  if (platform === "linux") {
    const options: DownloadOption[] = [];
    if (ready && downloads.linuxAmd64) {
      options.push({ name: "amd64", href: downloads.linuxAmd64 });
    }
    if (ready && downloads.linuxArm64) {
      options.push({ name: "arm64", href: downloads.linuxArm64 });
    }
    return options.length > 0
      ? { label: copy.downloadLinux(version), options, offered: true }
      : fallback;
  }

  const options: DownloadOption[] = [];
  if (ready && downloads.mac) {
    options.push({ name: copy.appleSilicon, href: downloads.mac });
  }
  if (ready && downloads.macAmd64) {
    options.push({ name: copy.intel, href: downloads.macAmd64 });
  }
  return options.length > 0
    ? { label: copy.downloadMac(version), options, offered: true }
    : fallback;
}

/**
 * Primary action. On macOS it offers the Apple silicon and Intel DMGs; on Linux
 * it offers the amd64 and arm64 .deb downloads.
 */
export function ReleaseCta({
  className = "btn-solid",
  locale = DEFAULT_LOCALE,
}: {
  className?: string;
  locale?: Locale;
}) {
  const release = useRelease();
  const platform = usePlatform();
  const download = platformDownload(platform, release, UI[locale].release);
  return <DownloadButton download={download} className={className} />;
}
