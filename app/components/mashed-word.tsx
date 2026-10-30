"use client";

import { useEffect, useRef, useState } from "react";
import { MASHED } from "@/lib/site";

/** How long each word is readable before it flips away. */
const HOLD_MS = 2000;
/** Half a flip: out, swap, in. Must match mashed-out/mashed-in in globals.css. */
const HALF_MS = 300;

type Phase = "idle" | "out" | "in";

/**
 * The slogan's rotating word: "Let's mash <herdr> together", flipping to the
 * next program every two seconds.
 *
 * Every word is in the DOM, with all but the current one hidden from the
 * screen and the accessibility tree, so the static HTML carries every
 * program name for crawlers that never run the timer. The rotation is
 * decorative and is not announced: assistive technology reads the sentence
 * once, with the word that happens to be current.
 */
export default function MashedWord() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const reduced = useRef(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = motion.matches;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const after = (ms: number, run: () => void) =>
      timers.push(setTimeout(run, ms));

    const advance = () => {
      // Reduced motion keeps the rotation but drops the movement: the words
      // are the content, the flip is only decoration.
      if (reduced.current) {
        setIndex((i) => (i + 1) % MASHED.length);
        after(HOLD_MS, advance);
        return;
      }
      setPhase("out");
      after(HALF_MS, () => {
        setIndex((i) => (i + 1) % MASHED.length);
        setPhase("in");
        after(HALF_MS, () => {
          setPhase("idle");
          after(HOLD_MS, advance);
        });
      });
    };

    after(HOLD_MS, advance);

    const onChange = (event: MediaQueryListEvent) => {
      reduced.current = event.matches;
    };
    motion.addEventListener("change", onChange);

    return () => {
      timers.forEach(clearTimeout);
      motion.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <span className="mashed">
      {MASHED.map((word, i) => {
        const current = i === index;
        return (
          <em
            key={word}
            className={`mashed-word${current ? " is-current" : ""}${
              current && phase !== "idle" ? ` is-${phase}` : ""
            }`}
            aria-hidden={current ? undefined : "true"}
          >
            {word}
          </em>
        );
      })}
    </span>
  );
}
