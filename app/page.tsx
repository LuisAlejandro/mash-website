import Chapters from "./components/chapters";
import Faq from "./components/faq";
import Footer from "./components/footer";
import Header from "./components/header";
import Hero from "./components/hero";
import InstallBlocks from "./components/install-blocks";
import { ReleaseCta, ReleaseProvider } from "./components/release";
import { REPO_URL } from "@/lib/site";

export default function Home() {
  return (
    <ReleaseProvider>
      <Header />
      <Hero />
      <main>
        <Chapters />
        <InstallBlocks />
        <Faq />
        {/* Closing */}
        <section className="closing wrap">
          <div className="reveal">
            <p className="kicker">Your next task has somewhere to go.</p>
            <img
              className="closing-logo"
              src="/assets/mash/logo-wordmark-lg.png"
              srcSet="/assets/mash/logo-wordmark-lg.png 1x, /assets/mash/logo-wordmark-lg@2x.png 2x"
              alt="Mash"
              width="200"
              height="144"
              loading="lazy"
            />
            <p className="tag">
              A complete agentic workspace, <em>in one app.</em>
            </p>
            <div className="closing-actions">
              <ReleaseCta />
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-quiet"
              >
                <img src="/github-icon.svg" alt="" width="15" height="15" />
                GitHub
              </a>
            </div>
            <p className="fine">
              macOS on Apple silicon · Linux on amd64 and arm64
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </ReleaseProvider>
  );
}
