import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { logError } from "@/lib/logger";

/**
 * Render a post body to HTML.
 *
 * Raw HTML in a post is dropped, and the tree is sanitized with
 * rehype-sanitize's GitHub schema (no scripts, no `javascript:` URLs) before it
 * is stringified. This runs in the unified chain with no DOM, on purpose:
 * DOMPurify needs jsdom on the server, and jsdom fails to load in the Netlify
 * function (`ERR_REQUIRE_ESM`), which took down every post page.
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  if (!markdown) {
    return "";
  }

  try {
    const result = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .process(markdown);
    return result.toString();
  } catch (error) {
    logError("markdown-to-html", error, { length: markdown.length });
    return "";
  }
}
