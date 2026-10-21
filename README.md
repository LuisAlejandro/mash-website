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

## Release state

The download call to action reads the latest release of
`LuisAlejandro/mash` from the browser. It offers the DMG only when a release has
a `Mash-<version>-mac-arm64.dmg` asset; otherwise the page states that the
download is coming soon and keeps GitHub available.
