# Changelog


## 1.4.0 (2026-11-06)

### Added

* English and Spanish site localization. [Luis Alejandro Martínez Faneyth]


## 1.3.4 (2026-11-05)

### Fixed

* Stop blog post pages failing with a server error. [Luis Alejandro Martínez Faneyth]


## 1.3.3 (2026-11-05)

### Fixed

* Let Better Auth accept the trailing slash Next adds. [Luis Alejandro Martínez Faneyth]


## 1.3.2 (2026-11-04)

### Changed

* Say what the first launch does, and who bills the model. [Luis Alejandro Martínez Faneyth]

* Document setup, updates and keymaps as Mash 0.3.0 will ship them. [Luis Alejandro Martínez Faneyth]


## 1.3.1 (2026-11-04)

### Changed

* Serve the dev site on 3100 inside the container too. [Luis Alejandro Martínez Faneyth]


## 1.3.0 (2026-11-04)

### Added

* Apply migrations automatically on deploy. [Luis Alejandro Martínez Faneyth]

* Link the blog from the header nav. [Luis Alejandro Martínez Faneyth]

* Error pages, consent-gated analytics and Sentry reporting. [Luis Alejandro Martínez Faneyth]

* Publish the MCP server card with the release version. [Luis Alejandro Martínez Faneyth]

* Verify the discovery contract against a deployed site. [Luis Alejandro Martínez Faneyth]

* Serve a read-only MCP endpoint for docs and blog discovery. [Luis Alejandro Martínez Faneyth]

* Publish agent skills with a verified digest index. [Luis Alejandro Martínez Faneyth]

* Publish the machine-readable discovery catalog and policy. [Luis Alejandro Martínez Faneyth]

* Describe docs and blog pages as structured data. [Luis Alejandro Martínez Faneyth]

* Negotiate Markdown from the canonical URL via Accept. [Luis Alejandro Martínez Faneyth]

* Serve every docs page as Markdown at a .md URL. [Luis Alejandro Martínez Faneyth]

* Serve the full documentation as one Markdown corpus. [Luis Alejandro Martínez Faneyth]

* Author the homepage narrative as reviewed Markdown. [Luis Alejandro Martínez Faneyth]

* Derive one docs inventory for every discovery surface. [Luis Alejandro Martínez Faneyth]

* Add an optional blog with a GitHub-authenticated admin. [Luis Alejandro Martínez Faneyth]


### Changed

* Deduplicate the blog surfaces and cache rendered posts. [Luis Alejandro Martínez Faneyth]

* Break the twin type cycle with a types module. [Luis Alejandro Martínez Faneyth]


### Fixed

* Correctness and safety fixes across the blog and agent surfaces. [Luis Alejandro Martínez Faneyth]

* Restore netlify.toml, overwritten with package.json. [Luis Alejandro Martínez Faneyth]

* Refuse a build whose blog flags disagree. [Luis Alejandro Martínez Faneyth]

* Route JSON-LD through JsonLdScript for Semgrep CI. [Cursor Agent]

* Address the code review findings on discovery and MCP. [Luis Alejandro Martínez Faneyth]

* Apply the three safe review findings. [Luis Alejandro Martínez Faneyth]

* Deliver cache tags where the CDN can actually read them. [Luis Alejandro Martínez Faneyth]

* Stop publishing fabricated sitemap dates. [Luis Alejandro Martínez Faneyth]

* Restore the social preview image on docs and blog posts. [Luis Alejandro Martínez Faneyth]

* Sanitize blog post HTML for Semgrep and XSS. [Cursor Agent]


### Removed

* Remove the agent readiness smoke script. [Luis Alejandro Martínez Faneyth]


### Other

* Fix(ci): override eslint-plugin-react for ESLint 10 compatibility. [Cursor Agent]


## 1.2.0 (2026-11-03)

### Added

* Add branded Mash documentation. [Luis Alejandro Martínez Faneyth]

* Show who maintains Mash below the hero. [Luis Alejandro Martínez Faneyth]


## 1.1.2 (2026-10-30)

### Changed

* Read the app release once on the server, not per visitor. [Luis Alejandro Martínez Faneyth]


### Fixed

* Claim a download only when the release has a file. [Luis Alejandro Martínez Faneyth]


## 1.1.1 (2026-10-30)

### Added

* Name Starship among the mashed programs. [Luis Alejandro Martínez Faneyth]


### Changed

* Hold each hero word for two seconds. [Luis Alejandro Martínez Faneyth]


## 1.1.0 (2026-10-30)

### Added

* Describe orchestration and dictation for assistants. [Luis Alejandro Martínez Faneyth]

* Spotlight agent orchestration and voice dictation. [Luis Alejandro Martínez Faneyth]

* Neutral orchestration film and Pi Voice captures. [Luis Alejandro Martínez Faneyth]

* Document the branch-name rule that gates auto-merge. [Luis Alejandro Martínez Faneyth]


### Changed

* Document the repo for agents. [Luis Alejandro Martínez Faneyth]

* Drop the out/ static export; the build writes .next. [Luis Alejandro Martínez Faneyth]

* Read the latest release at build time instead of hardcoding it. [Luis Alejandro Martínez Faneyth]


### Fixed

* Describe the 0.1.1 release on every static surface. [Luis Alejandro Martínez Faneyth]


### Other

* Update. [Luis Alejandro Martínez Faneyth]


## 1.0.0 (2026-10-26)

### Added

* Release configuration for the first release. [Luis Alejandro Martínez Faneyth]

* Dependabot for npm and GitHub Actions. [Luis Alejandro Martínez Faneyth]

* Maintainer ops files and release targets. [Luis Alejandro Martínez Faneyth]

* PR, push, release, and cache-cleanup workflows. [Luis Alejandro Martínez Faneyth]

* Prettier formatting and type-check targets for release preflight. [Luis Alejandro Martínez Faneyth]

* Container-based local toolchain. [Luis Alejandro Martínez Faneyth]


### Changed

* Match the changelog heading pattern the fleet already ships. [Luis Alejandro Martínez Faneyth]

* Serve mash-website through the Netlify Next.js runtime. [Luis Alejandro Martínez Faneyth]

* Rework landing page hero, media, and brand assets. [Luis Alejandro Martínez Faneyth]


### Fixed

* Install dependencies before the release preflight. [Luis Alejandro Martínez Faneyth]

* Slice markdown changelog sections in release notes. [Luis Alejandro Martínez Faneyth]


### Other

* Feat: ship Linux alongside macOS, and animate the slogan. [Luis Alejandro Martínez Faneyth]

* Fix: reshoot the hero film from the full Mash window. [Luis Alejandro Martínez Faneyth]

* Feat: add markdown twin, AI crawler policy, and image/video sitemap. [Luis Alejandro Martínez Faneyth]

* Feat: add structured data, FAQ, and llms.txt for search and answer engines. [Luis Alejandro Martínez Faneyth]

* Feat: launch the Mash homepage. [Luis Alejandro Martínez Faneyth]

