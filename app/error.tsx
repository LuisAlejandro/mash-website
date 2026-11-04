"use client";

import Link from "next/link";
import { useEffect } from "react";
import Footer from "./components/footer";
import Header from "./components/header";
import { logError } from "@/lib/logger";

/**
 * Route-segment error boundary. Next 16 passes `retry`, not the older `reset`;
 * calling the wrong name would render a button that does nothing.
 *
 * It renders its own Header and Footer because a sibling `page.tsx` normally
 * does, and this boundary replaces that page inside the root layout.
 */
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    logError("route-error", error, { digest: error.digest });
  }, [error]);

  return (
    <>
      <Header mode="status" />
      <main className="status-page wrap">
        <p className="eyebrow">Something broke</p>
        <h1 className="status-title">
          This page did not <em>load.</em>
        </h1>
        <p className="status-text">
          The error was reported. Trying again often works; if it keeps failing,
          open an issue and include the reference below.
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
          <Link className="btn-quiet" href="/">
            Back to the homepage
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
