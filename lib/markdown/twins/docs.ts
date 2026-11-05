import type { MarkdownTwin } from "@/lib/markdown/types";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";
import { source } from "@/lib/source";

/**
 * One docs page as a standalone Markdown document, in its own language.
 *
 * The body is the processed Markdown the page is built from, not a second
 * hand-written copy, so a twin cannot describe a page that no longer says that.
 * An unknown slug, or a page the postprocess step has no text for, is not a
 * document and resolves to `null`.
 */
export async function docsTwin(
  slugs: string[],
  locale: Locale = DEFAULT_LOCALE
): Promise<MarkdownTwin | null> {
  const page = source.getPage(slugs, locale);
  if (!page) return null;

  const markdown = await page.data.getText("processed");
  if (!markdown) return null;

  return {
    title: page.data.title,
    url: page.url,
    markdown: `# ${page.data.title}\n\n${markdown.trim()}\n`,
  };
}
