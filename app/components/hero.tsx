import MashedWord from "./mashed-word";
import { FilmBehavior } from "./media";
import { ReleaseCta } from "./release";
import { RELEASES_URL, REPO_URL } from "@/lib/site";

/** Verifiable release safeguards, each linked to where it can be checked. */
const SAFEGUARDS = [
  { label: "Signed & notarized on macOS", href: RELEASES_URL },
  { label: "Build provenance on Linux", href: `${REPO_URL}/attestations` },
  { label: "SHA-256 checksums", href: RELEASES_URL },
  { label: "GPL-3.0 open source", href: `${REPO_URL}/blob/HEAD/LICENSE` },
];

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
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <span className="eyebrow reveal">Mash · macOS and Linux</span>
            <h1 className="reveal hero-slogan">
              Let&rsquo;s mash
              <br />
              <MashedWord />
              <br />
              together.
            </h1>
            <p className="lede reveal">
              Mash arrives as one app with the stack already wired together:
              Herdr for workspaces and agents, Ghostty for the terminal,
              Starship for the prompt, Pi for the coding, and Fresh for the
              editing, with the Mash skills that teach your workflow. Everything
              runs from the keyboard, and the code stays visible and editable by
              hand.
            </p>

            <div className="hero-actions reveal">
              <ReleaseCta />
              <a
                className="btn-quiet"
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
              >
                <img src="/github-icon.svg" alt="" width="15" height="15" />
                GitHub
              </a>
            </div>
            <p className="hero-note reveal">
              Apple silicon Mac · Ubuntu 24.04 · nothing to assemble
            </p>
          </div>

          {/* Full-window recording of the real app: editor and agent, command
              palette, workspace picker, file finder, and review. Muted autoplay
              loop; with reduced motion it waits on its poster until asked. */}
          <FilmBehavior />
          <figure className="window hero-window reveal">
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
            <button
              type="button"
              className="film-control"
              id="film-control"
              aria-controls="film"
            >
              Play film
            </button>
          </figure>
        </div>

        {/* Who answers for the code: a person, a track record, and the
            safeguards on every download. */}
        <div className="wrap">
          <aside className="maker reveal" aria-labelledby="maker-title">
            <img
              className="maker-logo"
              src="/assets/luisalejandro-logo.svg"
              alt=""
              width="44"
              height="44"
            />
            <div className="maker-intro">
              <h2 className="maker-title" id="maker-title">
                Who&rsquo;s behind Mash
              </h2>
              <p className="maker-text">
                Built and maintained by Luis Alejandro, a software engineer
                since 2009, author of{" "}
                <a
                  href="https://github.com/Dockershelf/dockershelf"
                  target="_blank"
                  rel="noreferrer"
                >
                  Dockershelf
                </a>{" "}
                (294K+ downloads) and 60+ open source projects.
              </p>
              <p className="maker-links">
                <a
                  href="https://luisalejandro.org"
                  target="_blank"
                  rel="noreferrer"
                >
                  luisalejandro.org
                </a>
                <a
                  href="https://github.com/LuisAlejandro"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
                <a
                  href={`${REPO_URL}/security/policy`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Report a vulnerability
                </a>
              </p>
            </div>
            <ul className="maker-safeguards">
              {SAFEGUARDS.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noreferrer">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <div className="ticker" aria-hidden="true">
          <TickerRow />
          <TickerRow reverse />
        </div>
      </header>
    </>
  );
}
