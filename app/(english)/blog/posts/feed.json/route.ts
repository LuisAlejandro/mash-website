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
    return new Response(feed.json1(), {
      headers: {
        "Content-Type": "application/feed+json; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    logError("json-feed", error);
    return new Response("Error generating json-feed", { status: 500 });
  }
}
