import { NextResponse } from "next/server";

import { getLatestPublishedPosts } from "@/lib/blog";
import { FEATURE_BLOG } from "@/lib/features";
import { logError } from "@/lib/logger";

/** Most recently published posts, newest first. */
export const dynamic = "force-dynamic";

export async function GET() {
  if (!FEATURE_BLOG) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    return NextResponse.json({ response: await getLatestPublishedPosts() });
  } catch (error) {
    logError("last-posts-api", error);
    return NextResponse.json(
      { error: "Blog posts temporarily unavailable" },
      { status: 503 }
    );
  }
}
