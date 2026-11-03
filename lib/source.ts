import { docs } from "@/.source/server";
import { loader } from "fumadocs-core/source";

/** Every page under `/docs`, in sidebar order, read from `content/docs`. */
export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});

/**
 * What a discovery surface needs to know about one docs page.
 *
 * `slugs` is the path below `/docs`, which is also the segment list the
 * Markdown twin route resolves against.
 */
export type DocsEntry = {
  url: string;
  title: string;
  description: string;
  slugs: string[];
};

/**
 * Shared enumeration for discovery surfaces, MCP tools, and Markdown twin
 * static params. `/llms.txt` keeps a curated list rather than rendering this
 * inventory. The loader returns pages in `meta.json` sidebar order.
 */
export function docsInventory(): DocsEntry[] {
  return source.getPages().map((page) => ({
    url: page.url,
    title: page.data.title,
    description: page.data.description ?? "",
    slugs: page.slugs,
  }));
}
