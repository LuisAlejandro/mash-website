"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { REPO_URL } from "@/lib/site";

/**
 * Navigation for the blog and admin surfaces.
 *
 * The homepage header is built around same-page section anchors and the docs
 * header mounts Fumadocs' search and sidebar triggers, neither of which exists
 * here. This reuses the same nav styles with links that actually resolve.
 */
export default function BlogHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav id="nav" className={scrolled ? "scrolled" : undefined}>
      <div className="nav-container">
        <Link href="/" className="nav-logo" aria-label="Mash, home">
          <img
            src="/assets/mash/logo-wordmark.png"
            srcSet="/assets/mash/logo-wordmark.png 1x, /assets/mash/logo-wordmark@2x.png 2x"
            alt=""
            width="50"
            height="36"
          />
        </Link>
        <div className="nav-links">
          <Link href="/blog">Blog</Link>
          <Link href="/docs/">Docs</Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="btn-quiet"
          >
            <img src="/github-icon.svg" alt="" width="15" height="15" />
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}
