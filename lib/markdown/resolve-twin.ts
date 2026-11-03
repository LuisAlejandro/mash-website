import { blogTwin } from "@/lib/markdown/twins/blog";
import { docsTwin } from "@/lib/markdown/twins/docs";
import { marketingMarkdown } from "@/lib/markdown/twins/marketing";

/** One page as a Markdown document: what a `.md` URL serves. */
export type MarkdownTwin = {
  title: string;
  /** Canonical URL of the HTML page this document mirrors. */
  url: string;
  markdown: string;
};

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
  if (!segments.every(isSafeSegment)) return null;

  const [surface, ...rest] = segments;

  // No segments is the homepage, whose twin is assembled for `/index.md` too.
  if (!surface) {
    return { title: "Mash", url: "/", markdown: await marketingMarkdown() };
  }

  if (surface === "docs") return docsTwin(rest);
  if (surface === "blog") return blogTwin(rest);
  return null;
}

/**
 * A segment arrives already split and decoded, so it can only be unsafe if it
 * carries its own separators or a parent reference.
 */
function isSafeSegment(segment: string): boolean {
  return (
    segment.length > 0 &&
    segment !== "." &&
    segment !== ".." &&
    !segment.includes("/") &&
    !segment.includes("\\") &&
    !segment.includes("\0")
  );
}
