import type { LatestRelease } from "./app-release";
import type { PublicPost, PublicPostSummary } from "./blog/types";
import { FACTS, formatReleaseDate, type FaqCopy } from "./i18n/facts.ts";
import { DEFAULT_LOCALE, homeHref, type Locale } from "./i18n/locale.ts";
import {
  APP_NAME,
  DOWNLOAD_URL,
  FILM,
  LICENSE,
  ORCHESTRATION_FILM,
  RELEASES_URL,
  REPO_URL,
  SITE_URL,
} from "./site.ts";

export type FaqItem = FaqCopy;

const ORGANIZATION_ID = `${SITE_URL}/#Organization`;
const WEBSITE_ID = `${SITE_URL}/#WebSite`;
const APP_ID = `${SITE_URL}/#SoftwareApplication`;
const BLOG_ID = `${SITE_URL}/#Blog`;

const BLOG_DESCRIPTION = "Release notes and writing from the Mash project.";

function organization() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: APP_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      url: `${SITE_URL}/assets/mash/logo-mark@2x.png`,
      width: 152,
      height: 152,
    },
    sameAs: [REPO_URL],
  };
}

function website(locale: Locale) {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}${homeHref(locale)}`,
    name: APP_NAME,
    description: FACTS[locale].siteDescription,
    inLanguage: locale,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

function softwareApplication(release: LatestRelease | null, locale: Locale) {
  return {
    "@type": "SoftwareApplication",
    "@id": APP_ID,
    name: APP_NAME,
    url: `${SITE_URL}${homeHref(locale)}`,
    description: FACTS[locale].siteDescription,
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: FACTS[locale].applicationSubCategory,
    operatingSystem: ["macOS 14", "Ubuntu 24.04"],
    processorRequirements: "Apple silicon, x86-64, or ARM64",
    // Omitted when the release lookup failed, so no version is claimed.
    ...(release ? { softwareVersion: release.version } : {}),
    isAccessibleForFree: true,
    license: `https://spdx.org/licenses/${LICENSE}.html`,
    featureList: FACTS[locale].features,
    sameAs: [REPO_URL],
    publisher: { "@id": ORGANIZATION_ID },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      // The build is not downloadable yet. Announcing a download URL now would
      // point crawlers at a 404. The releases page always exists.
      ...(DOWNLOAD_URL ? { url: DOWNLOAD_URL } : { url: RELEASES_URL }),
    },
    screenshot: {
      "@type": "ImageObject",
      url: `${SITE_URL}/assets/mash/setup.png`,
      width: 1620,
      height: 1012,
    },
  };
}

function videoObject(locale: Locale) {
  return {
    "@type": "VideoObject",
    "@id": `${SITE_URL}/#hero-film`,
    name: FACTS[locale].films.hero.name,
    description: FACTS[locale].films.hero.description,
    thumbnailUrl: [`${SITE_URL}${FILM.poster}`],
    uploadDate: FILM.uploadDate,
    duration: FILM.duration,
    contentUrl: `${SITE_URL}${FILM.path}`,
    width: FILM.width,
    height: FILM.height,
    inLanguage: locale,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

function orchestrationVideoObject(locale: Locale) {
  return {
    "@type": "VideoObject",
    "@id": `${SITE_URL}/#orchestration-film`,
    name: FACTS[locale].films.orchestration.title,
    description: FACTS[locale].films.orchestration.description,
    thumbnailUrl: [`${SITE_URL}${ORCHESTRATION_FILM.poster}`],
    uploadDate: ORCHESTRATION_FILM.uploadDate,
    duration: ORCHESTRATION_FILM.duration,
    contentUrl: `${SITE_URL}${ORCHESTRATION_FILM.path}`,
    width: ORCHESTRATION_FILM.width,
    height: ORCHESTRATION_FILM.height,
    inLanguage: locale,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/** Site-wide entity graph. One `<script>` carries every node. */
export function buildSiteGraph(
  release: LatestRelease | null,
  locale: Locale = DEFAULT_LOCALE
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization(),
      website(locale),
      softwareApplication(release, locale),
      videoObject(locale),
      orchestrationVideoObject(locale),
    ],
  };
}

/**
 * One docs page as an entity, tied to the site's `WebSite` node.
 *
 * No dates: a docs page has no trustworthy publication or modification time,
 * and a guessed one would outlive the text it claims to describe.
 */
export function buildWebPageSchema(page: {
  url: string;
  name: string;
  description?: string;
  locale?: Locale;
}) {
  // The sitemap and docs canonical use trailing slashes.
  const url = `${SITE_URL}${page.url}`.replace(/\/?$/, "/");

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#WebPage`,
    url,
    name: page.name,
    ...(page.description ? { description: page.description } : {}),
    ...(page.locale ? { inLanguage: page.locale } : {}),
    isPartOf: { "@id": WEBSITE_ID },
  };
}

/**
 * The blog index as a `Blog` entity, listing the published posts it shows.
 * Only what a listing entry can state truthfully is carried; the body and the
 * modified time live on each post node instead.
 */
export function buildBlogSchema(posts: PublicPostSummary[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": BLOG_ID,
    url: `${SITE_URL}/blog`,
    name: `${APP_NAME} blog`,
    description: BLOG_DESCRIPTION,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      "@id": `${blogPostUrl(post.slug)}#BlogPosting`,
      url: blogPostUrl(post.slug),
      headline: post.title,
      datePublished: post.createdAt,
    })),
  };
}

/**
 * One published post as a `BlogPosting`, attributed to the organization rather
 * than to a person the database does not record.
 */
export function buildBlogPostSchema(post: PublicPost) {
  const url = blogPostUrl(post.slug);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#BlogPosting`,
    url,
    headline: post.title,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    isPartOf: { "@id": BLOG_ID },
  };
}

function blogPostUrl(slug: string): string {
  return `${SITE_URL}/blog/posts/${slug}`;
}

/**
 * Serialize JSON-LD for an inline `<script>`. Escaping `<` keeps a stray
 * `</script>` inside any copy from closing the tag early.
 */
export function toJsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function downloadAnswer(release: LatestRelease | null, locale: Locale): string {
  const copy = FACTS[locale].faq;
  const lead =
    release && Object.keys(release.downloads).length > 0
      ? copy.releaseLine(
          release.version,
          release.publishedAt
            ? formatReleaseDate(release.publishedAt, locale)
            : ""
        )
      : copy.missing;
  return `${lead}${copy.tail}`;
}

/**
 * Questions a prospective user actually asks, answered on the page. The same
 * list feeds the visible section and the schema, so they cannot drift apart.
 * The download answer depends on the live release, so it is built per render.
 */
export function buildFaq(
  release: LatestRelease | null,
  locale: Locale = DEFAULT_LOCALE
): FaqItem[] {
  const copy = FACTS[locale].faq;
  return [
    ...copy.items,
    {
      question: copy.downloadQuestion,
      answer: downloadAnswer(release, locale),
    },
  ];
}

export function buildFaqSchema(
  items: FaqItem[],
  locale: Locale = DEFAULT_LOCALE
) {
  if (items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}${homeHref(locale)}#FAQPage`,
    inLanguage: locale,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
