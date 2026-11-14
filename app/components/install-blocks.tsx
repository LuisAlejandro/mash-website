"use client";

import { PLATFORMS, RELEASES_URL, type PlatformId } from "@/lib/site";
import { FACTS } from "@/lib/i18n/facts";
import type { Locale } from "@/lib/i18n/locale";
import { MARKETING } from "@/lib/i18n/marketing";
import { UI } from "@/lib/i18n/ui";
import { DownloadButton } from "./download-menu";
import { platformDownload, useRelease } from "./release";

/** The install cards, in the order the page shows them. */
const ORDER: PlatformId[] = ["mac", "linux"];

export default function InstallBlocks({ locale }: { locale: Locale }) {
  const release = useRelease();
  const { state, version } = release;
  const ready = state === "ready";
  const copy = MARKETING[locale].install;
  const releaseCopy = UI[locale].release;
  const platforms = FACTS[locale].platforms;
  const capabilities = FACTS[locale].capabilities;
  const permalink = (name: string) => `${MARKETING[locale].permalink}${name}`;

  return (
    <>
      {/* Install */}
      <section className="section wrap" id="install">
        <div className="section-head reveal">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h2>
            {copy.heading.text}
            <em>{copy.heading.emphasis}</em>
            <a
              className="anchor-link"
              href="#install"
              aria-label={permalink(copy.label)}
            >
              #
            </a>
          </h2>
          <p>{ready ? copy.ready(version) : copy.fallback}</p>
        </div>

        <div className="install-grid reveal">
          {ORDER.map((id) => {
            const platform = platforms[id];
            const anchor = `install-${id}`;
            const label = PLATFORMS[id].label;
            const download = platformDownload(id, release, releaseCopy);
            return (
              <div className="install-card" id={anchor} key={id}>
                <h3>
                  {download.offered
                    ? copy.cardTitle(version, label)
                    : copy.cardTitleFallback(label)}
                  <a
                    className="anchor-link"
                    href={`#${anchor}`}
                    aria-label={permalink(copy.cardPermalink(label))}
                  >
                    #
                  </a>
                </h3>
                <DownloadButton
                  download={download}
                  className="btn-solid install-download"
                />
                <p className="install-card-note">
                  {download.offered ? (
                    <>
                      {id === "linux" ? copy.linuxNote : copy.macNote}
                      <a href={RELEASES_URL} target="_blank" rel="noreferrer">
                        {copy.releaseNotes}
                      </a>
                    </>
                  ) : (
                    <>
                      {copy.fallbackNote}
                      <a href={RELEASES_URL} target="_blank" rel="noreferrer">
                        {copy.releasesPage}
                      </a>
                      .
                    </>
                  )}
                </p>
                <ul className="points">
                  <li>{platform.requirement}</li>
                  <li>{platform.artifact}</li>
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Secondary inventory: current capabilities, outcomes first. */}
      <section className="section wrap" id="capabilities">
        <div className="section-head reveal">
          <span className="eyebrow">{copy.capabilitiesEyebrow}</span>
          <h2>
            {copy.capabilitiesHeading.text}
            <em>{copy.capabilitiesHeading.emphasis}</em>
            <a
              className="anchor-link"
              href="#capabilities"
              aria-label={copy.capabilitiesPermalink}
            >
              #
            </a>
          </h2>
        </div>
        <ul className="full-feature-list reveal">
          {capabilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </>
  );
}
