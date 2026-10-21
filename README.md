# Mash website

The Mash homepage: one Next.js route that tells the product story with real
captures of the app.

```bash
npm install
npm run dev     # http://localhost:3001 if 3000 is taken
npm run lint
npm run build   # static export to out/
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

The hero film, chapter stills, and workflow frames are cut from one recording of
the real app. `docs/media-capture.md` is the capture contract: session order,
export sizes, and the privacy checks. The site build never records or fetches
media.

## Deploy

The site is a static export: `npm run build` writes `out/`, and `netlify.toml`
tells Netlify to publish that folder. No Next.js adapter or server runtime is
involved, so the output also works on any static host.

Point the `letsma.sh` DNS at the Netlify site once the first deploy succeeds.

## Discovery

Three surfaces serve assistants and answer engines:

- `public/llms.txt` — curated site index, advertised through the
  `Link: rel="describedby"` header in `netlify.toml`.
- `app/index.md/route.ts` — the page's markdown twin, generated at build time
  from the same arrays the HTML renders, so lists cannot drift.
- `app/robots.txt/route.ts` — names the AI crawlers explicitly and states a
  Content-Signal (`ai-train` is a one-line constant, `yes` by default).
- `public/ai.txt` — attribution and citation policy. Structured
data lives in `lib/structured-data.ts` — an `@graph` of Organization, WebSite,
SoftwareApplication, and VideoObject, plus an FAQPage built from the same array
the FAQ section renders. `lib/site.ts` holds the canonical URL, repository, capability list, capture
list, and the `DOWNLOAD_URL` that gates the schema's download claim. The sitemap
declares image and video namespaces only for entries it actually emits.

## Release state

The download call to action reads the latest release of
`LuisAlejandro/mash` from the browser. It offers the DMG only when a release has
a `Mash-<version>-mac-arm64.dmg` asset; otherwise the page states that the
download is coming soon and keeps GitHub available.
