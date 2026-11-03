import { notFound } from "next/navigation";

import { buildBlogFeed } from "@/lib/blog/feed";
import { FEATURE_BLOG } from "@/lib/features";
import { logError } from "@/lib/logger";

export async function GET() {
  if (!FEATURE_BLOG) {
    notFound();
  }

  try {
    const feed = await buildBlogFeed();
    return new Response(feed.atom1(), {
      headers: {
        "Content-Type": "application/atom+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    logError("atom-feed", error);
    return new Response("Error generating atom-feed", { status: 500 });
  }
}
