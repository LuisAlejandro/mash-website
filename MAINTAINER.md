# Maintainer Guide

Quick reminders for Mash. Procedures live in `.cursor/skills/`; fleet
setup lives in **maintainer-tools**.

## Feature work

1. `mash-brainstorm` → `mash-plan` → `mash-work` — brainstorm → plan → implement.
2. `mash-qa` → `mash-lint` → `mash-pr` — QA, lint/build, open or update a PR to `develop`.

Repeat until ready to ship.

## Release

From **clean** `develop`:

| Step | Command / skill |
|------|-----------------|
| Interactive | `mash-release` (default **patch**; `minor` / `major` when needed) |
| Manual | `make release-preflight` then `make release-patch` (or `-minor` / `-major`) |
| Rollback | `VERSION=<version> make undo-release` |

Preflight: `make format`, `make lint`, `make test`.
Gate details, milestones, and workflow verification: `.cursor/skills/mash-release/`.
Post-bump hooks: `.bumpversion.cfg` → `[maintainer-tools]`.

## PR CI (pointers)

- **Pull Request** — `.github/workflows/pr.yml` on PRs to `develop`.
- **Cursor CI fixes** — **maintainer-tools** `docs/cursor-pr-ci-automation.md`. `mash-qa`, `mash-lint`, and `mash-pr` do not merge or fix CI.

## Before `make release-*`

- Tools: `git`, git-flow, Docker (running), `make`, `gh`, bumpversion, GPG (`user.signingkey`).
- Clean working tree (release stops if format mutates files).

## One-time GitHub setup

- `develop` — PR + checks from `pr.yml`; `maintainer-tools protect-github --apply`.
- `master` — restrict pushes.
- `release/*` — `push.yml` lists `release/**` and ends with **Release Gate** (manual patch).
- Tags — restrict creation to maintainers.
