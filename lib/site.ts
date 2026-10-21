/** Canonical facts about the site, shared by metadata, structured data, and copy. */

export const SITE_URL = "https://letsma.sh";
export const APP_NAME = "Mash";
export const REPO_URL = "https://github.com/LuisAlejandro/mash";
export const RELEASES_URL = `${REPO_URL}/releases`;
export const LICENSE = "GPL-3.0-or-later";

/**
 * Empty until a public DMG exists. Structured data only advertises a download
 * once this is set, so the page never claims an artifact that 404s.
 */
export const DOWNLOAD_URL = "";

/** The hero film, as recorded from the app. */
export const FILM = {
  path: "/assets/mash/hero-film.mp4",
  poster: "/assets/mash/hero-film-poster.png",
  width: 1600,
  height: 1000,
  duration: "PT24S",
  uploadDate: "2026-10-20",
} as const;
