import { FAQ } from "@/lib/structured-data";
import { CAPABILITIES, CAPTURES, DOWNLOAD_URL, LICENSE, RELEASES_URL, REPO_URL, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Markdown twin of the homepage, generated at build time from the same arrays
 * the page renders. Answer engines and assistants get the claims as text, and
 * the capability and FAQ lists cannot drift from the HTML.
 */
export function GET() {
  const body = `# Mash

> Mash is a free, open-source macOS application that arrives as a complete
> agentic coding workspace: Herdr for workspaces and agents, Pi for the coding,
> and the Mash skills that teach both, already wired together.

Canonical URL: ${SITE_URL}/

## What Mash is

Mash arrives as one Mac app with the stack already wired together: Herdr for
workspaces and agents, Pi for the coding, and the Mash skills that teach both
your workflow. Everything runs from the keyboard, and the code stays visible and
editable by hand.

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

- Platform: macOS on Apple silicon. No Intel build.
- Distribution: one signed and notarized DMG.
- Price: free, open source under ${LICENSE}. No account, subscription, or in-app
  purchase.
- Current state: ${DOWNLOAD_URL ? `download at ${DOWNLOAD_URL}` : `no public release yet. The first build will be published at ${RELEASES_URL} with release notes, and ${SITE_URL}/ offers the download once a compatible DMG exists.`}
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
