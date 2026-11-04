import { NextResponse } from "next/server";

import { FEATURE_BLOG } from "@/lib/features";
import { logError } from "@/lib/logger";

/**
 * The two blog list endpoints differ only in the query they run, so the flag
 * gate, the envelope, and the failure shape live here once.
 */
export async function blogListResponse(
  context: string,
  read: () => Promise<unknown>
): Promise<Response> {
  if (!FEATURE_BLOG) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    return NextResponse.json({ response: await read() });
  } catch (error) {
    logError(context, error);
    return NextResponse.json(
      { error: "Blog posts temporarily unavailable" },
      { status: 503 }
    );
  }
}
