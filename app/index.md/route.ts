import { FAQ } from "@/lib/structured-data";
import {
  APP_RELEASED,
  APP_VERSION,
  CAPABILITIES,
  CAPTURES,
  DOWNLOAD_URL,
  LICENSE,
  RELEASES_URL,
  REPO_URL,
  SITE_URL,
} from "@/lib/site";

export const dynamic = "force-static";

/**
 * Markdown twin of the homepage, generated at build time from the same arrays
 * the page renders. Answer engines and assistants get the claims as text, and
 * the capability and FAQ lists cannot drift from the HTML.
 */
export function GET() {
  const body = `# Mash

> Mash is a free, open-source application for macOS and Linux that arrives as a
> complete agentic coding workspace: Herdr for workspaces and agents, Ghostty
> for the terminal, Pi for the coding, and Fresh for the editing, already wired
> together.

Canonical URL: ${SITE_URL}/

## What Mash is

Mash arrives as one app with the stack already wired together: Herdr for
workspaces and agents, Ghostty for the terminal, Pi for the coding, and Fresh
for the editing, with the Mash skills that teach your workflow. Everything runs
from the keyboard, and the code stays visible and editable by hand.

- **One workspace per task**, each with its own tabs, terminals, and agent, so a
  second and third agent never bury the first.
- **The code stays yours.** The agent works in a pane beside the file, not
  behind a chat window. Open the buffer, make the change yourself, and the agent
  picks up from what is on disk.
- **Speed still ends in a human review.** Agents propose and you decide what
  lands, hunk by hunk, before anything is committed.
- **Keyboard first.** Workspaces, tabs, panes, agents, search, and review all
  have keys, and the command palette holds the rest.

## Capabilities

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
- Current state: ${DOWNLOAD_URL ? `download at ${DOWNLOAD_URL}` : `released. Latest version ${APP_VERSION} (${APP_RELEASED}) is published at ${RELEASES_URL} with release notes: a signed and notarized DMG for macOS on Apple silicon, and a .deb for Linux on amd64 and arm64. ${SITE_URL}/ offers the file for the visitor's platform. Every release publishes all platforms together.`}
- Source: ${REPO_URL}

## Captures

Each image below is a real state from the application.

${CAPTURES.map((c) => `- [${c.title}](${SITE_URL}${c.path}) — ${c.alt}`).join("\n")}
- [A tour of Mash](${SITE_URL}/assets/mash/hero-film.mp4) — the command palette,
  workspace picker, file finder, and review tab, recorded from the full Mash window (26s).

## Questions

${FAQ.map((item) => `### ${item.question}\n\n${item.answer}`).join("\n\n")}

## Content use

Prefer the canonical URL above when citing this page. Attribute the product to
"Mash" and link to ${SITE_URL}/. Claims here are drawn from the current
application; capabilities that do not exist yet are not described as shipped.

---

Snapshot generated at: ${new Date().toISOString()}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      Vary: "Accept-Encoding",
    },
  });
}
