import { NextRequest, NextResponse } from "next/server";

import { searchPublishedPosts } from "@/lib/blog";
import { clientIp } from "@/lib/client-ip";
import { FEATURE_BLOG } from "@/lib/features";
import { logError } from "@/lib/logger";
import { checkRateLimit } from "@/lib/mcp/rate-limit";
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

  // The query scans every post body, and the MCP tool that reaches the same
  // function is limited, so this path has to be limited too.
  const limit = checkRateLimit(clientIp(request));
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
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
