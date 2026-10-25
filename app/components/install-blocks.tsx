"use client";

import { CAPABILITIES, PLATFORMS, RELEASES_URL, REPO_URL, type PlatformId } from "@/lib/site";
import { useRelease } from "./release";

/** The install cards, in the order the page shows them. */
const ORDER: PlatformId[] = ["mac", "linux"];

export default function InstallBlocks() {
  const { state, version, downloads } = useRelease();
  const ready = state === "ready";

  return (
    <>
      {/* Install */}
      <section className="section wrap" id="install">
        <div className="section-head reveal">
          <span className="eyebrow">Install</span>
          <h2>
            One download. <em>Nothing to configure.</em>
            <a className="anchor-link" href="#install" aria-label="Permalink to Install">
              #
            </a>
          </h2>
          <p>
            {ready
              ? `Mash ${version} for macOS and Linux. Install it, and the first launch sets up Git, your agent, and the skills.`
              : "The first public build is not out yet. It will appear on the Mash repository with its release notes, and this page will offer the download as soon as it does."}
          </p>
        </div>

        <div className="install-grid reveal">
          {ORDER.map((id) => {
            const platform = PLATFORMS[id];
            const href = downloads[id];
            const anchor = `install-${id}`;
            return (
              <div className="install-card" id={anchor} key={id}>
                <h3>
                  {ready && href ? `Mash ${version} for ${platform.label}` : `Mash for ${platform.label}`}
                  <a
                    className="anchor-link"
                    href={`#${anchor}`}
                    aria-label={`Permalink to the ${platform.label} download`}
                  >
                    #
                  </a>
                </h3>
                {ready && href ? (
                  <>
                    <a className="btn-solid install-download" href={href} rel="noreferrer">
                      Download Mash {version} for {platform.label}
                    </a>
                    <p className="install-card-note">
                      {id === "linux" ? (
                        <>
                          amd64 · arm64 and checksums in the{" "}
                          <a href={RELEASES_URL} target="_blank" rel="noreferrer">
                            release notes
                          </a>
                        </>
                      ) : (
                        <>
                          Apple silicon · DMG · checksums in the{" "}
                          <a href={RELEASES_URL} target="_blank" rel="noreferrer">
                            release notes
                          </a>
                        </>
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <span className="btn-solid is-pending" aria-disabled="true">
                      Coming soon to {platform.label}
                    </span>
                    <p className="install-card-note">
                      In the meantime, the{" "}
                      <a href={REPO_URL} target="_blank" rel="noreferrer">
                        repository
                      </a>{" "}
                      is where the build and its notes will land.
                    </p>
                  </>
                )}
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
          <span className="eyebrow">Everything else</span>
          <h2>
            And the rest is <em>already there.</em>
            <a className="anchor-link" href="#capabilities" aria-label="Permalink to the capability list">
              #
            </a>
          </h2>
        </div>
        <ul className="full-feature-list reveal">
          {CAPABILITIES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </>
  );
}
