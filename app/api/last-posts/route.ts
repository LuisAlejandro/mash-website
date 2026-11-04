import { getLatestPublishedPosts } from "@/lib/blog";

import { blogListResponse } from "../blog-list";

/** Most recently published posts, newest first. */
export const dynamic = "force-dynamic";

export async function GET() {
  return blogListResponse("last-posts-api", getLatestPublishedPosts);
}
