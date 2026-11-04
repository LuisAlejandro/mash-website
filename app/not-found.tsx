import type { Metadata } from "next";
import Link from "next/link";
import Footer from "./components/footer";
import Header from "./components/header";
import { RELEASES_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found | Mash",
  robots: { index: false, follow: true },
};

/**
 * Served by the App Router for any path with no route. It renders its own
 * Header and Footer because the root layout only supplies `<html>`/`<body>`.
 */
export default function NotFound() {
  return (
    <>
      <Header mode="status" />
      <main className="status-page wrap">
        <p className="eyebrow">404</p>
        <h1 className="status-title">
          This page is not here <em>anymore.</em>
        </h1>
        <p className="status-text">
          The link may be out of date. The documentation and the releases page
          are where most things live.
        </p>
        <div className="status-actions">
          <Link className="btn-solid" href="/">
            Back to the homepage
          </Link>
          <Link className="btn-quiet" href="/docs/">
            Read the docs
          </Link>
          <a className="btn-quiet" href={RELEASES_URL}>
            Releases
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
