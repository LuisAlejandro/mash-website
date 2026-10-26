"use client";

import { usePlatform } from "./release";

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
export function Shortcut({ keys }: { keys: Keys }) {
  const platform = usePlatform();
  const linuxUnknown = keys.linux === null;

  if (platform === "linux" && linuxUnknown) {
    return (
      <kbd
        className="shortcut-unknown"
        title="See the in-app keybinding sheet (Ctrl ⇧ I)"
      >
        in-app sheet
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
export function ShortcutLegend() {
  const platform = usePlatform();
  const other = platform === "mac" ? "Linux" : "macOS";
  const current = platform === "mac" ? "macOS" : "Linux";

  return (
    <p className="shortcut-legend wrap" data-platform={platform}>
      Shortcuts below are the {current} keys.{" "}
      <span className="shortcut-legend-note">
        Mash ships a {other} keymap too, and the in-app keybinding sheet always
        shows the keys for the machine you are on.
      </span>
    </p>
  );
}
