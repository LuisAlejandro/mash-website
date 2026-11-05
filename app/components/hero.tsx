import MashedWord from "./mashed-word";
import { FilmBehavior } from "./media";
import { ReleaseCta } from "./release";
import { MARKETING } from "@/lib/i18n/marketing";
import type { Locale } from "@/lib/i18n/locale";
import { UI } from "@/lib/i18n/ui";
import { RELEASES_URL, REPO_URL } from "@/lib/site";

/** Where each safeguard can be checked. The labels are localized copy. */
const SAFEGUARDS = [
  RELEASES_URL,
  `${REPO_URL}/attestations`,
  RELEASES_URL,
  `${REPO_URL}/blob/HEAD/LICENSE`,
];

function TickerRow({
  items,
  reverse = false,
}: {
  items: string[];
  reverse?: boolean;
}) {
  const ordered = reverse ? [...items].reverse() : items;
  return (
    <div className="ticker-row" aria-hidden="true">
      {/* The list is repeated so a -50% drift wraps without a visible jump. */}
      {[...ordered, ...ordered].map((item, index) => (
        <span key={`${item}-${index}`}>{item}</span>
      ))}
    </div>
  );
}

export default function Hero({ locale }: { locale: Locale }) {
  const copy = MARKETING[locale];

  return (
    <>
      {/* Hero: the promise, the download, and the film that proves it. */}
      <header className="hero" id="top">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <span className="eyebrow reveal">{copy.hero.eyebrow}</span>
            <h1 className="reveal hero-slogan">
              {copy.hero.sloganLead}
              <br />
              <MashedWord />
              <br />
              {copy.hero.sloganTail}
            </h1>
            <p className="lede reveal">{copy.hero.lede}</p>

            <div className="hero-actions reveal">
              <ReleaseCta locale={locale} />
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
            <p className="hero-note reveal">{copy.hero.note}</p>
          </div>

          {/* Full-window recording of the real app: editor and agent, command
              palette, workspace picker, file finder, and review. Muted autoplay
              loop; with reduced motion it waits on its poster until asked. */}
          <FilmBehavior locale={locale} />
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
              aria-label={copy.hero.filmAria}
            >
              {/* The audio is English, so its captions are the default unless
                  the reader chose Spanish: then the Spanish track leads. */}
              <track
                kind="captions"
                src="/assets/mash/hero-film.en.vtt"
                srcLang="en"
                label={copy.tracks.en}
                default={locale === "en"}
              />
              <track
                kind="captions"
                src="/assets/mash/hero-film.es.vtt"
                srcLang="es"
                label={copy.tracks.es}
                default={locale === "es"}
              />
            </video>
            <button
              type="button"
              className="film-control"
              id="film-control"
              aria-controls="film"
            >
              {UI[locale].media.playFilm}
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
                {copy.hero.makerTitle}
              </h2>
              <p className="maker-text">
                {copy.hero.makerLead}
                <a
                  href="https://github.com/Dockershelf/dockershelf"
                  target="_blank"
                  rel="noreferrer"
                >
                  Dockershelf
                </a>
                {copy.hero.makerTail}
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
                  {copy.hero.vulnerability}
                </a>
              </p>
            </div>
            <ul className="maker-safeguards">
              {SAFEGUARDS.map((href, index) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noreferrer">
                    {copy.hero.safeguards[index]}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <div className="ticker" aria-hidden="true">
          <TickerRow items={copy.ticker} />
          <TickerRow items={copy.ticker} reverse />
        </div>
      </header>
    </>
  );
}
