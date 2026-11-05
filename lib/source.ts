import { docs } from "@/.source/server";
import { loader } from "fumadocs-core/source";
import { docsI18n } from "@/lib/i18n/docs";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";

/**
 * Every page under `/docs`, in sidebar order, read from `content/docs`.
 *
 * The loader is locale-aware: English pages keep their unprefixed URLs, every
 * other language is served below its own prefix (`/es/docs`). It stays the one
 * walk of the content tree — page rendering, navigation, search, the sitemap,
 * the Markdown twins and MCP all read it.
 */
export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  i18n: docsI18n,
});

/**
 * What a discovery surface needs to know about one docs page.
 *
 * `slugs` is the path below `/docs`, which is also the segment list the
 * Markdown twin route resolves against.
 */
type DocsEntry = {
  url: string;
  title: string;
  description: string;
  slugs: string[];
};

/** The pages published in one language, in `meta.json` sidebar order. */
export function docsInventory(locale: Locale = DEFAULT_LOCALE): DocsEntry[] {
  return source.getPages(locale).map((page) => ({
    url: page.url,
    title: page.data.title,
    description: page.data.description ?? "",
    slugs: page.slugs,
  }));
}

/** `generateStaticParams` for one locale's docs route tree. */
export function docsParams(locale: Locale): { slug: string[] }[] {
  return source.getPages(locale).map((page) => ({ slug: page.slugs }));
}

/** The `[[...slug]]` params, resolved inside one language only. */
export function getDocsPage(slugs: string[] | undefined, locale: Locale) {
  return source.getPage(slugs, locale);
}
