/**
 * Best-effort client identity for the per-instance rate limiters.
 *
 * Netlify sets `x-nf-client-connection-ip` at the edge. The forwarded headers
 * are only a fallback, and a caller can choose its own value there, so a limit
 * keyed on this is a courtesy throttle rather than an access control.
 */
export function clientIp(request: Request): string {
  return (
    request.headers.get("x-nf-client-connection-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}
