import { type PurgeResult, postPurge } from "@/lib/purge/post";

/**
 * Optional second purge target, for deployments that front Netlify with
 * Cloudflare. Unconfigured is not an error: the caller treats missing_env as
 * "not in use" and only Netlify's result is allowed to block a publish.
 */
export async function purgeByTags(
  tags: readonly string[]
): Promise<PurgeResult> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;

  if (!token || !zoneId) {
    return { ok: false, reason: "missing_env" };
  }

  return postPurge(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
    { token, body: { tags: [...tags] } }
  );
}
