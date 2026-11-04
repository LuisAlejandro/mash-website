import { getTrendingPublishedPosts } from "@/lib/blog";

import { blogListResponse } from "../blog-list";

/**
 * Most recently updated posts. There are no engagement metrics to rank by, so
 * this is "recently touched", not "most read".
 */
export const dynamic = "force-dynamic";

export async function GET() {
  return blogListResponse("trending-posts-api", getTrendingPublishedPosts);
}
