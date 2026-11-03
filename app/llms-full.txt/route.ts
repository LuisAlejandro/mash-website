import { buildLlmsFull } from "@/lib/llms/build-llms-full";

export const dynamic = "force-static";

export async function GET() {
  const body = await buildLlmsFull();
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
