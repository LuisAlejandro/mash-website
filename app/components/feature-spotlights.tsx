const VOICE_STEPS = [
  {
    image: "/assets/mash/voice-recording.png",
    label: "Start dictation",
    alt: "Pi in Mash showing the voice recording meter with the controls to transcribe or discard",
  },
  {
    image: "/assets/mash/voice-transcript.png",
    label: "Check the text",
    alt: "Pi in Mash showing a spoken request transcribed into the message box before it is sent",
  },
];

export default function FeatureSpotlights() {
  return (
    <section className="section wrap spotlights" aria-label="New in Mash">
      <div className="orchestration-spotlight" id="orchestration">
        <div className="section-head reveal">
          <span className="eyebrow">Agent orchestration</span>
          <h2>
            Delegate in parallel. <em>Stay the decision-maker.</em>
            <a
              className="anchor-link"
              href="#orchestration"
              aria-label="Permalink to agent orchestration"
            >
              #
            </a>
          </h2>
          <p>
            A coordinator agent splits a goal into independent tasks, starts
            worker agents beside you, answers their questions, and gathers what
            they finished. You still inspect and review every change.
          </p>
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
            aria-label="Mash orchestration: two agents edit separate files, one asks the coordinator a question, and both report results for review"
          >
            <track
              kind="captions"
              src="/assets/mash/orchestration-film.en.vtt"
              srcLang="en"
              label="English"
              default
            />
          </video>
        </figure>

        <ol className="spotlight-beats reveal">
          <li>
            <span>01</span>Split the work
          </li>
          <li>
            <span>02</span>Answer worker questions
          </li>
          <li>
            <span>03</span>Gather results, then review
          </li>
        </ol>
      </div>

      <div className="voice-spotlight" id="voice">
        <div className="voice-copy reveal">
          <span className="eyebrow">Pi Voice dictation</span>
          <h3>
            Talk through the task. <em>Edit before it is sent.</em>
            <a
              className="anchor-link"
              href="#voice"
              aria-label="Permalink to Pi Voice dictation"
            >
              #
            </a>
          </h3>
          <p>
            Dictate to Pi when typing is slower than saying it. Speech becomes
            text in the message box, so you can read or edit the request before
            you send it. On macOS, <kbd>⌃⌥Z</kbd> starts and stops dictation.
          </p>
        </div>
        <ol className="voice-steps reveal">
          {VOICE_STEPS.map((step) => (
            <li key={step.image}>
              <a href={step.image} target="_blank" rel="noreferrer">
                <div className="window">
                  <img
                    src={step.image}
                    alt={step.alt}
                    width={1600}
                    height={1000}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </a>
              <p>{step.label}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
