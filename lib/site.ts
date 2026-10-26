/** Canonical facts about the site, shared by metadata, structured data, and copy. */

export const SITE_URL = "https://letsma.sh";
export const APP_NAME = "Mash";
export const REPO_URL = "https://github.com/LuisAlejandro/mash";
export const RELEASES_URL = `${REPO_URL}/releases`;
export const LICENSE = "GPL-3.0-or-later";

/**
 * The latest published app version, as of the last content update. Static copy
 * (schema, llms.txt, index.md) uses it; the live page reads the real release.
 */
export const APP_VERSION = "0.1.1";
export const APP_RELEASED = "2026-10-26";

/**
 * Empty until a single stable download URL is wanted. Structured data only
 * advertises a download once this is set; until then it points at the releases
 * page, which always exists.
 */
export const DOWNLOAD_URL = "";

/**
 * The words the hero slogan cycles through: the four programs Mash mashes
 * together, in the order the app layers them.
 */
export const MASHED = ["herdr", "ghostty", "pi", "fresh"] as const;

/**
 * The platforms Mash ships for. Each release publishes all three artifacts
 * together; a failed platform leaves the whole release unpublished.
 */
export const PLATFORMS = {
  mac: {
    id: "mac",
    label: "macOS",
    requirement: "Apple silicon Mac, macOS 14 or later",
    artifact: "One DMG, signed and notarized",
  },
  linux: {
    id: "linux",
    label: "Linux",
    requirement: "Ubuntu 24.04 with GNOME, on Wayland or Xorg",
    artifact: "One .deb for amd64 or arm64, with build attestation",
  },
} as const;

export type PlatformId = keyof typeof PLATFORMS;

/** The hero film, as recorded from the app. */
export const FILM = {
  path: "/assets/mash/hero-film.mp4",
  poster: "/assets/mash/hero-film-poster.png",
  width: 1600,
  height: 1000,
  duration: "PT26S",
  uploadDate: "2026-10-25",
} as const;

/** Verified capabilities, in the order the page lists them. */
export const CAPABILITIES = [
  "Workspaces and worktrees, one task each",
  "A coding agent in every workspace",
  "Editor and agent in the same tab",
  "Review tabs, with the diff beside the agent",
  "Command palette and fuzzy file finder",
  "Session search across every agent conversation",
  "Source control, annotations, and pane splits",
  "Plugin manager and detachable sessions",
  "macOS on Apple silicon, and Linux on amd64 or arm64",
];

/** The chapter captures, in story order. Used by the sitemap and index.md. */
export const CAPTURES = [
  {
    path: "/assets/mash/setup.png",
    title: "A Mash workspace",
    alt: "The agent session list, file explorer, editor, and agent notes in one Mash workspace",
    width: 1620,
    height: 1012,
  },
  {
    path: "/assets/mash/workspaces.png",
    title: "Workspace picker",
    alt: "Mash's workspace picker listing four workspaces with their paths",
    width: 1620,
    height: 1012,
  },
  {
    path: "/assets/mash/human-control.png",
    title: "File finder",
    alt: "Mash's file finder listing repository files with a source preview",
    width: 1620,
    height: 1012,
  },
  {
    path: "/assets/mash/review.png",
    title: "Review tab",
    alt: "Uncommitted changes, the working diff, branches, and recent commits in Mash's review tab",
    width: 1620,
    height: 1012,
  },
  {
    path: "/assets/mash/keyboard.png",
    title: "Command palette",
    alt: "Mash's command palette with the key combination printed beside each command",
    width: 1620,
    height: 1012,
  },
] as const;
