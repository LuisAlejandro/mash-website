import type { ReactNode } from "react";
import { ChapterMedia } from "./media";
import { Shortcut, ShortcutLegend } from "./shortcut";

/**
 * A shortcut, per platform. `linux: null` means Mash's Linux keymap currently
 * binds that action to a chord it also gives to another action, so this page
 * does not print it: the in-app keybinding sheet is authoritative there.
 * A plain string is a term rather than a chord, and is shown as-is.
 */
type Keys = string | { mac: string; linux: string | null };
type KeyItem = [keys: Keys, label: string];

type Chapter = {
  id: string;
  eyebrow: string;
  heading: ReactNode;
  body: string;
  points: KeyItem[];
  image: string;
  width: number;
  height: number;
  title: string;
  alt: string;
  flip?: boolean;
};

const CHAPTERS: Chapter[] = [
  {
    id: "setup",
    eyebrow: "01 · Ready to work",
    heading: (
      <>
        Nothing to <em>assemble.</em>
      </>
    ),
    body: "Most agentic setups are a weekend of wiring: an agent, a workspace manager, a set of skills, a keybinding file. Mash ships them already fitted together and opens on a workspace you can type in.",
    points: [
      [
        "Herdr, Ghostty, Pi, Fresh",
        "shipped inside the app, with the Mash skills that teach the workflow",
      ],
      [
        "First launch",
        "sets your Git identity, GitHub sign-in, and the tooling you pick",
      ],
      [
        "~/.mash",
        "holds Mash's own state, and your existing configs stay as they are",
      ],
    ],
    image: "/assets/mash/setup.png",
    width: 1620,
    height: 1012,
    title: "mash — workspace",
    alt: "A Mash workspace: the agent sessions panel on the left, the file explorer and editor in the middle, and the agent's session notes beside them",
  },
  {
    id: "workspaces",
    eyebrow: "02 · Parallel work",
    heading: (
      <>
        One task, one <em>workspace.</em>
      </>
    ),
    body: "Each task gets its own workspace with its own tabs, terminals, and agent, so separate projects never pile into one window. Move between workspaces and agents from the keyboard while the rest keep running.",
    points: [
      [{ mac: "⌘⌃N", linux: null }, "new workspace"],
      [{ mac: "⌘⌃1–9", linux: "Ctrl Alt ⇧ 1–9" }, "switch to workspace N"],
      [
        { mac: "⌃⇧↑  ⌃⇧↓", linux: "Ctrl ⇧ ↑  Ctrl ⇧ ↓" },
        "previous and next agent",
      ],
      [{ mac: "⌘⌃G", linux: "Ctrl Alt ⇧ G" }, "session navigator"],
    ],
    image: "/assets/mash/workspaces.png",
    width: 1620,
    height: 1012,
    title: "mash — workspace picker",
    alt: "Mash's workspace picker listing four workspaces, each a separate project with its own path, tabs, and agents",
    flip: true,
  },
  {
    id: "code",
    eyebrow: "03 · Human control",
    heading: (
      <>
        The code stays <em>yours.</em>
      </>
    ),
    body: "The agent works in a pane beside the file, not behind a chat window. Open the buffer, make the change yourself, and the agent picks up from what is on disk.",
    points: [
      [{ mac: "⌘T", linux: null }, "dev tab with the editor and an agent"],
      [{ mac: "⌘P", linux: null }, "file finder"],
      [
        { mac: "⌥G", linux: "Alt G" },
        "pick a link or an ID out of the agent's output",
      ],
      [{ mac: "⌃⇧G", linux: "Ctrl ⇧ G" }, "source control"],
    ],
    image: "/assets/mash/human-control.png",
    width: 1620,
    height: 1012,
    title: "mash — file finder",
    alt: "Mash's file finder open over the editor, listing the repository's files and previewing the selected one's source",
  },
  {
    id: "review",
    eyebrow: "04 · Review",
    heading: (
      <>
        Speed still ends in a <em>human review.</em>
      </>
    ),
    body: "Agents propose and you decide what lands. Open a review tab for the branch, read the diff, and act on it hunk by hunk before anything is committed.",
    points: [
      [
        { mac: "⌘⇧R", linux: "Ctrl ⇧ R" },
        "review tab, with the diff and an agent together",
      ],
      [{ mac: "⌘K", linux: "Ctrl Alt K" }, "annotate a capture for the review"],
      [
        { mac: "⌘⌥Y", linux: "Ctrl Alt Y" },
        "fork an agent from one of its messages",
      ],
    ],
    image: "/assets/mash/review.png",
    width: 1620,
    height: 1012,
    title: "mash — herdr-review",
    alt: "Mash's review tab: uncommitted changes, the working diff, local branches with their ahead counts, and recent commits",
    flip: true,
  },
  {
    id: "keyboard",
    eyebrow: "05 · Keyboard first",
    heading: (
      <>
        Everything is <em>a keystroke away.</em>
      </>
    ),
    body: "Workspaces, tabs, panes, agents, search, and review all have keys, and the command palette holds the rest. Learn a handful and the app shows you the others as you go. The mouse works too.",
    points: [
      [{ mac: "⌘⇧P", linux: "Ctrl ⇧ P" }, "command palette"],
      [{ mac: "⌘⌥L", linux: null }, "search every session"],
      [{ mac: "⌘I", linux: "Ctrl Alt I" }, "settings"],
      [{ mac: "⌘⇧I", linux: "Ctrl ⇧ I" }, "the keybinding sheet"],
    ],
    image: "/assets/mash/keyboard.png",
    width: 1620,
    height: 1012,
    title: "mash — command palette",
    alt: "Mash's command palette open over a workspace, each command shown with the key combination that runs it",
  },
];

const LOOP = [
  {
    image: "/assets/mash/loop-1.png",
    label: "A workspace per task",
    alt: "Mash's workspace picker, one workspace per project",
  },
  {
    image: "/assets/mash/loop-2.png",
    label: "Agents beside the code",
    alt: "A Mash workspace with the agent session list and the editor side by side",
  },
  {
    image: "/assets/mash/loop-3.png",
    label: "Changes under review",
    alt: "Mash's review tab showing the working diff and branch status",
  },
  {
    image: "/assets/mash/loop-4.png",
    label: "Commands at hand",
    alt: "Mash's command palette listing commands with their key combinations",
  },
];

export default function Chapters() {
  return (
    <>
      <ShortcutLegend />
      <section className="chapters wrap" aria-label="How Mash works">
        {CHAPTERS.map((chapter) => (
          <div
            key={chapter.id}
            className={chapter.flip ? "chapter flip" : "chapter"}
            id={chapter.id}
          >
            <div className="chapter-text reveal">
              <span className="eyebrow">{chapter.eyebrow}</span>
              <h2>
                {chapter.heading}
                <a
                  className="anchor-link"
                  href={`#${chapter.id}`}
                  aria-label={`Permalink to ${chapter.id}`}
                >
                  #
                </a>
              </h2>
              <p>{chapter.body}</p>
              <ul className="points">
                {chapter.points.map(([keys, label]) => (
                  <li key={typeof keys === "string" ? keys : keys.mac}>
                    {typeof keys === "string" ? (
                      <kbd>{keys}</kbd>
                    ) : (
                      <Shortcut keys={keys} />
                    )}{" "}
                    {label}
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
                    <span className="title">{chapter.title}</span>
                  </div>
                  <img
                    src={chapter.image}
                    alt={chapter.alt}
                    width={chapter.width}
                    height={chapter.height}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </a>
            </div>
          </div>
        ))}
      </section>

      {/* The whole loop, in the place the testimonials used to hold: the same
          demo journey, four frames, no borrowed quotes. */}
      <section className="section wrap" id="workflow">
        <div className="section-head reveal">
          <span className="eyebrow">06 · The whole loop</span>
          <h2>
            Intent in, <em>reviewed result</em> out.
            <a
              className="anchor-link"
              href="#workflow"
              aria-label="Permalink to The whole loop"
            >
              #
            </a>
          </h2>
          <p>
            One task, followed all the way through the app: an idea becomes a
            workspace, agents work beside the code, a human fixes something by
            hand, the diff is reviewed, and the change lands.
          </p>
        </div>
        <ol className="workflow-proof reveal">
          {LOOP.map((step, index) => (
            <li className="workflow-step" key={step.label}>
              <a href={step.image} target="_blank" rel="noreferrer">
                <div className="window">
                  <img
                    src={step.image}
                    alt={step.alt}
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
              <p className="workflow-label">{step.label}</p>
            </li>
          ))}
        </ol>
      </section>

      <ChapterMedia />
    </>
  );
}
