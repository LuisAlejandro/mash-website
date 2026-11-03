import { NextRequest, NextResponse } from "next/server";

import { searchPublishedPosts } from "@/lib/blog";
import { FEATURE_BLOG } from "@/lib/features";
import { logError } from "@/lib/logger";
import { MAX_SEARCH_QUERY_LENGTH } from "@/lib/search-query";

/**
 * Search published posts. Dynamic by necessity: this one reads a query string,
 * unlike /api/search, which serves the docs index as a static file.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!FEATURE_BLOG) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const query = request.nextUrl.searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ response: [] });
    }

    const trimmed = query.trim();
    if (trimmed.length > MAX_SEARCH_QUERY_LENGTH) {
      return NextResponse.json({ error: "Query too long" }, { status: 400 });
    }

    return NextResponse.json({ response: await searchPublishedPosts(trimmed) });
  } catch (error) {
    logError("search-posts-api", error);
    return NextResponse.json(
      { error: "Blog search temporarily unavailable" },
      { status: 503 }
    );
  }
}
