<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Mash website: agent guide

The public homepage for Mash (`https://letsma.sh`). One Next.js App Router route, plus generated text endpoints for assistants. Source of truth for the app itself is the separate `LuisAlejandro/mash` repo.

## Stack

- Next.js 16.3.8, React 19.2.8, TypeScript 5.9.x (the repo's `node_modules/typescript`), Tailwind 4 via PostCSS.
- Deploys to Netlify through the Next.js runtime (`netlify.toml`, `publish = ".next"`). **There is no static export and no `out/` directory**: `next.config.ts` does not set `output: "export"`.
- Node 24 (`NODE_VERSION` in `netlify.toml`).

## Commands

Prefer Docker through Make when the container setup is running (`Dockerfile`, `docker-compose.yml`, `Makefile`):

| Intent | Command |
| --- | --- |
| Start the container | `make start` |
| Install deps in container | `make dependencies` |
| Dev server (0.0.0.0:3000) | `make serve` |
| Production build | `make build` |
| Lint | `make lint` |
| Type-check (CI `make test`) | `make test` |
| Format | `make format` |
| Full release preflight | `make release-preflight` |

On the host, the same scripts exist in `package.json`: `npm run dev`, `npm run build`, `npm run lint`, `npm run type-check`, `npm run format`.

The host port defaults to 3000. Another local project often holds 3000; set `HOST_PORT=3100 make serve` to avoid it.

## Layout

- `app/layout.tsx`: root layout, metadata, and the JSON-LD `<script>` tags. Async: it reads the latest release.
- `app/page.tsx`: the single homepage route. Async: passes the FAQ built from the release into `Faq`.
- `app/components/`: UI sections. `release.tsx` holds the `ReleaseProvider` that fetches the latest release in the browser, plus `ReleaseCta`. `install-blocks.tsx` and `header.tsx` consume it.
- `app/index.md/route.ts`, `app/llms.txt/route.ts`, `app/ai.txt/route.ts`, `app/robots.txt/route.ts`, `app/sitemap.ts`: text and XML endpoints, all generated at build time.
- `lib/site.ts`: shared constants (`SITE_URL`, `REPO_URL`, `RELEASES_URL`, `PLATFORMS`, `CAPABILITIES`, `CAPTURES`, `FILM`, `MASHED`, `DOWNLOAD_URL`).
- `lib/app-release.ts`: `getLatestAppRelease()` fetches `LuisAlejandro/mash` latest release with `next: { revalidate: 3600 }`. Returns `null` on failure.
- `lib/structured-data.ts`: JSON-LD graph (`buildSiteGraph`), FAQ list (`buildFaq`), FAQ schema (`buildFaqSchema`).
- `public/`: static assets only (`assets/mash/`, `fonts/`, `github-icon.svg`). The old `public/llms.txt` and `public/ai.txt` are now route handlers in `app/`.
- `scripts/`: release tooling from maintainer-tools (`release.sh`, `lib.sh`, `rollback.sh`) and `build-brand-assets.py` (macOS `sips`). Do not hand-edit `lib.sh`; it is managed upstream.
- `docs/media-capture.md`: the capture contract for hero film and stills.

## Rules that have bitten this repo

- **Never hardcode the app version or release date.** The version comes from GitHub at build time (`lib/app-release.ts`). Copy must still read correctly when the lookup returns `null`: say the latest release is on the releases page, and claim no version.
- **Every download CTA must resolve.** Platform downloads link to the file when the release has it, and otherwise to `RELEASES_URL`. Never render a disabled "Coming soon" control.
- **Canonical app repo is `LuisAlejandro/mash`.** `REPO_URL` and `RELEASES_URL` point there, not at this repo.
- **Structured data must not claim a download that 404s.** `DOWNLOAD_URL` stays empty until a stable per-file URL exists; `offers.url` uses `RELEASES_URL` instead.
- **Do not describe unshipped capabilities.** Platforms are macOS 14+ on Apple silicon and Ubuntu 24.04 (amd64, arm64). No Intel Mac, no Windows.
- **Route handlers are `force-static` plus `fetch` with `revalidate`.** A new text endpoint that needs live data should follow `app/llms.txt/route.ts`, not a file in `public/`.
- **Netlify headers still target `/llms.txt`, `/ai.txt`, `/index.md` by path.** Keep those paths when renaming.

## Conventions

- Commit subjects use the gitchangelog tags: `[ADD]`, `[FIX]`, `[REF]`, `[DEL]`. Append `!cosmetic` for non-user-facing work. Commits are GPG-signed (`user.signingkey` is set).
- Formatting is Prettier with `printWidth: 80`, `semi`, double quotes, `trailingComma: es5`. Run `make format` before pushing; the release preflight fails if it changes files.
- Lint is `eslint` with `eslint-config-next` (core-web-vitals and TypeScript). Ignores: `.next/`, `build/`, `next-env.d.ts`.
- Path alias `@/*` maps to the repo root.
- Do not add a dependency for something the standard library or the platform already provides (see `package.json`: only `next`, `react`, `react-dom` at runtime).

## Workflow

- Work on `develop`. PRs target `develop`; `develop` is the GitHub default branch.
- `master` is production. Only the release scripts (`make release-patch|minor|major`) move `master`; they run preflight, wait for CI on the release branch, tag, and publish a GitHub release.
- Do not run a release unless the user asks for one.
- Release CI (`push.yml`) runs `make build`, `make lint`, and `make test` on `release/**` and `master`.

## Editing guidance for agents

- Read the relevant file before editing. `app/components/release.tsx` and `lib/structured-data.ts` are the two places most copy depends on.
- When you change a user-visible claim (platforms, capabilities, pricing, licence), check the same claim in all of these: `lib/structured-data.ts` (FAQ and schema), `app/index.md/route.ts`, `app/llms.txt/route.ts`, `app/ai.txt/route.ts`, `app/components/install-blocks.tsx`, and `README.md`.
- The brand and media assets in `public/assets/mash/` are generated from the app repo. Re-running `scripts/build-brand-assets.py` needs `sips` (macOS) and `ffmpeg`.
- Before committing, run `make lint`, `make test`, and `make build`. Without Docker, `npx eslint`, `npx next typegen && npx tsc --noEmit`, and `npx next build` are equivalent.

## Known issues

- Fresh's TypeScript language server fails when the global Homebrew `typescript` is 7.x (no `lib/tsserver.js`). The repo pins 5.9.x in `node_modules`; use that for editor tooling.
- `CLAUDE.md` used to contain `@AGENTS.md`; it is no longer tracked.
