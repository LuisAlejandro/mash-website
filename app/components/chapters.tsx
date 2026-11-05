import { ChapterMedia } from "./media";
import { Shortcut, ShortcutLegend } from "./shortcut";
import type { Locale } from "@/lib/i18n/locale";
import { MARKETING, type ChapterId } from "@/lib/i18n/marketing";

/**
 * A shortcut, per platform. `linux: null` means Mash's Linux keymap currently
 * binds that action to a chord it also gives to another action, so this page
 * does not print it: the in-app keybinding sheet is authoritative there.
 * A plain string is a term rather than a chord, and is shown as-is.
 */
type Keys = string | { mac: string; linux: string | null };

type Chapter = {
  id: ChapterId;
  /** Aligned with the labels in the locale copy, row for row. */
  points: Keys[];
  image: string;
  width: number;
  height: number;
  flip?: boolean;
};

/**
 * Where each chapter sits and which chord it prints. The words — eyebrows,
 * headings, bodies, row labels, window titles, alt text — come from the locale
 * copy, keyed by the same ids.
 */
const CHAPTERS: Chapter[] = [
  {
    id: "setup",
    points: ["Herdr, Ghostty, Starship, Pi, Fresh", "First launch", "~/.mash"],
    image: "/assets/mash/setup.png",
    width: 1620,
    height: 1012,
  },
  {
    id: "workspaces",
    points: [
      { mac: "⌘⌃N", linux: null },
      { mac: "⌘⌃1–9", linux: "Ctrl Alt ⇧ 1–9" },
      { mac: "⌃⇧↑  ⌃⇧↓", linux: "Ctrl ⇧ ↑  Ctrl ⇧ ↓" },
      { mac: "⌘⌃G", linux: "Ctrl Alt ⇧ G" },
    ],
    image: "/assets/mash/workspaces.png",
    width: 1620,
    height: 1012,
    flip: true,
  },
  {
    id: "code",
    points: [
      { mac: "⌘T", linux: null },
      { mac: "⌘P", linux: null },
      { mac: "⌥G", linux: "Alt G" },
      { mac: "⌃⇧G", linux: "Ctrl ⇧ G" },
    ],
    image: "/assets/mash/human-control.png",
    width: 1620,
    height: 1012,
  },
  {
    id: "review",
    points: [
      { mac: "⌘⇧R", linux: "Ctrl ⇧ R" },
      { mac: "⌘K", linux: "Ctrl Alt K" },
      { mac: "⌘⌥Y", linux: "Ctrl Alt Y" },
    ],
    image: "/assets/mash/review.png",
    width: 1620,
    height: 1012,
    flip: true,
  },
  {
    id: "keyboard",
    points: [
      { mac: "⌘⇧P", linux: "Ctrl ⇧ P" },
      { mac: "⌘⌥L", linux: null },
      { mac: "⌘I", linux: "Ctrl Alt I" },
      { mac: "⌘⇧I", linux: "Ctrl ⇧ I" },
    ],
    image: "/assets/mash/keyboard.png",
    width: 1620,
    height: 1012,
  },
];

/** The workflow loop's screenshots; the labels live in the locale copy. */
const LOOP = [
  "/assets/mash/loop-1.png",
  "/assets/mash/loop-2.png",
  "/assets/mash/loop-3.png",
  "/assets/mash/loop-4.png",
];

export default function Chapters({ locale }: { locale: Locale }) {
  const copy = MARKETING[locale];
  const permalink = (name: string) => `${copy.permalink}${name}`;

  return (
    <>
      <ShortcutLegend locale={locale} />
      <section className="chapters wrap" aria-label={copy.chaptersAria}>
        {CHAPTERS.map((chapter) => {
          const text = copy.chapters[chapter.id];
          return (
            <div
              key={chapter.id}
              className={chapter.flip ? "chapter flip" : "chapter"}
              id={chapter.id}
            >
              <div className="chapter-text reveal">
                <span className="eyebrow">{text.eyebrow}</span>
                <h2>
                  {text.heading.text}
                  <em>{text.heading.emphasis}</em>
                  <a
                    className="anchor-link"
                    href={`#${chapter.id}`}
                    aria-label={permalink(chapter.id)}
                  >
                    #
                  </a>
                </h2>
                <p>{text.body}</p>
                <ul className="points">
                  {chapter.points.map((keys, index) => (
                    <li key={typeof keys === "string" ? keys : keys.mac}>
                      {typeof keys === "string" ? (
                        <kbd>{keys}</kbd>
                      ) : (
                        <Shortcut keys={keys} locale={locale} />
                      )}{" "}
                      {text.points[index]}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="chapter-visual reveal">
                <a href={chapter.image} target="_blank" rel="noreferrer">
                  <div className="window">
                    <div className="window-bar">
                      <span></span>
                      <span></span>
                      <span></span>
                      <span className="title">{text.title}</span>
                    </div>
                    <img
                      src={chapter.image}
                      alt={text.alt}
                      width={chapter.width}
                      height={chapter.height}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </a>
              </div>
            </div>
          );
        })}
      </section>

      {/* The whole loop, in the place the testimonials used to hold: the same
          demo journey, four frames, no borrowed quotes. */}
      <section className="section wrap" id="workflow">
        <div className="section-head reveal">
          <span className="eyebrow">{copy.workflow.eyebrow}</span>
          <h2>
            {copy.workflow.heading.text}
            <em>{copy.workflow.heading.emphasis}</em>
            {copy.workflow.heading.after}
            <a
              className="anchor-link"
              href="#workflow"
              aria-label={permalink(copy.workflow.label)}
            >
              #
            </a>
          </h2>
          <p>{copy.workflow.body}</p>
        </div>
        <ol className="workflow-proof reveal">
          {LOOP.map((image, index) => (
            <li className="workflow-step" key={image}>
              <a href={image} target="_blank" rel="noreferrer">
                <div className="window">
                  <img
                    src={image}
                    alt={copy.workflow.steps[index].alt}
                    width={800}
                    height={500}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </a>
              <span className="workflow-num" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="workflow-label">
                {copy.workflow.steps[index].label}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <ChapterMedia locale={locale} />
    </>
  );
}
