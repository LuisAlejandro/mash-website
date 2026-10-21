import { FilmBehavior } from "./media";
import { ReleaseCta } from "./release";

const CAPABILITIES = [
  "Workspaces",
  "Worktrees",
  "Agent per workspace",
  "Review tabs",
  "Command palette",
  "File finder",
  "Session search",
  "Session navigator",
  "Source control",
  "Annotations",
  "Pane splits",
  "Plugin manager",
  "Fork from message",
  "Editor and agent",
  "Diff review",
  "Markdown preview",
  "Keyboard-first",
];

function TickerRow({ reverse = false }: { reverse?: boolean }) {
  const items = reverse ? [...CAPABILITIES].reverse() : CAPABILITIES;
  return (
    <div className="ticker-row" aria-hidden="true">
      {/* The list is repeated so a -50% drift wraps without a visible jump. */}
      {[...items, ...items].map((item, index) => (
        <span key={`${item}-${index}`}>{item}</span>
      ))}
    </div>
  );
}

export default function Hero() {
  return (
    <>
      {/* Hero: the promise, the download, and the film that proves it. */}
      <header className="hero" id="top">
        <div className="wrap hero-copy">
          <span className="eyebrow reveal">Mash · macOS</span>
          <h1 className="reveal">
            A complete
            <br />
            <em>agentic workspace</em>
            <br />
            in one Mac app.
          </h1>
          <p className="lede reveal">
            Mash arrives as one Mac app with the stack already wired together: Herdr for workspaces
            and agents, Pi for the coding, and the Mash skills that teach both your workflow.
            Everything runs from the keyboard, and the code stays visible and editable by hand.
          </p>

          <div className="hero-actions reveal">
            <ReleaseCta />
            <a className="btn-quiet" href="https://github.com/LuisAlejandro/mash" target="_blank" rel="noreferrer">
              <img src="/github-icon.svg" alt="" width="15" height="15" />
              GitHub
            </a>
          </div>
          <p className="hero-note reveal">Apple silicon Mac · one DMG · nothing to configure</p>
        </div>

        {/* The film, cut from one recording of the real app: idea, parallel
            agents, a hand edit, review, result. Muted autoplay loop; with
            reduced motion it waits on its poster until asked. */}
        <FilmBehavior />
        <figure className="window hero-window reveal">
          <div className="window-bar">
            <span></span>
            <span></span>
            <span></span>
            <span className="title">mash · workspace</span>
          </div>
          <video
            id="film"
            src="/assets/mash/hero-film.mp4"
            poster="/assets/mash/hero-film-poster.png"
            width={1600}
            height={1000}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="A short tour of Mash: the command palette, the workspace picker, the file finder, and the review tab"
          >
            <track
              kind="captions"
              src="/assets/mash/hero-film.en.vtt"
              srcLang="en"
              label="English"
              default
            />
          </video>
          <button type="button" className="film-control" id="film-control" aria-controls="film">
            Play film
          </button>
        </figure>

        <div className="ticker" aria-hidden="true">
          <TickerRow />
          <TickerRow reverse />
        </div>
      </header>
    </>
  );
}
