import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { LatestRelease } from "../app-release";
import { DEFAULT_LOCALE, type Locale } from "../i18n/locale.ts";
import { SITE_URL } from "../site.ts";

/**
 * The authored homepage narrative, with its derived placeholders intact.
 *
 * One file per language: `home.md` is the English original, `home.es.md` the
 * Spanish translation. A missing file is a crash rather than a silent English
 * page under a Spanish URL.
 */
export function getMarketingNarrative(locale: Locale = DEFAULT_LOCALE): string {
  const file = locale === DEFAULT_LOCALE ? "home.md" : `home.${locale}.md`;

  return readFileSync(
    resolve(process.cwd(), "content/llms", file),
    "utf8"
  ).trim();
}

export function latestLine(
  release: LatestRelease | null,
  locale: Locale = DEFAULT_LOCALE
): string {
  if (!release || Object.keys(release.downloads).length === 0) {
    return locale === "es" ? "la última versión" : "the latest release";
  }
  const date = release.publishedAt ? ` (${release.publishedAt})` : "";
  return locale === "es"
    ? `última versión ${release.version}${date}`
    : `latest release ${release.version}${date}`;
}

export function substituteMarketingPlaceholders(
  narrative: string,
  availability: string,
  captures: string
): string {
  if (!narrative.includes("{{DERIVED_AVAILABILITY}}")) {
    throw new Error("Marketing narrative is missing DERIVED_AVAILABILITY.");
  }
  if (!narrative.includes("{{DERIVED_CAPTURES}}")) {
    throw new Error("Marketing narrative is missing DERIVED_CAPTURES.");
  }

  const output = narrative
    .replaceAll("{{SITE_URL}}", SITE_URL)
    .replace("{{DERIVED_AVAILABILITY}}", availability)
    .replace("{{DERIVED_CAPTURES}}", captures);
  if (output.includes("{{")) {
    throw new Error("Marketing narrative contains an unresolved placeholder.");
  }
  return output;
}
