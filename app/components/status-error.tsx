"use client";

import Link from "next/link";
import { useEffect } from "react";
import Footer from "./footer";
import Header from "./header";
import { homeHref, type Locale } from "@/lib/i18n/locale";
import { UI } from "@/lib/i18n/ui";
import { logError } from "@/lib/logger";

/**
 * Route-segment error boundary. Next 16 passes `retry`, not the older `reset`;
 * calling the wrong name would render a button that does nothing.
 *
 * It renders its own Header and Footer because a sibling `page.tsx` normally
 * does, and this boundary replaces that page inside the root layout.
 */
export default function StatusError({
  locale,
  error,
  retry,
}: {
  locale: Locale;
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const copy = UI[locale].status.error;

  useEffect(() => {
    logError("route-error", error, { digest: error.digest });
  }, [error]);

  return (
    <>
      <Header mode="status" locale={locale} />
      <main className="status-page wrap">
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
          <button type="button" className="btn-solid" onClick={() => retry()}>
            {copy.retry}
          </button>
          <Link className="btn-quiet" href={homeHref(locale)}>
            {copy.home}
          </Link>
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}
