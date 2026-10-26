"use client";

import { useEffect } from "react";

const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

function flip(a: DOMRect, b: DOMRect) {
  return `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${b.width / a.width})`;
}

export function FilmBehavior() {
  useEffect(() => {
    const video = document.getElementById("film");
    const control = document.getElementById("film-control");
    if (!(video instanceof HTMLVideoElement) || !(control instanceof HTMLButtonElement)) return;

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let wanted = !calm;

    const label = () => {
      control.textContent = video.paused ? "Play film" : "Pause film";
    };

    const play = () => {
      wanted = true;
      video.play().catch(() => {});
    };

    const toggle = () => {
      if (video.paused) play();
      else {
        wanted = false;
        video.pause();
      }
    };

    let open: {
      overlay: HTMLDivElement;
      win: HTMLElement;
      clone: HTMLVideoElement;
    } | null = null;

    const closeZoom = () => {
      if (!open) return;
      const { overlay, win, clone } = open;
      open = null;
      video.currentTime = clone.currentTime;
      clone.pause();
      overlay.classList.remove("open");
      const target = video.closest(".window");
      const done = () => {
        overlay.remove();
        document.documentElement.style.overflow = "";
        control.focus({ preventScroll: true });
      };
      if (calm || !(target instanceof HTMLElement)) {
        done();
        return;
      }
      const animation = win.animate(
        [
          { transform: "none" },
          { transform: flip(win.getBoundingClientRect(), target.getBoundingClientRect()) },
        ],
        { duration: 380, easing: EASE, fill: "forwards" },
      );
      animation.onfinish = done;
    };

    const onFilm = () => {
      if (open) return;
      const src = video.closest(".window");
      if (!(src instanceof HTMLElement)) return;
      const from = src.getBoundingClientRect();
      const overlay = document.createElement("div");
      overlay.className = "zoom";
      overlay.setAttribute("aria-label", "Enlarged video; click or press Escape to close");
      overlay.tabIndex = -1;
      const win = document.createElement("div");
      win.className = "window";
      const clone = video.cloneNode(true) as HTMLVideoElement;
      clone.removeAttribute("id");
      clone.currentTime = video.currentTime;
      if (clone.textTracks[0]) clone.textTracks[0].mode = "showing";
      win.appendChild(clone);
      const ratio = from.height / from.width;
      const width = Math.min(window.innerWidth * 0.94, 1600, (window.innerHeight * 0.92) / ratio);
      win.style.width = `${width}px`;
      overlay.appendChild(win);
      overlay.addEventListener("click", closeZoom);
      document.body.appendChild(overlay);
      document.documentElement.style.overflow = "hidden";
      if (!video.paused) clone.play().catch(() => {});
      open = { overlay, win, clone };
      requestAnimationFrame(() => overlay.classList.add("open"));
      overlay.focus({ preventScroll: true });
      if (!calm) {
        win.animate(
          [{ transform: flip(win.getBoundingClientRect(), from) }, { transform: "none" }],
          { duration: 480, easing: EASE },
        );
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeZoom();
    };

    const onControl = (event: Event) => {
      event.stopPropagation();
      toggle();
    };

    control.addEventListener("click", onControl);
    video.addEventListener("click", onFilm);
    document.addEventListener("keydown", onKey);
    video.addEventListener("play", label);
    video.addEventListener("pause", label);

    let observer: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && wanted) video.play().catch(() => {});
          else if (!entry.isIntersecting) video.pause();
        },
        { threshold: 0.35 },
      );
      observer.observe(video);
    } else if (wanted) {
      video.play().catch(() => {});
    }

    label();

    return () => {
      control.removeEventListener("click", onControl);
      video.removeEventListener("click", onFilm);
      document.removeEventListener("keydown", onKey);
      video.removeEventListener("play", label);
      video.removeEventListener("pause", label);
      observer?.disconnect();
      if (open) {
        open.overlay.remove();
        document.documentElement.style.overflow = "";
      }
    };
  }, []);

  return null;
}

export function ChapterMedia() {
  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const links = document.querySelectorAll(".chapter-visual a, .workflow-step a");
    let open: {
      overlay: HTMLDivElement;
      win: HTMLElement;
      link: HTMLAnchorElement;
    } | null = null;

    const close = () => {
      if (!open) return;
      const { overlay, win, link } = open;
      open = null;
      overlay.classList.remove("open");
      const target = link.querySelector(".window");
      const done = () => {
        overlay.remove();
        document.documentElement.style.overflow = "";
        link.focus({ preventScroll: true });
      };
      if (calm || !(target instanceof HTMLElement)) {
        done();
        return;
      }
      const animation = win.animate(
        [{ transform: "none" }, { transform: flip(win.getBoundingClientRect(), target.getBoundingClientRect()) }],
        { duration: 380, easing: EASE, fill: "forwards" },
      );
      animation.onfinish = done;
    };

    const onClick = (event: Event) => {
      const mouse = event as MouseEvent;
      if (mouse.metaKey || mouse.ctrlKey || mouse.shiftKey || mouse.button !== 0) return;
      const link = event.currentTarget;
      if (!(link instanceof HTMLAnchorElement)) return;
      event.preventDefault();
      const src = link.querySelector(".window");
      if (!(src instanceof HTMLElement)) return;
      const from = src.getBoundingClientRect();
      const overlay = document.createElement("div");
      overlay.className = "zoom";
      overlay.setAttribute("aria-label", "Enlarged screenshot; click or press Escape to close");
      overlay.tabIndex = -1;
      const win = src.cloneNode(true);
      if (!(win instanceof HTMLElement)) return;
      const ratio = from.height / from.width;
      const width = Math.min(window.innerWidth * 0.94, 1600, (window.innerHeight * 0.92) / ratio);
      win.style.width = `${width}px`;
      overlay.appendChild(win);
      overlay.addEventListener("click", close);
      document.body.appendChild(overlay);
      document.documentElement.style.overflow = "hidden";
      open = { overlay, win, link };
      requestAnimationFrame(() => overlay.classList.add("open"));
      overlay.focus({ preventScroll: true });
      if (!calm) {
        win.animate(
          [{ transform: flip(win.getBoundingClientRect(), from) }, { transform: "none" }],
          { duration: 480, easing: EASE },
        );
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    links.forEach((link) => {
      link.classList.add("zoomable");
      link.addEventListener("click", onClick);
    });
    document.addEventListener("keydown", onKey);

    return () => {
      links.forEach((link) => link.removeEventListener("click", onClick));
      document.removeEventListener("keydown", onKey);
      if (open) {
        open.overlay.remove();
        document.documentElement.style.overflow = "";
      }
    };
  }, []);

  return null;
}
