/**
 * One POST to a CDN purge API, mapped to the shape the publish path reports.
 *
 * Netlify and Cloudflare differ only in URL, credentials, body, and one extra
 * check: Cloudflare answers `200` with `success: false` for a request it
 * rejected. Everything else — the timeout, the 429 mapping, the error result —
 * is identical, so it lives here once.
 */
export type PurgeResult = {
  ok: boolean;
  reason?: "missing_env" | "rate_limited" | "upstream_error";
  status?: number;
};

export async function postPurge(
  url: string,
  request: { token: string; body: unknown }
): Promise<PurgeResult> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${request.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request.body),
      // A stalled purge would hang the publish action instead of failing it,
      // and a publish that reports success while the CDN serves the old page is
      // the failure this whole path exists to prevent.
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return { ok: false, reason: "upstream_error" };
  }

  if (response.status === 429) {
    return { ok: false, reason: "rate_limited", status: 429 };
  }

  if (!response.ok) {
    return { ok: false, reason: "upstream_error", status: response.status };
  }

  const payload = (await response.json().catch(() => null)) as {
    success?: unknown;
  } | null;
  if (payload?.success === false) {
    return { ok: false, reason: "upstream_error", status: response.status };
  }

  return { ok: true };
}
