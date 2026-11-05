import { MARKETING } from "@/lib/i18n/marketing";
import type { Locale } from "@/lib/i18n/locale";

/** The voice walkthrough's screenshots; the labels live in the locale copy. */
const VOICE_STEPS = [
  "/assets/mash/voice-recording.png",
  "/assets/mash/voice-transcript.png",
];

export default function FeatureSpotlights({ locale }: { locale: Locale }) {
  const copy = MARKETING[locale];
  const orchestration = copy.spotlights.orchestration;
  const voice = copy.spotlights.voice;
  const permalink = (name: string) => `${copy.permalink}${name}`;

  return (
    <section
      className="section wrap spotlights"
      aria-label={copy.spotlights.aria}
    >
      <div className="orchestration-spotlight" id="orchestration">
        <div className="section-head reveal">
          <span className="eyebrow">{orchestration.eyebrow}</span>
          <h2>
            {orchestration.heading.text}
            <em>{orchestration.heading.emphasis}</em>
            <a
              className="anchor-link"
              href="#orchestration"
              aria-label={permalink(orchestration.label)}
            >
              #
            </a>
          </h2>
          <p>{orchestration.body}</p>
        </div>

        <figure className="window spotlight-film reveal">
          <video
            src="/assets/mash/orchestration-film.mp4"
            poster="/assets/mash/orchestration-film-poster.png"
            width={1600}
            height={1000}
            controls
            muted
            playsInline
            preload="none"
            aria-label={orchestration.videoAria}
          >
            <track
              kind="captions"
              src="/assets/mash/orchestration-film.en.vtt"
              srcLang="en"
              label={copy.tracks.en}
              default={locale === "en"}
            />
            <track
              kind="captions"
              src="/assets/mash/orchestration-film.es.vtt"
              srcLang="es"
              label={copy.tracks.es}
              default={locale === "es"}
            />
          </video>
        </figure>

        <ol className="spotlight-beats reveal">
          {orchestration.beats.map((beat, index) => (
            <li key={beat}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {beat}
            </li>
          ))}
        </ol>
      </div>

      <div className="voice-spotlight" id="voice">
        <div className="voice-copy reveal">
          <span className="eyebrow">{voice.eyebrow}</span>
          <h3>
            {voice.heading.text}
            <em>{voice.heading.emphasis}</em>
            <a
              className="anchor-link"
              href="#voice"
              aria-label={permalink(voice.label)}
            >
              #
            </a>
          </h3>
          <p>
            {voice.bodyBefore}
            <kbd>⌃⌥Z</kbd>
            {voice.bodyAfter}
          </p>
        </div>
        <ol className="voice-steps reveal">
          {VOICE_STEPS.map((image, index) => (
            <li key={image}>
              <a href={image} target="_blank" rel="noreferrer">
                <div className="window">
                  <img
                    src={image}
                    alt={voice.steps[index].alt}
                    width={1600}
                    height={1000}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </a>
              <p>{voice.steps[index].label}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
