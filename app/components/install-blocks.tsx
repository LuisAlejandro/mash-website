"use client";

import { CAPABILITIES, RELEASES_URL, REPO_URL } from "@/lib/site";
import { useRelease } from "./release";


export default function InstallBlocks() {
  const { state, version, downloadUrl } = useRelease();
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
              ? `Mash ${version} for macOS on Apple silicon. Open the DMG, drag Mash into Applications, and the first launch sets up Git, your agent, and the skills.`
              : "The first public build is not out yet. It will appear on the Mash repository with its release notes, and this page will offer the download as soon as it does."}
          </p>
        </div>

        <div className="install-grid reveal">
          <div className="install-card" id="install-macos">
            <h3>
              {ready ? `Mash ${version}` : "Mash for macOS"}
              <a className="anchor-link" href="#install-macos" aria-label="Permalink to the macOS download">
                #
              </a>
            </h3>
            {ready ? (
              <>
                <a className="btn-solid install-download" href={downloadUrl} rel="noreferrer">
                  Download Mash {version} for macOS
                </a>
                <p className="install-card-note">
                  Apple silicon · DMG · checksums in the{" "}
                  <a href={RELEASES_URL} target="_blank" rel="noreferrer">
                    release notes
                  </a>
                </p>
              </>
            ) : (
              <>
                <span className="btn-solid is-pending" aria-disabled="true">
                  Coming soon to macOS
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
          </div>
          <div className="install-card" id="install-requirements">
            <h3>
              What it needs
              <a className="anchor-link" href="#install-requirements" aria-label="Permalink to requirements">
                #
              </a>
            </h3>
            <ul className="points">
              <li>An Apple silicon Mac</li>
              <li>One DMG, signed and notarized</li>
              <li>No Homebrew, npm, or toolchain step</li>
            </ul>
          </div>
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
