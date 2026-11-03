import { TWIN_HEADERS } from "@/lib/markdown/twin-headers";
import { marketingMarkdown } from "@/lib/markdown/twins/marketing";

export const dynamic = "force-static";

/**
 * Markdown twin of the homepage, generated at build time.
 *
 * The document itself is assembled in lib/markdown/twins/marketing.ts, which
 * the `.md` twin route renders too: this route only decides the URL and the
 * media type, so there is exactly one homepage Markdown renderer.
 */
export async function GET() {
  return new Response(await marketingMarkdown(), { headers: TWIN_HEADERS });
}
