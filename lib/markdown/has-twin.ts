import { FEATURE_BLOG } from "../features.ts";
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

  const [surface, ...rest] = segments;
  if (!surface) return true;
  if (surface === "docs") return DOC_TWIN_PATHS.has(rest.join("/"));
  if (surface !== "blog" || !FEATURE_BLOG) return false;

  return (
    rest.length === 2 &&
    (rest[0] === "posts" || rest[0] === "category")
  );
}
