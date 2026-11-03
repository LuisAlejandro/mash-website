import type { MarkdownTwin } from "@/lib/markdown/types";
import { source } from "@/lib/source";

/**
 * One docs page as a standalone Markdown document.
 *
 * The body is the processed Markdown the page is built from, not a second
 * hand-written copy, so a twin cannot describe a page that no longer says that.
 * An unknown slug, or a page the postprocess step has no text for, is not a
 * document and resolves to `null`.
 */
export async function docsTwin(slugs: string[]): Promise<MarkdownTwin | null> {
  const page = source.getPage(slugs);
  if (!page) return null;

  const markdown = await page.data.getText("processed");
  if (!markdown) return null;

  return {
    title: page.data.title,
    url: page.url,
    markdown: `# ${page.data.title}\n\n${markdown.trim()}\n`,
  };
}
