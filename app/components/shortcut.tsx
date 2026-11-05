"use client";

import { usePlatform } from "./release";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";
import { UI } from "@/lib/i18n/ui";

type Keys = { mac: string; linux: string | null };

/**
 * One keyboard shortcut, shown for the visitor's platform.
 *
 * Both chords are always in the markup; the irrelevant one is hidden from the
 * screen and the accessibility tree rather than dropped, so the static export
 * carries the macOS and Linux keys for crawlers and for anyone who reads the
 * page with JavaScript off.
 *
 * A Linux chord of `null` means Mash's Linux keymap gives that chord to more
 * than one action today, so printing it would teach the wrong key. Those rows
 * show the macOS chord and say where the real one lives.
 */
export function Shortcut({
  keys,
  locale = DEFAULT_LOCALE,
}: {
  keys: Keys;
  locale?: Locale;
}) {
  const platform = usePlatform();
  const linuxUnknown = keys.linux === null;
  const copy = UI[locale].shortcut;

  if (platform === "linux" && linuxUnknown) {
    return (
      <kbd className="shortcut-unknown" title={copy.unknownTitle}>
        {copy.unknownLabel}
      </kbd>
    );
  }

  return (
    <>
      <kbd
        data-platform="mac"
        aria-hidden={platform === "mac" ? undefined : "true"}
      >
        {keys.mac}
      </kbd>
      {keys.linux !== null && (
        <kbd
          data-platform="linux"
          aria-hidden={platform === "linux" ? undefined : "true"}
        >
          {keys.linux}
        </kbd>
      )}
    </>
  );
}

/**
 * Names which platform's keys the shortcut lists are showing. The page detects
 * the platform rather than asking, so it has to say which one it picked; the
 * buttons let a visitor read the other set.
 */
export function ShortcutLegend({
  locale = DEFAULT_LOCALE,
}: {
  locale?: Locale;
}) {
  const platform = usePlatform();
  const copy = UI[locale].shortcut;
  const other = platform === "mac" ? "Linux" : "macOS";
  const current = platform === "mac" ? "macOS" : "Linux";

  return (
    <p className="shortcut-legend wrap" data-platform={platform}>
      {copy.current(current)}{" "}
      <span className="shortcut-legend-note">{copy.note(other)}</span>
    </p>
  );
}
