"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SidebarTrigger } from "fumadocs-ui/layouts/docs/slots/sidebar";
import { SearchTrigger } from "fumadocs-ui/layouts/shared/slots/search-trigger";
import VersionBadge from "./version-badge";
// The client mirror, not FEATURE_BLOG: only NEXT_PUBLIC_* variables are inlined
// into the client bundle, so the server flag reads as undefined here.
import { PUBLIC_FEATURE_BLOG } from "@/lib/features";
import { REPO_URL } from "@/lib/site";

const SECTIONS = [
  ["#orchestration", "Orchestration"],
  ["#setup", "Setup"],
  ["#workspaces", "Workspaces"],
  ["#code", "Code"],
  ["#review", "Review"],
  ["#keyboard", "Keyboard"],
  ["#install", "Install"],
] as const;

export default function Header({
  mode = "home",
}: {
  /**
   * `status` is for the 404 and error pages: the same menu as `home`, but with
   * its section links pointed at `/#...` so they work off the homepage.
   */
  mode?: "home" | "docs" | "status";
}) {
  const isDocs = mode === "docs";
  const isHome = mode === "home";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const items = isDocs ? [] : document.querySelectorAll(".reveal");
    let observer: IntersectionObserver | undefined;
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in"));
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              observer?.unobserve(entry.target);
            }
          }
        },
        { rootMargin: "0px 0px -6% 0px", threshold: 0 }
      );
      items.forEach((el) => observer?.observe(el));
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
    };
  }, [isDocs]);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <>
      <nav id="nav" className={scrolled ? "scrolled" : undefined}>
        <div className="nav-container">
          <a
            href={isHome ? "#top" : "/"}
            className="nav-logo"
            aria-label={isHome ? "Mash, back to top" : "Mash, home"}
          >
            <img
              src="/assets/mash/logo-wordmark.png"
              srcSet="/assets/mash/logo-wordmark.png 1x, /assets/mash/logo-wordmark@2x.png 2x"
              alt=""
              width="50"
              height="36"
            />
            <VersionBadge />
          </a>
          {isDocs ? (
            <div className="docs-mobile-actions">
              <SearchTrigger className="docs-search-trigger" />
              <SidebarTrigger className="hamburger docs-sidebar-trigger">
                <span></span>
                <span></span>
                <span></span>
              </SidebarTrigger>
            </div>
          ) : (
            <button
              className={open ? "hamburger active" : "hamburger"}
              aria-label="Menu"
              aria-controls="mobile-menu"
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          )}
          <div className="nav-links">
            {SECTIONS.map(([href, label]) => (
              <a key={href} href={isHome ? href : `/${href}`}>
                {label}
              </a>
            ))}
            {isDocs && <SearchTrigger className="docs-search-trigger" />}
            <Link href="/docs/" aria-current={isDocs ? "page" : undefined}>
              Docs
            </Link>
            {PUBLIC_FEATURE_BLOG && <Link href="/blog">Blog</Link>}
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

      <div
        className={open ? "mobile-menu active" : "mobile-menu"}
        id="mobile-menu"
      >
        <div className="mobile-menu-content">
          {SECTIONS.map(([href, label]) => (
            <a key={href} href={isDocs ? `/${href}` : href} onClick={closeMenu}>
              {label}
            </a>
          ))}
          <Link href="/docs/" onClick={closeMenu}>
            Docs
          </Link>
          {PUBLIC_FEATURE_BLOG && (
            <Link href="/blog" onClick={closeMenu}>
              Blog
            </Link>
          )}
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </>
  );
}
