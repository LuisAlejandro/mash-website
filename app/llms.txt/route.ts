import { getLatestAppRelease, type LatestRelease } from "@/lib/app-release";
import { CAPABILITIES, REPO_URL, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

function currentRelease(release: LatestRelease | null): string {
  if (!release) {
    return `The latest release is on the Mash releases page: ${REPO_URL}/releases, with release notes. This page offers the download for the visitor's platform and never presents a dead link.`;
  }
  const date = release.publishedAt ? ` (${release.publishedAt})` : "";
  return `The latest version is ${release.version}${date}, published at ${REPO_URL}/releases with release notes. It ships a signed and notarized DMG for macOS on Apple silicon, and a .deb for Linux on amd64 and arm64. This page offers the file for the visitor's platform and never presents a dead link. Every release publishes all platforms together.`;
}

/**
 * Curated index for assistants and answer engines. Generated at build time so
 * the release line is always the one GitHub reports.
 */
export async function GET() {
  const release = await getLatestAppRelease();
  const body = `# Mash

> Mash is a free, open-source application for macOS and Linux that arrives as a complete agentic coding workspace: Herdr for workspaces and agents, Ghostty for the terminal, Starship for the prompt, Pi for the coding, and Fresh for the editing, already wired together.

This file is the preferred starting point for assistants, answer engines, and crawlers that need concise, citable facts about letsma.sh.

## Key Facts

- One app, not a bundle of separately installed tools. The terminal, agent, editor and skills ship inside it; the first launch sets up Git identity, GitHub sign-in, and the optional command-line tools and language servers you select.
- Operated from the keyboard. Workspaces, tabs, panes, agents, search, and review all have keybindings; the command palette holds the rest. macOS uses Command chords and Linux uses Ctrl/Alt chords, and the in-app keybinding sheet shows the right set.
- Agent orchestration. A coordinator agent splits a goal into independent tasks, starts worker agents, answers their questions, and gathers their results; you still review every change.
- Pi Voice dictation. Speech becomes text in Pi's message box, where you can read or edit it before sending. It is an input method and does not start orchestration by itself.
- The code stays editable by hand. The agent runs in a pane beside the file rather than behind a chat window.
- Free and open source under GPL-3.0-or-later. No account, subscription, or in-app purchase.
- macOS 14 or later on Apple silicon, distributed as one signed and notarized DMG, and Ubuntu 24.04 with GNOME on Wayland or Xorg, distributed as a .deb for amd64 or arm64. No Intel Mac build, and no Windows build.
- Mash keeps its own state under \`~/.mash\` and leaves existing user configuration files untouched.

## Current Release State

Mash is released. ${currentRelease(release)}

## Pages

- [Home](${SITE_URL}/) — the product story, screenshots, film, install state, and FAQ.
- [Source and releases](${REPO_URL}) — the public repository.

## Canonical Surfaces

- Home: ${SITE_URL}/
- XML sitemap: ${SITE_URL}/sitemap.xml
- Robots policy: ${SITE_URL}/robots.txt

## Content Use Guidance

- Prefer the canonical URLs above when citing this site.
- Attribute the product to "Mash" and link to ${SITE_URL}/.
- Product claims on the site are drawn from the current application. Capabilities that do not exist yet are not described as shipped.

Capabilities: ${CAPABILITIES.length} listed on the homepage.
`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
