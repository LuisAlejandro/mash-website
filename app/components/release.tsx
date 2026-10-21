"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const LATEST_RELEASE = "https://api.github.com/repos/LuisAlejandro/mash/releases/latest";
const MAC_ARM64_DMG = /^Mash-.+-mac-arm64\.dmg$/i;

export type Release = {
  state: "unavailable" | "ready";
  version: string;
  downloadUrl: string;
};

/** Server-rendered truth: no public release has been seen yet. */
const UNAVAILABLE: Release = { state: "unavailable", version: "", downloadUrl: "" };

type Asset = { name?: unknown; browser_download_url?: unknown };

function parseRelease(payload: unknown): Release | null {
  if (typeof payload !== "object" || payload === null) return null;
  const { tag_name: tag, assets } = payload as { tag_name?: unknown; assets?: unknown };
  if (typeof tag !== "string" || tag.length === 0) return null;
  if (!Array.isArray(assets)) return null;

  const dmg = (assets as Asset[]).find(
    (asset) =>
      typeof asset?.name === "string" &&
      MAC_ARM64_DMG.test(asset.name) &&
      typeof asset.browser_download_url === "string",
  );
  if (!dmg || typeof dmg.browser_download_url !== "string") return null;

  return { state: "ready", version: tag, downloadUrl: dmg.browser_download_url };
}

const ReleaseContext = createContext<Release>(UNAVAILABLE);

/**
 * One latest-release request for the whole page. The server render is the
 * coming-soon state, so no dead download can ever ship; a resolved release
 * upgrades every CTA together.
 */
export function ReleaseProvider({ children }: { children: ReactNode }) {
  const [release, setRelease] = useState<Release>(UNAVAILABLE);

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

  return <ReleaseContext.Provider value={release}>{children}</ReleaseContext.Provider>;
}

export function useRelease(): Release {
  return useContext(ReleaseContext);
}

/** Primary action. A download once a compatible DMG exists, never before. */
export function ReleaseCta({ className = "btn-solid" }: { className?: string }) {
  const { state, version, downloadUrl } = useRelease();

  if (state === "ready") {
    return (
      <a className={className} href={downloadUrl} rel="noreferrer">
        Download Mash {version} for macOS
      </a>
    );
  }

  return (
    <span className={`${className} is-pending`} aria-disabled="true">
      Coming soon to macOS
    </span>
  );
}
