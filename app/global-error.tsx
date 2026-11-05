"use client";

import { useEffect } from "react";
import { LOCALES } from "@/lib/i18n/locale";
import { UI } from "@/lib/i18n/ui";
import { logError } from "@/lib/logger";

/**
 * Root error boundary. It replaces the root layout of whichever locale failed,
 * so it has to supply the whole document — and, because the root layout's
 * stylesheet is not rendered either, it imports the global styles itself.
 *
 * It cannot know which locale was active, and guessing would hand a Spanish
 * reader an English page (or the reverse) at the worst moment. Both languages
 * are printed instead, each tagged with its own `lang`.
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
          {LOCALES.map((locale) => {
            const copy = UI[locale].status.globalError;
            return (
              <div key={locale} lang={locale}>
                <p className="eyebrow">{copy.eyebrow}</p>
                <h1 className="status-title">
                  {copy.heading.text}
                  <em>{copy.heading.emphasis}</em>
                </h1>
                <p className="status-text">{copy.body}</p>
                {error.digest ? (
                  <p className="status-ref">
                    {copy.reference}
                    <code>{error.digest}</code>
                  </p>
                ) : null}
                <div className="status-actions">
                  <button
                    type="button"
                    className="btn-solid"
                    onClick={() => retry()}
                  >
                    {copy.retry}
                  </button>
                  {/* A hard navigation on purpose: this boundary replaces the
                      root layout, so the router may be the broken part. */}
                  {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                  <a className="btn-quiet" href="/">
                    {copy.home}
                  </a>
                </div>
              </div>
            );
          })}
        </main>
      </body>
    </html>
  );
}
