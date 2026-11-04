/**
 * Server and edge instrumentation. Next calls `register()` once per runtime at
 * startup, and `onRequestError` for every error thrown while rendering a
 * request.
 *
 * Sentry stays inert unless `SENTRY_DSN` is set, and in development, so a local
 * build reports nothing and the SDK is never loaded.
 */

const SENTRY_ENABLED =
  Boolean(process.env.SENTRY_DSN) && process.env.NODE_ENV === "production";

export async function register(): Promise<void> {
  if (!SENTRY_ENABLED) return;

  const runtime = process.env.NEXT_RUNTIME;
  if (runtime !== "nodejs" && runtime !== "edge") return;

  const Sentry = await import("@sentry/nextjs");

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    // A marketing site does not need every transaction; sampling keeps the
    // quota for actual errors.
    tracesSampleRate: 0.1,
    debug: false,
  });
}

export async function onRequestError(
  error: unknown,
  request: {
    path: string;
    method: string;
    headers: Record<string, string | string[] | undefined>;
  },
  context: { routerKind: string; routePath: string; routeType: string }
): Promise<void> {
  if (!SENTRY_ENABLED) return;

  const Sentry = await import("@sentry/nextjs");

  Sentry.captureRequestError(error, request, context);
}
