import Chapters from "./components/chapters";
import Footer from "./components/footer";
import Header from "./components/header";
import Hero from "./components/hero";
import InstallBlocks from "./components/install-blocks";
import { ReleaseCta, ReleaseProvider } from "./components/release";

export default function Home() {
  return (
    <ReleaseProvider>
      <Header />
      <Hero />
      <main>
        <Chapters />
        <InstallBlocks />
        {/* Closing */}
        <section className="closing wrap">
          <div className="reveal">
            <p className="kicker">Your next task has somewhere to go.</p>
            <img
              className="mark"
              src="/assets/mash/logo-mark@2x.png"
              alt=""
              width="76"
              height="76"
              loading="lazy"
            />
            <span className="name">Mash</span>
            <p className="tag">
              A complete agentic workspace, <em>in one Mac app.</em>
            </p>
            <div className="closing-actions">
              <ReleaseCta />
              <a
                href="https://github.com/LuisAlejandro/mash"
                target="_blank"
                rel="noreferrer"
                className="btn-quiet"
              >
                <img src="/github-icon.svg" alt="" width="15" height="15" />
                GitHub
              </a>
            </div>
            <p className="fine">macOS · Apple silicon</p>
          </div>
        </section>
      </main>
      <Footer />
    </ReleaseProvider>
  );
}
