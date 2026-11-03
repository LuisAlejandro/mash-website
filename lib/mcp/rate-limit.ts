const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;
const MAX_TRACKED_IPS = 10_000;

// Per-instance, not global; shared storage is needed across server instances.
const requests = new Map<string, number[]>();

export function checkMcpRateLimit(ip: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const recent = (requests.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );

  if (recent.length === 0) requests.delete(ip);

  if (recent.length >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((recent[0] + WINDOW_MS - now) / 1000),
      ),
    };
  }

  if (recent.length === 0 && requests.size >= MAX_TRACKED_IPS) {
    requests.clear();
  }

  recent.push(now);
  requests.set(ip, recent);
  return { allowed: true, retryAfterSeconds: 0 };
}
