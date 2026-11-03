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
 * The single enumeration every docs-consuming surface renders from.
 *
 * `/llms.txt`, `/llms-full.txt`, the sitemap and the Markdown twins all read
 * this list instead of keeping their own copy, so adding an `.mdx` file
 * appears everywhere at once or fails `make test` in `scripts/check-docs.mjs`.
 * The loader already returns pages in `meta.json` sidebar order.
 */
export function docsInventory(): DocsEntry[] {
  return source.getPages().map((page) => ({
    url: page.url,
    title: page.data.title,
    description: page.data.description ?? "",
    slugs: page.slugs,
  }));
}
