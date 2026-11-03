import { NextRequest, NextResponse } from "next/server";

import { revalidateBlogCache } from "@/lib/blog/revalidate-cache";
import { FEATURE_BLOG } from "@/lib/features";
import { logError } from "@/lib/logger";

/**
 * Invalidate blog caches from outside the admin UI.
 *
 * The shared secret travels in an Authorization header or the JSON body, never
 * a query string, because query strings end up in access logs and referrers.
 */
export const dynamic = "force-dynamic";

const MAX_REVALIDATE_ITEMS = 50;

interface RevalidateRequestBody {
  secret?: string;
  posts?: Array<{ slug: string }>;
  categories?: Array<{ slug: string }>;
}

function extractSecret(
  request: NextRequest,
  body: RevalidateRequestBody
): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  if (typeof body.secret === "string" && body.secret.length > 0) {
    return body.secret;
  }
  return null;
}

export async function POST(request: NextRequest) {
  if (!FEATURE_BLOG) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body: RevalidateRequestBody = await request.json();
    const secret = extractSecret(request, body);
    const expected = process.env.REVALIDATE_SECRET;

    // An unset secret denies every caller rather than admitting all of them.
    if (!expected || !secret || secret !== expected) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    const result = await revalidateBlogCache({
      posts: body.posts?.slice(0, MAX_REVALIDATE_ITEMS),
      categories: body.categories?.slice(0, MAX_REVALIDATE_ITEMS),
    });

    // Next's cache was cleared either way; a failed CDN purge still leaves
    // stale pages served, so report that as 502 rather than success.
    const status = result.purgeOk ? 200 : 502;

    return NextResponse.json(
      {
        message: result.purgeOk
          ? "Revalidation completed"
          : "Revalidation completed but CDN purge failed",
        revalidatedPaths: result.revalidatedPaths,
        purgedTags: result.purgedTags,
        purgeOk: result.purgeOk,
        purgeError: result.purgeError,
        cfPurgeOk: result.cfPurgeOk,
        cfPurgeError: result.cfPurgeError,
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  } catch (error) {
    logError("revalidate-api", error);
    return NextResponse.json(
      { message: "Error during revalidation" },
      { status: 500 }
    );
  }
}
