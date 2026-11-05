import Chapters from "./chapters";
import Faq from "./faq";
import FeatureSpotlights from "./feature-spotlights";
import Footer from "./footer";
import Header from "./header";
import Hero from "./hero";
import InstallBlocks from "./install-blocks";
import { ReleaseCta, ReleaseProvider } from "./release";
import { getLatestAppRelease } from "@/lib/app-release";
import { MARKETING } from "@/lib/i18n/marketing";
import { homeHref, otherLocale, type Locale } from "@/lib/i18n/locale";
import { REPO_URL } from "@/lib/site";
import {
  buildFaq,
  buildFaqSchema,
  buildSiteGraph,
  toJsonLdScript,
} from "@/lib/structured-data";

/**
 * The marketing homepage, in one language. Both root layouts render this, so
 * the section order, the anchors, and the structured data cannot drift apart
 * between `/` and `/es/`.
 */
export default async function HomePage({ locale }: { locale: Locale }) {
  const copy = MARKETING[locale];
  const release = await getLatestAppRelease();
  const faq = buildFaq(release, locale);
  const faqSchema = buildFaqSchema(faq, locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: toJsonLdScript(buildSiteGraph(release, locale)),
        }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLdScript(faqSchema) }}
        />
      )}
      <ReleaseProvider release={release}>
        <div id="home-page">
          <Header
            locale={locale}
            languageHref={homeHref(otherLocale(locale))}
          />
          <Hero locale={locale} />
          <main>
            <FeatureSpotlights locale={locale} />
            <Chapters locale={locale} />
            <InstallBlocks locale={locale} />
            <Faq items={faq} locale={locale} />
            {/* Closing */}
            <section className="closing wrap">
              <div className="reveal">
                <p className="kicker">{copy.closing.kicker}</p>
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
                  {copy.closing.tag.text}
                  <em>{copy.closing.tag.emphasis}</em>
                </p>
                <div className="closing-actions">
                  <ReleaseCta locale={locale} />
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
                <p className="fine">{copy.closing.fine}</p>
              </div>
            </section>
          </main>
          <Footer locale={locale} />
        </div>
      </ReleaseProvider>
    </>
  );
}
