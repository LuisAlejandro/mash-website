import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { logError } from "@/lib/logger";

/**
 * Render a post body to HTML.
 *
 * Raw HTML in a post is passed through, so the trust boundary is the admin
 * allowlist: only an allowlisted account can create a body, and anyone who can
 * publish could already publish anything. Loosen that allowlist and this needs
 * a sanitizer before it renders anyone else's markup.
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  if (!markdown) {
    return "";
  }

  try {
    const result = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeStringify, { allowDangerousHtml: true })
      .process(markdown);
    return result.toString();
  } catch (error) {
    logError("markdown-to-html", error, { length: markdown.length });
    return "";
  }
}
