"use client";

import { useEffect, useState } from "react";
import VersionBadge from "./version-badge";
import { REPO_URL } from "@/lib/site";

const SECTIONS = [
  ["#setup", "Setup"],
  ["#workspaces", "Workspaces"],
  ["#code", "Code"],
  ["#review", "Review"],
  ["#keyboard", "Keyboard"],
  ["#install", "Install"],
] as const;

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const items = document.querySelectorAll(".reveal");
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
  }, []);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <>
      <nav id="nav" className={scrolled ? "scrolled" : undefined}>
        <div className="nav-container">
          <a href="#top" className="nav-logo" aria-label="Mash, back to top">
            <img
              src="/assets/mash/logo-wordmark.png"
              srcSet="/assets/mash/logo-wordmark.png 1x, /assets/mash/logo-wordmark@2x.png 2x"
              alt=""
              width="50"
              height="36"
            />
            <VersionBadge />
          </a>
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
          <div className="nav-links">
            {SECTIONS.map(([href, label]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
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
            <a key={href} href={href} onClick={closeMenu}>
              {label}
            </a>
          ))}
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </>
  );
}
