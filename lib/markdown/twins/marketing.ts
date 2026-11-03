import { getLatestAppRelease, type LatestRelease } from "@/lib/app-release";
import { getMarketingNarrative } from "@/lib/llms/marketing";
import { buildFaq } from "@/lib/structured-data";
import {
  CAPABILITIES,
  CAPTURES,
  DOWNLOAD_URL,
  FILM,
  LICENSE,
  ORCHESTRATION_FILM,
  RELEASES_URL,
  REPO_URL,
  SITE_URL,
} from "@/lib/site";

/**
 * The release line, which may only claim the page offers a file when the
 * release actually carries one. A release published by hand in the GitHub UI
 * builds nothing, so that state is reachable by mistake.
 */
function latestLine(release: LatestRelease | null): string {
  if (!release || Object.keys(release.downloads).length === 0) {
    return "the latest release";
  }
  const date = release.publishedAt ? ` (${release.publishedAt})` : "";
  return `latest release ${release.version}${date}`;
}

/**
 * Markdown twin of the homepage, generated at build time from the same arrays
 * the page renders. Answer engines and assistants get the claims as text, and
 * the capability and FAQ lists cannot drift from the HTML.
 *
 * This is the only homepage Markdown renderer: `/index.md` and the `.md` twin
 * route both serve its output, so there is one document to keep truthful.
 */
export async function marketingMarkdown(): Promise<string> {
  const release = await getLatestAppRelease();
  const faq = buildFaq(release);

  // The authored corpus carries placeholders for the derived sections, so the
  // prose stays editable without the layout living in two places.
  const availability = `## Capabilities

${CAPABILITIES.map((item) => `- ${item}`).join("\n")}

## Install and availability

- Platforms: macOS 14 or later on Apple silicon, and Ubuntu 24.04 with GNOME on
  Wayland or Xorg. No Intel Mac build, and no Windows build.
- Distribution: one signed and notarized DMG for macOS; a .deb for Linux on
  amd64 or arm64, installing to /opt/letsmash with build attestation.
- Keyboard: macOS uses Command chords, Linux uses Ctrl/Alt chords. The in-app
  keybinding sheet shows the keys for the machine you are on.
- Price: free, open source under ${LICENSE}. No account, subscription, or in-app
  purchase.
- Current state: ${DOWNLOAD_URL ? `download at ${DOWNLOAD_URL}` : `${latestLine(release)} is published at ${RELEASES_URL} with release notes: a signed and notarized DMG for macOS on Apple silicon, and a .deb for Linux on amd64 and arm64. ${SITE_URL}/ offers the file for the visitor's platform. Every release publishes all platforms together.`}
- Source: ${REPO_URL}`;

  const captures = `## Captures

Each image below is a real state from the application.

${CAPTURES.map((c) => `- [${c.title}](${SITE_URL}${c.path}) — ${c.alt}`).join("\n")}
- [A tour of Mash](${SITE_URL}${FILM.path}) — the command palette,
  workspace picker, file finder, and review tab, recorded from the full Mash window (${FILM.duration.slice(2).toLowerCase()}).
- [${ORCHESTRATION_FILM.title}](${SITE_URL}${ORCHESTRATION_FILM.path}) — ${ORCHESTRATION_FILM.description} (${ORCHESTRATION_FILM.seconds}s).

## Questions

${faq.map((item) => `### ${item.question}\n\n${item.answer}`).join("\n\n")}`;

  const narrative = getMarketingNarrative()
    .replaceAll("{{SITE_URL}}", SITE_URL)
    .replace("{{DERIVED_AVAILABILITY}}", availability)
    .replace("{{DERIVED_CAPTURES}}", captures);

  return `# Mash

${narrative}

---

Snapshot generated at: ${new Date().toISOString()}
`;
}
