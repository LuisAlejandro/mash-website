"use client";

import { useEffect, useId, useRef, useState } from "react";

export type DownloadOption = {
  /** Short name shown inside the menu, e.g. "amd64". */
  name: string;
  href: string;
};

export type Download = {
  /** Text of the button: the single link, or the dropdown trigger. */
  label: string;
  options: DownloadOption[];
  /** False when the button points at the releases page instead of a file. */
  offered: boolean;
};

/**
 * One download. A single option renders as the plain solid link it always
 * was; several options render the same button as a dropdown with an arrow.
 */
export function DownloadButton({
  download,
  className = "btn-solid",
}: {
  download: Download;
  className?: string;
}) {
  const [first] = download.options;
  if (download.options.length === 1 && first) {
    return (
      <a className={className} href={first.href} rel="noreferrer">
        {download.label}
      </a>
    );
  }
  return <DownloadMenu download={download} className={className} />;
}

function DownloadMenu({
  download,
  className,
}: {
  download: Download;
  className: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Closes on a click outside the menu or on Escape, which also returns focus
  // to the trigger. Listeners exist only while the menu is open.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="download-menu" ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`${className} download-trigger`}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {download.label}
        <svg
          className="download-chevron"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M2.5 4.5 6 8l3.5-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <ul className="download-options" id={menuId}>
          {download.options.map((option) => (
            <li key={option.name}>
              <a
                href={option.href}
                rel="noreferrer"
                onClick={() => setOpen(false)}
              >
                {option.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
