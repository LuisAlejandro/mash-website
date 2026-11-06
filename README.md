# Mash website

The Mash website: a Next.js homepage that tells the product story with real
captures, plus a full Fumadocs user guide at [letsma.sh/docs/](https://letsma.sh/docs/).

Current version: 1.4.0

```bash
make serve       # http://localhost:3100 (HOST_PORT overrides the host side)
# Without Docker: npm run dev   # same port, no extra flags
npm run lint
npm run build   # .next, served by the Netlify Next.js runtime
```

## Brand assets

`public/assets/mash/` holds every identity mark the page uses. They are derived
from the artwork in the `mash` repository, so re-run the generator when that
artwork changes:

```bash
python3 scripts/build-brand-assets.py
```

It reads `../mash/branding/logo-solid.png` and writes the logo marks, favicon,
Apple touch icon, and the share card. It needs `sips` (macOS) and `ffmpeg`.

## Media

The 1600×1000 hero film shows the entire Mash window, including chrome and
status bar. Its 2026-10-25 reshoot is separate from the older chapter stills
and workflow frames. A separate 16-second orchestration film and two Pi Voice
stills come from a neutral demo project. `docs/media-capture.md` records the
window geometry, capture method, and checks. The site build never records or
fetches media.

## Documentation

`content/docs/` contains the Fumadocs pages and sidebar order. They cover
installation, first launch, workspaces, agents, the editor, terminal tools,
shortcuts, configuration, and troubleshooting without screenshots. The Mash
[app repository](https://github.com/LuisAlejandro/mash) is the source of truth
for behavior and platform-specific keys; update the relevant pages when that
app changes. `app/docs/` renders the pages in the existing Next.js build and
`/api/search/` serves a static search index built from the same content.

## Blog (optional)

The site ships an optional blog with a GitHub-authenticated admin. It is off by
default: with no environment set, `/blog` and `/admin` return 404, no database
or auth code is bundled, and the site builds and deploys exactly as it did
before the blog existed.

Turning it on needs a Neon project, a GitHub OAuth app, and a Netlify purge
token. Copy `.env.example` to `.env` and fill in the marked sections. The schema
is migrated for you: every Netlify build run with `FEATURE_BLOG=1` applies
pending migrations before `next build`, so nothing has to be run by hand. That
step needs `DATABASE_URL_UNPOOLED` (Neon's direct connection) in the build
environment; without it the build stops with a message naming the variable.
Deploy Previews skip migrations by default so a pull request cannot alter the
production schema; set `MIGRATE_ON_PREVIEW=1` to opt in.

Set both `FEATURE_BLOG=1` and `NEXT_PUBLIC_FEATURE_BLOG=1`; the first gates
routes and server modules, the second drives client navigation, and setting
only one leaves the site linking to pages that 404.

What it serves:

- `/blog`, `/blog/posts/<slug>`, `/blog/category`, `/blog/category/<name>`
- RSS, Atom, and JSON feeds under `/blog/posts/`, advertised through the
  blog's `alternates` metadata
- `/admin` for creating, editing, publishing, unpublishing, and deleting posts
- `/api/search-posts`, `/api/last-posts`, `/api/trending-posts`, and
  `POST /api/revalidate` for invalidating caches from outside the admin UI

Access is limited to the addresses in `ADMIN_EMAIL_ALLOWLIST`, matched against
the signed-in GitHub account's email. An empty allowlist denies everyone, so
set it before expecting to get in. Publishing clears Next's cache and then
purges the CDN by tag; if the purge is not configured the action fails rather
than reporting a publish that leaves stale pages on the CDN.

Posts are written in Markdown and rendered with raw HTML passed through, so the
trust boundary is the allowlist. Widening it to people who should not be able
to inject markup means adding a sanitizer in `lib/markdown-to-html.ts` first.

## Deploy

`npm run build` writes `.next/`, served by Netlify's Next.js runtime via
`@netlify/plugin-nextjs` (`netlify.toml`). This is **not** a static export:
route handlers and the docs compile into the same app and deploy. No separate
Astro site or Netlify proxy is needed.

## Discovery

The site publishes a discovery layer for assistants, answer engines and agents:
Markdown documents for every page that can have one, a linkset catalog, and a
read-only MCP endpoint. `/llms.txt` is agent tooling — a curated entry point an
agent reads first — not a search-ranking lever; ranking is the HTML, the sitemap
and the structured data.

- `app/llms.txt/route.ts` — the curated site and docs index, advertised through
  the `Link: rel="describedby"` header.
- `app/llms-full.txt/route.ts` — the whole documentation as one Markdown
  document, assembled by `lib/llms/build-llms-full.ts` from the same processed
  Markdown the pages render, with published post bodies appended when the blog
  is on.
- `app/index.md/route.ts` — the homepage in Markdown, rendered from the authored
  narrative in `content/llms/` with its `{{SITE_URL}}`,
  `{{DERIVED_AVAILABILITY}}` and `{{DERIVED_CAPTURES}}` placeholders filled from
  `lib/site.ts` and `lib/structured-data.ts`.
- Markdown twins — any docs page answers at `<page>.md`, and blog posts and
  categories do when the blog is on. One resolver (`lib/markdown/`) maps a path
  to a document and the `.md` rewrite in `next.config.ts` routes it there;
  `/index.md` keeps its own route so the homepage twin is untouched.
- Accept negotiation — `proxy.ts` serves that Markdown twin to a request that
  prefers `text/markdown`, and the HTML page to everything else. Negotiated
  Markdown is `Cache-Control: private, no-store` on purpose: a cache must never
  hand Markdown to a browser.
- `public/agents.md` — the short guide an agent reads after arriving.
- `app/.well-known/api-catalog` and `app/.well-known/agent-permissions.json` —
  the linkset catalog of the published surfaces and the matching read-only
  permission set, both rendered from `lib/discovery/surfaces.ts` so they cannot
  disagree.
- `.well-known/agent-skills/` — two hand-written `SKILL.md` documents and an
  index that hashes them, written at prebuild by
  `scripts/generate-agent-skills.mjs`.
- `app/api/mcp` — a read-only MCP endpoint exposing `get_site_discovery`,
  `search_docs` and `get_docs_page`, plus `search_blog_posts` and
  `get_latest_posts` when the blog is on. `@modelcontextprotocol/sdk` is the one
  runtime dependency outside the docs and blog stacks, and it stays read-only.
- `app/robots.txt/route.ts` — names the AI crawlers explicitly, states a
  Content-Signal (`ai-train` is a one-line constant, `yes` by default) and the
  canonical `Host`.
- `app/ai.txt/route.ts` — attribution and citation policy.
- `app/sitemap.ts` — every docs and blog surface, with docs modification dates
  read from Git history and left out entirely when a checkout has none.

Structured data comes from `lib/structured-data.ts`: the homepage `@graph`
(Organization, WebSite, SoftwareApplication, VideoObject) with a FAQPage built
from the array the FAQ section renders, a WebPage node on each docs page, and
Blog and BlogPosting nodes on the blog surfaces. `lib/site.ts` holds the
canonical URL, repository, capability list, captures and the `DOWNLOAD_URL` that
gates the schema's download claim.

## Release state

The download call to action reads the latest release of
`LuisAlejandro/mash` on the server and offers the file for the visitor's
platform: the `Mash-<version>-mac-arm64.dmg` on macOS, or the
`letsmash-<version>-linux-{amd64,arm64}.deb` on Linux. If the request fails or
a release lacks those assets, every download button falls back to the releases
page, so no CTA is ever dead.

Static copy has no hardcoded version. `lib/app-release.ts` fetches the latest
release of `LuisAlejandro/mash` at prerender time (revalidated every 12 hours) and feeds
the `softwareVersion` in structured data, the download FAQ, `index.md`,
`llms.txt`, and `ai.txt`. If that lookup fails, those pages say "the latest
release is on the releases page" and claim no version.
