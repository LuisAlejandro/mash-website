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
| Strip image metadata (host, manual) | `npm run optimize-images` |

On the host, the same scripts exist in `package.json`: `npm run dev`, `npm run build`, `npm run lint`, `npm run type-check`, `npm run format`.

The host port defaults to 3000. Another local project often holds 3000; set `HOST_PORT=3100 make serve` to avoid it.

## Layout

- `app/layout.tsx`: root layout and static site metadata. Synchronous, with no release read and no JSON-LD. The social preview image, site name, locale and twitter card come from `lib/metadata.ts`, so a page that returns its own `openGraph` keeps the inherited image.
- `app/page.tsx`: the single homepage route. Async: emits the site JSON-LD `@graph` and the FAQPage, and passes the FAQ built from the release into `Faq`.
- `app/components/`: UI sections. `release.tsx` holds the `ReleaseProvider` that fetches the latest release in the browser, plus `ReleaseCta`. `install-blocks.tsx` and `header.tsx` consume it.
- `app/index.md/`, `app/llms.txt/`, `app/llms-full.txt/`, `app/ai.txt/`, `app/robots.txt/`, `app/sitemap.ts`: text and XML endpoints, generated at build time.
- `app/markdown-twin/[[...path]]/route.ts`: the one route behind every Markdown twin. `lib/markdown/resolve-twin.ts` maps a path to a document, `lib/markdown/twins/` holds one builder per surface, and `lib/markdown/twin-headers.ts` holds the shared response headers.
- `proxy.ts`, `lib/markdown/accept-negotiation.ts`: `Accept` negotiation. A Markdown-preferring request is rewritten to the twin route for paths the resolver can answer; `/api`, `/.well-known`, `/admin`, `_next` and `.md` paths are skipped.
- `app/.well-known/`, `public/.well-known/`, `public/agents.md`: the discovery documents. The API catalog and the permissions file are route handlers over `lib/discovery/surfaces.ts`. The agent-skills index is written at prebuild by `scripts/generate-agent-skills.mjs`, which hashes the two hand-written `SKILL.md` documents beside it.
- `app/api/mcp/`, `lib/mcp/`: the read-only MCP endpoint and its server, rate limit and tools.
- `app/blog/`, `app/admin/`, `app/api/{auth,revalidate,search-posts,last-posts,trending-posts}/`: the optional blog module. Dormant unless `FEATURE_BLOG=1`.
- `lib/features.ts`: the `FEATURE_BLOG` flag and its `NEXT_PUBLIC` mirror.
- `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx`: the 404 page and the two error boundaries. `error.tsx` replaces a page inside the root layout; `global-error.tsx` replaces the layout itself and therefore imports `globals.css` and renders its own `<html>`.
- `app/components/error-boundary.tsx`: component-level boundary, used only to isolate the analytics subtree.
- `app/components/consent.tsx`, `app/components/analytics.tsx`: the consent gate and the trackers it controls. Analytics mounts only after "Allow analytics".
- `instrumentation.ts`, `instrumentation-client.ts`: Sentry init for the server, edge and browser, plus the `onRequestError` hook.
- `lib/logger.ts`: `logError`, the single place errors are logged and reported.
- `scripts/strip-image-metadata.mjs`: rewrites raster files under `public/assets` to drop EXIF/IPTC/XMP. Manual only, never part of `build`.
- `lib/db/`, `lib/auth*`, `lib/blog/`, `drizzle/`: Neon/Drizzle schema, Better Auth, post queries and mutations, and SQL migrations. All blog-only.
- `lib/site.ts`: shared constants (`SITE_URL`, `REPO_URL`, `RELEASES_URL`, `PLATFORMS`, `CAPABILITIES`, `CAPTURES`, `FILM`, `MASHED`, `DOWNLOAD_URL`).
- `lib/source.ts`: the only docs accessor. `source` reads one page; `docsInventory()` returns the ordered list the twin route, the API catalog and the MCP tools render from. `source.config.ts` enables processed Markdown and Git-derived `lastModified`.
- `lib/llms/`: `build-llms-full.ts` assembles the corpus from the same processed Markdown the pages render; `marketing.ts` reads the authored narrative.
- `lib/discovery/surfaces.ts`: the one list of published surfaces, which the API catalog and the permissions file both render.
- `.env.example`: every environment variable the site reads, all optional.
- `lib/app-release.ts`: `getLatestAppRelease()` fetches `LuisAlejandro/mash` latest release with `next: { revalidate: 3600 }`. Returns `null` on failure.
- `lib/structured-data.ts`: the homepage graph (`buildSiteGraph`), FAQ list (`buildFaq`) and FAQ schema (`buildFaqSchema`), plus the page-level nodes: `buildWebPageSchema` for a docs page, `buildBlogSchema` and `buildBlogPostSchema` for the blog. `toJsonLdScript()` is the only serializer.
- `lib/metadata.ts`: the social preview image object, site name, locale and twitter card, declared once for every page.
- `next.config.ts`: `headers()` (the discovery `Link` and every `Netlify-Cache-Tag`) and the `.md` rewrite.
- `lib/netlify/purge-by-tags.ts`, `lib/blog/revalidate-cache.ts`: the purge contract and the post-change invalidation.
- `content/llms/`: the authored homepage narrative with `{{SITE_URL}}`, `{{DERIVED_AVAILABILITY}}` and `{{DERIVED_CAPTURES}}` placeholders, filled by `/index.md` from `lib/site.ts` and `lib/structured-data.ts`.
- `public/`: static assets only (`assets/mash/`, `fonts/`, `github-icon.svg`, `agents.md`). The old `public/llms.txt` and `public/ai.txt` are now route handlers in `app/`.
- `scripts/`: release tooling from maintainer-tools (`release.sh`, `lib.sh`, `rollback.sh`), `build-brand-assets.py` (macOS `sips`), `generate-agent-skills.mjs` (prebuild). Do not hand-edit `lib.sh`; it is managed upstream.
- `docs/media-capture.md`: the capture contract for hero film and stills.

## Rules that have bitten this repo

- **Never hardcode the app version or release date.** The version comes from GitHub at build time (`lib/app-release.ts`). Copy must still read correctly when the lookup returns `null`: say the latest release is on the releases page, and claim no version.
- **Every download CTA must resolve.** Platform downloads link to the file when the release has it, and otherwise to `RELEASES_URL`. Never render a disabled "Coming soon" control.
- **Canonical app repo is `LuisAlejandro/mash`.** `REPO_URL` and `RELEASES_URL` point there, not at this repo.
- **Structured data must not claim a download that 404s.** `DOWNLOAD_URL` stays empty until a stable per-file URL exists; `offers.url` uses `RELEASES_URL` instead.
- **Do not describe unshipped capabilities.** Platforms are macOS 14+ on Apple silicon and Ubuntu 24.04 (amd64, arm64). No Intel Mac, no Windows.
- **Route handlers are `force-static` plus `fetch` with `revalidate`.** A new text endpoint that needs live data should follow `app/llms.txt/route.ts`, not a file in `public/`.
- **`netlify.toml` headers reach static files only.** Verified live on this host: a `[[headers]]` rule never reaches a function-served response, so a header a page or route handler must carry belongs in `next.config.ts` `headers()` or in the handler itself. `netlify.toml` stays correct for `public/` assets and is wrong for anything Next renders.
- **Negotiated Markdown is never cached.** `proxy.ts` rewrites a Markdown-preferring request to the twin route, which serves `Cache-Control: private, no-store` on purpose: no cache may hand Markdown to a browser. Do not trade that for a public TTL.
- **One docs accessor.** `lib/source.ts` is the only thing that reads `content/docs`; `docsInventory()` is the ordered list the twin route, the API catalog and the MCP tools render from. A second walk of the content tree is how the surfaces drift apart.
- **Keep the `/llms.txt`, `/ai.txt` and `/index.md` paths.** `netlify.toml` and the discovery documents name them, so a rename has to update both.
- **Consent gates analytics; analytics never loads beside it.** `consent.tsx` owns the stored choice and renders `analytics.tsx` only after an explicit accept. No GA or Meta Pixel mount may be placed outside that gate, and with both measurement IDs unset the banner is not shown at all.
- **`withSentryConfig` is imported from `@sentry/nextjs/config`, not `@sentry/nextjs`.** The root export resolves to the server bundle, which does not export it; importing it from there fails `next typegen` and the build with `withSentryConfig is not a function`.
- **`error.tsx` and `global-error.tsx` take `retry`, not `reset`.** Next 16 renamed the prop, so the older template shape renders a button that does nothing.

## Conventions

- Commit subjects use the gitchangelog tags: `[ADD]`, `[FIX]`, `[REF]`, `[DEL]`. Append `!cosmetic` for non-user-facing work. Commits are GPG-signed (`user.signingkey` is set).
- Formatting is Prettier with `printWidth: 80`, `semi`, double quotes, `trailingComma: es5`. Run `make format` before pushing; the release preflight fails if it changes files.
- Lint is `eslint` with `eslint-config-next` (core-web-vitals and TypeScript). Ignores: `.next/`, `build/`, `next-env.d.ts`.
- Path alias `@/*` maps to the repo root.
- Do not add a dependency for something the standard library or the platform already provides. The marketing site and docs run on `next`, `react`, `react-dom`, and `fumadocs-*`; everything else at runtime (`@neondatabase/serverless`, `better-auth`, `drizzle-orm`, `feed`, the `unified`/`remark`/`rehype` chain, `ws`) exists only to serve the optional blog and must stay behind `FEATURE_BLOG`.
- **The one knowing dependency exception is `@modelcontextprotocol/sdk`.** It exists solely for the read-only `/api/mcp` endpoint in `lib/mcp/`. That endpoint must not grow a write path, an admin surface or a second transport, and no further dependency may join it without the same justification.
- **Two further knowing exceptions, both dormant when unconfigured.** `@sentry/nextjs` is error reporting, and `@next/third-parties` plus a hand-written Meta Pixel snippet are the consent-gated analytics. No DSN means the Sentry SDK is never imported; no measurement ID means no banner and no third-party script. Neither may become load-bearing for the page to render.

## Workflow

- Work on `develop`. PRs target `develop`; `develop` is the GitHub default branch.
- `master` is production. Only the release scripts (`make release-patch|minor|major`) move `master`; they run preflight, wait for CI on the release branch, tag, and publish a GitHub release.
- Do not run a release unless the user asks for one.
- Release CI (`push.yml`) runs `make build`, `make lint`, and `make test` on `release/**` and `master`.

### Merging into `develop`

`develop` is guarded by the active ruleset **"Rosey: develop"**, which requires one approving review and the checks `Filter`, `Build`, and `Code Quality`.

- **Name every PR branch `feature/<slug>` or `bugfix/<slug>`.** The Cursor Approval Agent only approves `feature/**` and `dependabot/**` heads; any other prefix (for example `test/...` or `chore/...`) fails provenance, gets a "Not approved" review comment, and the PR stalls even with every check green.
- Branch prefixes map to intent: `feature/` for work, `bugfix/` for fixes, `release/` for the release scripts. Do not invent other prefixes.
- Auto-merge (`gh pr merge --auto`) then completes on its own once Cursor approves and the required checks pass. A human cannot approve their own PR, so a mis-named branch has no way forward except an admin bypass or a rename.
- The ruleset also sets `require_extra_approval_for_unattributed_changes`, so keep commit identities matched to the GitHub account.

## Editing guidance for agents

- Read the relevant file before editing. `app/components/release.tsx`, `lib/structured-data.ts` and `content/llms/` hold most of the copy a visitor or an agent reads.
- When you change a user-visible claim (platforms, capabilities, pricing, licence), the fact belongs in `lib/site.ts` or `lib/structured-data.ts` and everything that repeats it has to follow: the authored narrative in `content/llms/`, `app/index.md/route.ts`, `app/llms.txt/route.ts`, `app/llms-full.txt` and the docs in `content/docs/` that it and the twins are built from, `app/ai.txt/route.ts`, `public/agents.md`, `app/components/install-blocks.tsx`, and `README.md`.
- The brand and media assets in `public/assets/mash/` are generated from the app repo. Re-running `scripts/build-brand-assets.py` needs `sips` (macOS) and `ffmpeg`.
- Before committing, run `make lint`, `make test`, and `make build`. Without Docker, `npx eslint`, `npx next typegen && npx tsc --noEmit`, and `npx next build` are equivalent.

## The blog module

The blog is off by default and the site is expected to keep building, deploying, and passing `make test` with no environment at all. Treat that as the invariant.

- **Both flags or neither.** `FEATURE_BLOG` gates routes, APIs, and server module loading; `NEXT_PUBLIC_FEATURE_BLOG` is inlined into the client bundle and drives navigation. Setting one without the other produces a site that links to pages that 404, so `next.config.ts` refuses to build: it throws when the two disagree, and when either carries a value other than `0` or `1`.
- **Guard every data-fetching page, not just the layout.** A layout's `notFound()` does not stop a page component from running during prerender, so a page that queries the database and only relies on the layout guard fails the blog-off build. Each such page checks `FEATURE_BLOG` before its first query.
- **`lib/db/index.ts` and `lib/auth.ts` compare `process.env.FEATURE_BLOG` directly** so the condition stays a build-time literal and the unused branch can be dropped. Importing `lib/features` there would OR in the public mirror and break that.
- **Drafts are excluded in the query, never in the view** (`lib/blog/queries.ts`). A new page cannot leak one by forgetting to filter.
- **Admin authorization is re-checked inside every server action.** A server action is a public endpoint; the page that rendered the form proves nothing.
- **The allowlist is fail-closed.** An empty `ADMIN_EMAIL_ALLOWLIST` denies everyone, including the first person to sign in.
- **Publishing fails loudly when the CDN purge is not configured.** `revalidateAfterPostChange` throws rather than report a publish that leaves stale pages served.
- **Cache tag names appear twice**: `lib/netlify/purge-by-tags.ts` and the `Netlify-Cache-Tag` headers in `next.config.ts` `headers()`. Changing one side silently stops purging.
- Schema changes go through `npm run db:generate`, which writes a new file under `drizzle/`; commit it. `npm run db:migrate` applies it locally. On Netlify the build applies pending migrations automatically (`scripts/migrate-deploy.mjs`, serialized by an advisory lock), so never apply a migration by hand there. Both paths need `DATABASE_URL_UNPOOLED`.
- `scripts/check-blog.mjs` (`make test`) covers the allowlist and excerpt logic directly, with no framework and no database. Extend it when you touch those pure functions.

## Known issues

- Fresh's TypeScript language server fails when the global Homebrew `typescript` is 7.x (no `lib/tsserver.js`). The repo pins 5.9.x in `node_modules`; use that for editor tooling.
- `CLAUDE.md` used to contain `@AGENTS.md`; it is no longer tracked.
