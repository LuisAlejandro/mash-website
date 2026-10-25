import {
  APP_NAME,
  DOWNLOAD_URL,
  FILM,
  LICENSE,
  RELEASES_URL,
  REPO_URL,
  SITE_URL,
} from "./site";

export type FaqItem = { question: string; answer: string };

const ORGANIZATION_ID = `${SITE_URL}/#Organization`;
const WEBSITE_ID = `${SITE_URL}/#WebSite`;
const APP_ID = `${SITE_URL}/#SoftwareApplication`;

const DESCRIPTION =
  "Mash is one app with Herdr, Ghostty, Pi, and Fresh already wired together: parallel agents, a review path you control, and code you can still read and edit by hand.";

const FEATURES = [
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

function softwareApplication() {
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
    softwareVersion: "0.1.0",
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
      // point crawlers at a 404; it appears once `DOWNLOAD_URL` is set.
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

/** Site-wide entity graph. One `<script>` carries every node. */
export function buildSiteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [organization(), website(), softwareApplication(), videoObject()],
  };
}

/**
 * Serialize JSON-LD for an inline `<script>`. Escaping `<` keeps a stray
 * `</script>` inside any copy from closing the tag early.
 */
export function toJsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Questions a prospective user actually asks, answered on the page. The same
 * array feeds the visible section and the schema, so they cannot drift apart.
 */
export const FAQ: FaqItem[] = [
  {
    question: "What is Mash?",
    answer:
      "Mash is a single application that bundles a complete agentic coding environment: Herdr for workspaces, tabs, and agents; Ghostty for the terminal; Pi for the coding; Fresh for the editing; and the Mash skills that teach the workflow. It arrives already configured rather than asking you to assemble those tools yourself.",
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
  {
    question: "When can I download it?",
    answer:
      "There is no public release yet. The first build will be published on the Mash repository with its release notes, and this page offers the download as soon as a build for your platform exists. Every release publishes macOS and both Linux architectures together, so a release is never missing a platform.",
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
