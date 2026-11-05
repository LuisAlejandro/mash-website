"use client";

import { useCallback, useSyncExternalStore, type ReactNode } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";
import { UI } from "@/lib/i18n/ui";

const STORAGE_KEY = "mash.consent";

type Choice = "granted" | "denied" | null;

/**
 * Nothing to consent to when no tracker is configured, which is the case on a
 * bare build. Both IDs are `NEXT_PUBLIC_`, so this is a build-time constant.
 */
const ANALYTICS_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
  process.env.NEXT_PUBLIC_META_PIXEL_ID
);

/**
 * The stored choice, or `null` when there is none. A blocked `localStorage`
 * (private mode, third-party cookie settings) reads as "not decided", so the
 * banner still appears and the in-memory choice covers the visit.
 */
function readChoice(): Choice {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

/**
 * The choice lives in `localStorage`, an external store, so it is read through
 * `useSyncExternalStore` rather than an effect: the server and the hydrating
 * render both see `null`, then the real value arrives without a cascading
 * render, and no tracker can load before the visitor has answered.
 */
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Another tab changing the choice should update this one too.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function notify(): void {
  for (const listener of listeners) listener();
}

const serverChoice = () => null;

export default function ConsentGate({
  children,
  locale = DEFAULT_LOCALE,
}: {
  children: ReactNode;
  locale?: Locale;
}) {
  const choice = useSyncExternalStore(subscribe, readChoice, serverChoice);
  const copy = UI[locale].consent;

  const decide = useCallback((next: "granted" | "denied") => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The choice still applies to this visit.
    }
    notify();
  }, []);

  return (
    <>
      {!ANALYTICS_CONFIGURED || choice === "granted" ? children : null}
      {ANALYTICS_CONFIGURED && choice === null ? (
        <aside
          className="consent"
          aria-label={copy.ariaLabel}
          aria-live="polite"
        >
          <p className="consent-text">{copy.text}</p>
          <div className="consent-actions">
            <button
              type="button"
              className="btn-solid"
              onClick={() => decide("granted")}
            >
              {copy.allow}
            </button>
            <button
              type="button"
              className="btn-quiet"
              onClick={() => decide("denied")}
            >
              {copy.deny}
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
