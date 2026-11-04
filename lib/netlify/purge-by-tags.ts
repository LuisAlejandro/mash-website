import { type PurgeResult, postPurge } from "@/lib/purge/post";

/**
 * Purging these tags is what makes a publish visible before the CDN's own TTL
 * expires. The names live in lib/netlify/cache-tags.ts because next.config.ts
 * declares the same tags on the responses.
 */
export { BLOG_PURGE_TAGS } from "@/lib/netlify/cache-tags";

export async function purgeByTags(
  tags: readonly string[]
): Promise<PurgeResult> {
  const token = process.env.NETLIFY_PURGE_TOKEN;
  const siteId = process.env.NETLIFY_SITE_ID;

  if (!token || !siteId) {
    return { ok: false, reason: "missing_env" };
  }

  return postPurge("https://api.netlify.com/api/v1/purge", {
    token,
    body: { site_id: siteId, cache_tags: [...tags] },
  });
}
