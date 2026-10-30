"use client";

import {
  CAPABILITIES,
  PLATFORMS,
  RELEASES_URL,
  type PlatformId,
} from "@/lib/site";
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
            <a
              className="anchor-link"
              href="#install"
              aria-label="Permalink to Install"
            >
              #
            </a>
          </h2>
          <p>
            {ready
              ? `Mash ${version} for macOS and Linux. Install it, and the first launch sets up Git, your agent, and the skills.`
              : "Download the latest build from the Mash releases page, with its release notes."}
          </p>
        </div>

        <div className="install-grid reveal">
          {ORDER.map((id) => {
            const platform = PLATFORMS[id];
            const anchor = `install-${id}`;
            const isLinux = id === "linux";
            const hasDownload = isLinux
              ? Boolean(downloads.linuxAmd64 || downloads.linuxArm64)
              : Boolean(downloads.mac);
            return (
              <div className="install-card" id={anchor} key={id}>
                <h3>
                  {ready && hasDownload
                    ? `Mash ${version} for ${platform.label}`
                    : `Mash for ${platform.label}`}
                  <a
                    className="anchor-link"
                    href={`#${anchor}`}
                    aria-label={`Permalink to the ${platform.label} download`}
                  >
                    #
                  </a>
                </h3>
                {ready && hasDownload ? (
                  <>
                    {isLinux ? (
                      <div className="install-actions">
                        {downloads.linuxAmd64 && (
                          <a
                            className="btn-solid install-download"
                            href={downloads.linuxAmd64}
                            rel="noreferrer"
                          >
                            Download {version} · amd64
                          </a>
                        )}
                        {downloads.linuxArm64 && (
                          <a
                            className="btn-solid install-download"
                            href={downloads.linuxArm64}
                            rel="noreferrer"
                          >
                            Download {version} · arm64
                          </a>
                        )}
                      </div>
                    ) : (
                      <a
                        className="btn-solid install-download"
                        href={downloads.mac}
                        rel="noreferrer"
                      >
                        Download Mash {version} for {platform.label}
                      </a>
                    )}
                    <p className="install-card-note">
                      {isLinux ? (
                        <>
                          .deb packages · checksums and attestations in the{" "}
                          <a
                            href={RELEASES_URL}
                            target="_blank"
                            rel="noreferrer"
                          >
                            release notes
                          </a>
                        </>
                      ) : (
                        <>
                          Apple silicon · DMG · checksums in the{" "}
                          <a
                            href={RELEASES_URL}
                            target="_blank"
                            rel="noreferrer"
                          >
                            release notes
                          </a>
                        </>
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    {isLinux ? (
                      <div className="install-actions">
                        <a
                          className="btn-solid install-download"
                          href={RELEASES_URL}
                          rel="noreferrer"
                        >
                          Download · amd64
                        </a>
                        <a
                          className="btn-solid install-download"
                          href={RELEASES_URL}
                          rel="noreferrer"
                        >
                          Download · arm64
                        </a>
                      </div>
                    ) : (
                      <a
                        className="btn-solid install-download"
                        href={RELEASES_URL}
                        rel="noreferrer"
                      >
                        Download Mash for {platform.label}
                      </a>
                    )}
                    <p className="install-card-note">
                      Builds and notes are on the{" "}
                      <a href={RELEASES_URL} target="_blank" rel="noreferrer">
                        releases page
                      </a>
                      .
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
            <a
              className="anchor-link"
              href="#capabilities"
              aria-label="Permalink to the capability list"
            >
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
