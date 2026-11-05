import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const dynamic = "force-static";

/**
 * The agent discovery guide in Spanish.
 *
 * The English original is a static file under `public/`; this route serves its
 * translation at the Spanish URL so a Spanish agent surface never points at an
 * English document. The text lives in `content/llms/agents.es.md` so it is
 * edited like the rest of the corpus.
 */
export async function GET() {
  const body = readFileSync(
    resolve(process.cwd(), "content/llms/agents.es.md"),
    "utf8"
  );

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
