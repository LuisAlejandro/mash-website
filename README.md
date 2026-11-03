# Mash website

The Mash website: a Next.js homepage that tells the product story with real
captures, plus a full Fumadocs user guide at [letsma.sh/docs/](https://letsma.sh/docs/).

Current version: 1.1.2

```bash
npm install
HOST_PORT=3100 make serve # http://localhost:3100 (default; HOST_PORT overrides)
# Without Docker: npm run dev -- -p 3100
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

## Deploy

`npm run build` writes `.next/`, served by Netlify's Next.js runtime via
`@netlify/plugin-nextjs` (`netlify.toml`). This is **not** a static export:
route handlers and the docs compile into the same app and deploy. No separate
Astro site or Netlify proxy is needed.

## Discovery

Three surfaces serve assistants and answer engines:

- `app/llms.txt/route.ts` — curated site and docs index, advertised through the
  `Link: rel="describedby"` header in `netlify.toml`.
- `app/index.md/route.ts` — the page's markdown twin, generated at build time
  from the same arrays the HTML renders, so lists cannot drift.
- `app/robots.txt/route.ts` — names the AI crawlers explicitly and states a
  Content-Signal (`ai-train` is a one-line constant, `yes` by default).
- `app/ai.txt/route.ts` — attribution and citation policy. Structured data on
  the homepage comes from `lib/structured-data.ts`: an `@graph` of Organization,
  WebSite, SoftwareApplication, and VideoObject, plus an FAQPage built from the
  same array the FAQ section renders. `lib/site.ts` holds the canonical URL,
  repository, capability list, captures, and the `DOWNLOAD_URL` that gates the
  schema's download claim. The sitemap lists every docs page and declares image
  and video namespaces only for entries it actually emits.

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
