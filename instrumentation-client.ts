/**
 * Client instrumentation. Next runs this before the app becomes interactive.
 *
 * Sentry is initialised only when the public DSN is configured and the build is
 * a production one, so development stays quiet. Session Replay is deliberately
 * absent: this page autoplays a film and the goal here is error tracking.
 */

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENABLED = Boolean(DSN) && process.env.NODE_ENV === "production";

if (ENABLED) {
  void import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.init({
        dsn: DSN,
        environment:
          process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
        tracesSampleRate: 0.1,
        debug: false,
      });
    })
    .catch(() => {
      // A monitoring failure must never stop the page from loading.
    });
}
