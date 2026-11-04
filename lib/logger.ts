/**
 * Error logging for server and client code paths.
 *
 * Always writes to the console in one shape. When a Sentry DSN is configured it
 * also reports the error, but only then: the SDK is imported dynamically, so a
 * deployment without Sentry ships none of it in the initial bundle.
 *
 * `process.env.SENTRY_DSN` is a server variable and becomes `undefined` in a
 * client build, which is why the public mirror is checked as well.
 */

type ErrorContext = Record<string, unknown>;

const DSN_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN
);

function report(
  context: string,
  error: unknown,
  metadata?: ErrorContext
): void {
  if (!DSN_CONFIGURED) return;

  void import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.captureException(error, {
        tags: { context },
        extra: metadata,
      });
    })
    .catch(() => {
      // Reporting must never throw into the code path that failed.
    });
}

export function logError(
  context: string,
  error: unknown,
  metadata?: ErrorContext
): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(
    `[${context}] ${message}`,
    JSON.stringify({ stack, ...metadata })
  );

  report(context, error, metadata);
}
