import { TWIN_HEADERS } from "@/lib/markdown/twin-headers";
import { marketingMarkdown } from "@/lib/markdown/twins/marketing";

export const dynamic = "force-static";

/**
 * Markdown twin of the Spanish homepage, generated at build time.
 *
 * Like `/index.md`, this route only decides the URL and the media type: the
 * document is assembled once in `lib/markdown/twins/marketing.ts`, which the
 * `.md` twin route renders too.
 */
export async function GET() {
  return new Response(await marketingMarkdown("es"), {
    headers: TWIN_HEADERS,
  });
}
