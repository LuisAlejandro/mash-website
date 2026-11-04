import { buildLlmsFull } from "@/lib/llms/build-llms-full";
import { TWIN_HEADERS } from "@/lib/markdown/twin-headers";

export const dynamic = "force-static";

export async function GET() {
  const body = await buildLlmsFull();
  return new Response(body, { headers: TWIN_HEADERS });
}
