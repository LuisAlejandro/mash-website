import type { MarkdownTwin } from "@/lib/markdown/types";
import { isSafePathSegment } from "@/lib/markdown/path-safety";
import { blogTwin } from "@/lib/markdown/twins/blog";
import { docsTwin } from "@/lib/markdown/twins/docs";
import { marketingMarkdown } from "@/lib/markdown/twins/marketing";

/**
 * Resolve one path, below the twin route, to the Markdown document it mirrors.
 *
 * Segments are validated before any lookup: a traversal component could
 * otherwise address a document this site does not publish, so it is rejected
 * rather than normalised. Everything unmapped resolves to `null`, which the
 * route serves as not-found.
 */
export async function resolveMarkdownTwin(
  segments: string[]
): Promise<MarkdownTwin | null> {
  if (!segments.every(isSafePathSegment)) return null;

  const [surface, ...rest] = segments;

  // No segments is the homepage, whose twin is assembled for `/index.md` too.
  if (!surface) {
    return { title: "Mash", url: "/", markdown: await marketingMarkdown() };
  }

  if (surface === "docs") return docsTwin(rest);
  if (surface === "blog") return blogTwin(rest);
  return null;
}
