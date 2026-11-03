import type { LatestRelease } from "./app-release";
import type { PublicPost, PublicPostSummary } from "./blog/types";
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

export type FaqItem = { question: string; answer: string };

const ORGANIZATION_ID = `${SITE_URL}/#Organization`;
const WEBSITE_ID = `${SITE_URL}/#WebSite`;
const APP_ID = `${SITE_URL}/#SoftwareApplication`;
const BLOG_ID = `${SITE_URL}/#Blog`;

const BLOG_DESCRIPTION = "Release notes and writing from the Mash project.";

const DESCRIPTION =
  "Mash is one app with Herdr, Ghostty, Starship, Pi, and Fresh already wired together: parallel agents, a review path you control, and code you can still read and edit by hand.";

const FEATURES = [
  "Agent orchestration: a coordinator delegates tasks to worker agents and gathers their results",
  "Pi Voice dictation into an editable message",
  "One workspace per task, each with its own agent",
  "Editor and coding agent in the same tab",
  "Review tabs with the diff beside the agent",
  "Command palette and fuzzy file finder",
  "Session search across agent conversations",
  "A complete toolchain installed on first launch",
  "Runs on macOS and Linux, with a keymap for each",
];

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

function website() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: APP_NAME,
    description: DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

function softwareApplication(release: LatestRelease | null) {
  return {
    "@type": "SoftwareApplication",
    "@id": APP_ID,
    name: APP_NAME,
    url: SITE_URL,
    description: DESCRIPTION,
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Agentic coding environment",
    operatingSystem: ["macOS 14", "Ubuntu 24.04"],
    processorRequirements: "Apple silicon, x86-64, or ARM64",
    // Omitted when the release lookup failed, so no version is claimed.
    ...(release ? { softwareVersion: release.version } : {}),
    isAccessibleForFree: true,
    license: `https://spdx.org/licenses/${LICENSE}.html`,
    featureList: FEATURES,
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

function videoObject() {
  return {
    "@type": "VideoObject",
    "@id": `${SITE_URL}/#hero-film`,
    name: "A tour of Mash",
    description:
      "The Mash command palette, the workspace picker, the file finder, and the review tab, recorded from the app.",
    thumbnailUrl: [`${SITE_URL}${FILM.poster}`],
    uploadDate: FILM.uploadDate,
    duration: FILM.duration,
    contentUrl: `${SITE_URL}${FILM.path}`,
    width: FILM.width,
    height: FILM.height,
    inLanguage: "en",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

function orchestrationVideoObject() {
  return {
    "@type": "VideoObject",
    "@id": `${SITE_URL}/#orchestration-film`,
    name: ORCHESTRATION_FILM.title,
    description: ORCHESTRATION_FILM.description,
    thumbnailUrl: [`${SITE_URL}${ORCHESTRATION_FILM.poster}`],
    uploadDate: ORCHESTRATION_FILM.uploadDate,
    duration: ORCHESTRATION_FILM.duration,
    contentUrl: `${SITE_URL}${ORCHESTRATION_FILM.path}`,
    width: ORCHESTRATION_FILM.width,
    height: ORCHESTRATION_FILM.height,
    inLanguage: "en",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/** Site-wide entity graph. One `<script>` carries every node. */
export function buildSiteGraph(release: LatestRelease | null) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization(),
      website(),
      softwareApplication(release),
      videoObject(),
      orchestrationVideoObject(),
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

const DOWNLOAD_QUESTION = "How do I download it?";

function downloadAnswer(release: LatestRelease | null): string {
  const lead =
    release && Object.keys(release.downloads).length > 0
      ? `Mash ${release.version}${release.publishedAt ? ` was released on ${release.publishedAt}` : " is the latest release"}.`
      : "The latest release is on the Mash releases page.";
  return `${lead} Download the build for your platform from the Mash releases page on GitHub, or use the download button on this page, which offers the right file for the machine you are on. Every release publishes the macOS DMG and both Linux .deb architectures together.`;
}

/**
 * Questions a prospective user actually asks, answered on the page. The same
 * list feeds the visible section and the schema, so they cannot drift apart.
 * The download answer depends on the live release, so it is built per render.
 */
export function buildFaq(release: LatestRelease | null): FaqItem[] {
  return [
    ...FAQ_STATIC,
    { question: DOWNLOAD_QUESTION, answer: downloadAnswer(release) },
  ];
}

const FAQ_STATIC: FaqItem[] = [
  {
    question: "What is Mash?",
    answer:
      "Mash is a single application that bundles a complete agentic coding environment: Herdr for workspaces, tabs, and agents; Ghostty for the terminal; Starship for the shell prompt; Pi for the coding; Fresh for the editing; and the Mash skills that teach the workflow. It arrives already configured rather than asking you to assemble those tools yourself.",
  },
  {
    question: "Is Mash free?",
    answer:
      "Yes. Mash is free and open source under the GPL-3.0-or-later license, with no account, subscription, or in-app purchase. You download one file for your platform, install it, and the first launch sets up the rest.",
  },
  {
    question: "Which systems does Mash run on?",
    answer:
      "Mash runs on macOS 14 or later on Apple silicon, and on Ubuntu 24.04 with GNOME on Wayland or Xorg. macOS ships as one signed and notarized DMG; Linux ships as a .deb for amd64 or arm64, which installs to /opt/letsmash and keeps everything you configure in ~/.mash. There is no Intel Mac build, and no Windows build.",
  },
  {
    question: "Do I still have to install Pi, Herdr, or the skills myself?",
    answer:
      "No. The terminal, the agent, the editor, and the skills ship inside Mash. The first launch sets your Git identity, signs you in to GitHub if you want it, and adds the optional command-line tools and language servers you select. On Linux those go into ~/.mash without asking for a password; on macOS the optional extras are installed with Homebrew. Mash keeps its own state under ~/.mash and leaves your existing configuration files alone.",
  },
  {
    question: "Can I still edit the code by hand?",
    answer:
      "Yes, and Mash is built around that. The agent works in a pane beside the file rather than behind a chat window, so you can open the buffer, make the change yourself, and let the agent continue from what is on disk. Nothing lands without a review step you control.",
  },
];

export function buildFaqSchema(items: FaqItem[]) {
  if (items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#FAQPage`,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
