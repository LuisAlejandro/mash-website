/**
 * Cache tags attached to blog responses by the `headers()` rules in
 * next.config.ts. Purging these is what makes a publish visible before the
 * CDN's own TTL expires.
 */
export const BLOG_PURGE_TAGS = [
  "blog-posts",
  "blog-index",
  "blog-listings",
  "sitemap",
  "llms-full",
] as const;

export type PurgeByTagsResult = {
  ok: boolean;
  reason?: "missing_env" | "rate_limited" | "upstream_error";
  status?: number;
};

export async function purgeByTags(
  tags: readonly string[]
): Promise<PurgeByTagsResult> {
  const token = process.env.NETLIFY_PURGE_TOKEN;
  const siteId = process.env.NETLIFY_SITE_ID;

  if (!token || !siteId) {
    return { ok: false, reason: "missing_env" };
  }

  try {
    const response = await fetch("https://api.netlify.com/api/v1/purge", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ site_id: siteId, cache_tags: [...tags] }),
      // A stalled purge call would hang the publish action instead of failing
      // it, and a publish that reports success while the CDN serves the old
      // page is the failure this whole module exists to prevent.
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status === 429) {
      return { ok: false, reason: "rate_limited", status: 429 };
    }

    if (!response.ok) {
      return { ok: false, reason: "upstream_error", status: response.status };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "upstream_error" };
  }
}
