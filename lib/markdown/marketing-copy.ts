import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { LatestRelease } from "../app-release";
import { SITE_URL } from "../site.ts";

/** The authored homepage narrative, with its derived placeholders intact. */
export function getMarketingNarrative(): string {
  return readFileSync(
    resolve(process.cwd(), "content/llms/home.md"),
    "utf8"
  ).trim();
}

export function latestLine(release: LatestRelease | null): string {
  if (!release || Object.keys(release.downloads).length === 0) {
    return "the latest release";
  }
  const date = release.publishedAt ? ` (${release.publishedAt})` : "";
  return `latest release ${release.version}${date}`;
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
