"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "fumadocs-ui/layouts/docs/slots/sidebar";
import { SearchTrigger } from "fumadocs-ui/layouts/shared/slots/search-trigger";
import LanguageSwitch from "./language-switch";
import { useScrolled } from "./use-scrolled";
import VersionBadge from "./version-badge";
// The client mirror, not FEATURE_BLOG: only NEXT_PUBLIC_* variables are inlined
// into the client bundle, so the server flag reads as undefined here.
import { PUBLIC_FEATURE_BLOG } from "@/lib/features";
import {
  DEFAULT_LOCALE,
  homeHref,
  otherLocale,
  type Locale,
} from "@/lib/i18n/locale";
import { UI } from "@/lib/i18n/ui";
import { REPO_URL } from "@/lib/site";

/** Homepage anchors, in page order; the labels live in the locale copy. */
const SECTIONS = [
  "#orchestration",
  "#setup",
  "#workspaces",
  "#code",
  "#review",
  "#keyboard",
  "#install",
] as const;

export default function Header({
  mode = "home",
  locale = DEFAULT_LOCALE,
  languageHref,
}: {
  /**
   * `status` is for the 404 and error pages: the same menu as `home`, but with
   * its section links pointed at the homepage so they work off it.
   */
  mode?: "home" | "docs" | "status";
  locale?: Locale;
  /** Omitted where the equivalent page in the other language does not exist. */
  languageHref?: string;
}) {
  const copy = UI[locale].header;
  const home = homeHref(locale);
  const docs = `${home}docs/`;
  const isDocs = mode === "docs";
  const isHome = mode === "home";
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled();

  /**
   * On docs pages the counterpart is the same path under the other prefix: the
   * docs checker enforces that every English page has a Spanish translation, so
   * toggling the prefix always lands on a real page.
   */
  const pathname = usePathname() ?? "";
  const other = otherLocale(locale);
  const prefix = locale === DEFAULT_LOCALE ? `/${other}` : `/${locale}`;
  const switchHref =
    languageHref ??
    (isDocs
      ? pathname.startsWith(prefix)
        ? pathname.slice(prefix.length) || "/"
        : `${prefix}${pathname}`
      : undefined);

  useEffect(() => {
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

    return () => observer?.disconnect();
  }, [isDocs]);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <>
      <nav id="nav" className={scrolled ? "scrolled" : undefined}>
        <div className="nav-container">
          <a
            href={isHome ? "#top" : home}
            className="nav-logo"
            aria-label={isHome ? copy.topAria : copy.homeAria}
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
              aria-label={copy.menu}
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
            {SECTIONS.map((href, index) => (
              <a key={href} href={isHome ? href : `${home}${href}`}>
                {copy.sections[index]}
              </a>
            ))}
            {isDocs && <SearchTrigger className="docs-search-trigger" />}
            <Link href={docs} aria-current={isDocs ? "page" : undefined}>
              {copy.docs}
            </Link>
            {PUBLIC_FEATURE_BLOG && <Link href="/blog">Blog</Link>}
            {switchHref && <LanguageSwitch locale={locale} href={switchHref} />}
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
          {SECTIONS.map((href, index) => (
            <a
              key={href}
              href={isHome ? href : `${home}${href}`}
              onClick={closeMenu}
            >
              {copy.sections[index]}
            </a>
          ))}
          <Link href={docs} onClick={closeMenu}>
            {copy.docs}
          </Link>
          {PUBLIC_FEATURE_BLOG && (
            <Link href="/blog" onClick={closeMenu}>
              Blog
            </Link>
          )}
          {switchHref && <LanguageSwitch locale={locale} href={switchHref} />}
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </>
  );
}
