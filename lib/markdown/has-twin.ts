import { FEATURE_BLOG } from "../features.ts";
import { DEFAULT_LOCALE, LOCALES } from "../i18n/locale.ts";
import { isSafePathSegment } from "./path-safety.ts";

export const DOC_TWIN_PATHS = new Set([
  "",
  "agents",
  "agents/forking",
  "agents/orchestration",
  "agents/providers",
  "agents/sessions",
  "agents/skills-and-packages",
  "agents/voice",
  "editor",
  "editor/annotations",
  "editor/files-and-search",
  "editor/review",
  "editor/source-control",
  "first-launch",
  "installation",
  "reference/configuration",
  "reference/keybindings-linux",
  "reference/keybindings-macos",
  "reference/keybindings-native",
  "reference/troubleshooting",
  "tools/command-palette",
  "tools/extras",
  "tools/link-picker",
  "tools/notifications",
  "tools/plugins",
  "tools/terminal",
  "updates",
  "workspaces",
  "workspaces/layout-profiles",
  "workspaces/tabs-and-panes",
  "workspaces/worktrees",
]);

export function hasMarkdownTwin(segments: string[]): boolean {
  if (!segments.every(isSafePathSegment)) return false;

  // A last segment carrying an extension is a file, not a page: the blog feeds
  // (/blog/posts/feed.xml, atom.xml, feed.json) and every other dotted name
  // have no twin, so rewriting them would turn a working feed into a 404.
  if (segments[segments.length - 1]?.includes(".")) return false;

  // A non-default locale mirrors the same surfaces below its own prefix; the
  // blog stays English-only, so `/es/blog` has no twin.
  const [first, ...rest] = segments;
  const localized = LOCALES.some(
    (locale) => locale !== DEFAULT_LOCALE && locale === first
  );
  if (localized) {
    if (rest.length === 0) return true;
    if (rest[0] === "docs") return DOC_TWIN_PATHS.has(rest.slice(1).join("/"));
    return false;
  }

  const [surface, ...tail] = segments;
  if (!surface) return true;
  if (surface === "docs") return DOC_TWIN_PATHS.has(tail.join("/"));
  if (surface !== "blog" || !FEATURE_BLOG) return false;

  return tail.length === 2 && (tail[0] === "posts" || tail[0] === "category");
}
