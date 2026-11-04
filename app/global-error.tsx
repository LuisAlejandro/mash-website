"use client";

import { useEffect } from "react";
import { logError } from "@/lib/logger";

/**
 * Root error boundary. It replaces `app/layout.tsx` when it is active, so it
 * has to supply the whole document — and, because the root layout's stylesheet
 * is not rendered either, it imports the global styles itself.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    logError("global-error", error, { digest: error.digest });
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body>
        <main className="status-page wrap">
          <p className="eyebrow">Something broke</p>
          <h1 className="status-title">
            Mash could not <em>render.</em>
          </h1>
          <p className="status-text">
            The error was reported. Reloading usually recovers; the docs and the
            releases page are unaffected.
          </p>
          {error.digest ? (
            <p className="status-ref">
              Reference: <code>{error.digest}</code>
            </p>
          ) : null}
          <div className="status-actions">
            <button type="button" className="btn-solid" onClick={() => retry()}>
              Try again
            </button>
            {/* A hard navigation on purpose: this boundary replaces the root
                layout, so the router may be the broken part. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a className="btn-quiet" href="/">
              Back to the homepage
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
