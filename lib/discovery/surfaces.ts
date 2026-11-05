import { FEATURE_BLOG } from "@/lib/features";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";
import { APP_NAME, SITE_URL } from "@/lib/site";
import { docsInventory } from "@/lib/source";

type DiscoverySurface = {
  href: string;
  title: string;
  type: string;
};

function englishSurfaces(): DiscoverySurface[] {
  return [
    {
      href: `${SITE_URL}/llms.txt`,
      title: `${APP_NAME} assistant index`,
      type: "text/plain",
    },
    {
      href: `${SITE_URL}/llms-full.txt`,
      title: `${APP_NAME} full documentation corpus`,
      type: "text/markdown",
    },
    {
      href: `${SITE_URL}/index.md`,
      title: `${APP_NAME} homepage in Markdown`,
      type: "text/markdown",
    },
    {
      href: `${SITE_URL}/ai.txt`,
      title: `${APP_NAME} AI access policy`,
      type: "text/plain",
    },
    {
      href: `${SITE_URL}/.well-known/agent-skills/index.json`,
      title: `${APP_NAME} agent skills index`,
      type: "application/json",
    },
    {
      href: `${SITE_URL}/robots.txt`,
      title: "Robots policy",
      type: "text/plain",
    },
    {
      href: `${SITE_URL}/sitemap.xml`,
      title: "XML sitemap",
      type: "application/xml",
    },
    {
      href: `${SITE_URL}/api/search`,
      title: "Documentation search index",
      type: "application/json",
    },
    {
      href: `${SITE_URL}/api/mcp`,
      title: `${APP_NAME} MCP endpoint (read-only)`,
      type: "application/json",
    },
    {
      href: `${SITE_URL}/.well-known/mcp/server-card.json`,
      title: `${APP_NAME} MCP server card`,
      type: "application/json",
    },
    {
      href: `${SITE_URL}/`,
      title: `${APP_NAME} homepage (Markdown via Accept negotiation)`,
      type: "text/markdown",
    },
    ...docsInventory(DEFAULT_LOCALE).map((page) => ({
      href: `${SITE_URL}${page.url.replace(/\/$/, "")}.md`,
      title: `${page.title} (Markdown)`,
      type: "text/markdown",
    })),
    ...(FEATURE_BLOG
      ? [
          {
            href: `${SITE_URL}/blog/posts/feed.xml`,
            title: "Blog RSS feed",
            type: "application/rss+xml",
          },
          {
            href: `${SITE_URL}/blog/posts/atom.xml`,
            title: "Blog Atom feed",
            type: "application/atom+xml",
          },
          {
            href: `${SITE_URL}/blog/posts/feed.json`,
            title: "Blog JSON Feed",
            type: "application/feed+json",
          },
          {
            href: `${SITE_URL}/api/last-posts`,
            title: "Latest blog posts API",
            type: "application/json",
          },
          {
            href: `${SITE_URL}/api/search-posts`,
            title: "Blog search API",
            type: "application/json",
          },
          {
            href: `${SITE_URL}/api/trending-posts`,
            title: "Recently updated blog posts API",
            type: "application/json",
          },
        ]
      : []),
  ];
}

/**
 * Every assistant- and agent-facing surface, in one language.
 *
 * A caller that asks for Spanish gets the Spanish documents and Spanish docs
 * twins only: the catalog is how an agent picks a starting URL, so a mixed set
 * would send it into the wrong language. The shared infrastructure entries —
 * sitemap, robots, search index, MCP — are language-neutral and appear in both.
 */
export function discoverySurfaces(
  locale: Locale = DEFAULT_LOCALE
): DiscoverySurface[] {
  if (locale === DEFAULT_LOCALE) return englishSurfaces();

  const prefix = `${SITE_URL}/${locale}`;

  return [
    {
      href: `${prefix}/llms.txt`,
      title: `${APP_NAME} assistant index (${locale})`,
      type: "text/plain",
    },
    {
      href: `${prefix}/llms-full.txt`,
      title: `${APP_NAME} full documentation corpus (${locale})`,
      type: "text/markdown",
    },
    {
      href: `${prefix}/index.md`,
      title: `${APP_NAME} homepage in Markdown (${locale})`,
      type: "text/markdown",
    },
    {
      href: `${prefix}/ai.txt`,
      title: `${APP_NAME} AI access policy (${locale})`,
      type: "text/plain",
    },
    {
      href: `${prefix}/agents.md`,
      title: `${APP_NAME} agent discovery guide (${locale})`,
      type: "text/markdown",
    },
    {
      href: `${SITE_URL}/.well-known/agent-skills/index.json`,
      title: `${APP_NAME} agent skills index`,
      type: "application/json",
    },
    {
      href: `${SITE_URL}/robots.txt`,
      title: "Robots policy",
      type: "text/plain",
    },
    {
      href: `${SITE_URL}/sitemap.xml`,
      title: "XML sitemap",
      type: "application/xml",
    },
    {
      href: `${SITE_URL}/api/search`,
      title: "Documentation search index",
      type: "application/json",
    },
    {
      href: `${SITE_URL}/api/mcp`,
      title: `${APP_NAME} MCP endpoint (read-only)`,
      type: "application/json",
    },
    {
      href: `${SITE_URL}/.well-known/mcp/server-card.json`,
      title: `${APP_NAME} MCP server card`,
      type: "application/json",
    },
    {
      href: `${prefix}/`,
      title: `${APP_NAME} homepage (Markdown via Accept negotiation)`,
      type: "text/markdown",
    },
    ...docsInventory(locale).map((page) => ({
      href: `${SITE_URL}${page.url.replace(/\/$/, "")}.md`,
      title: `${page.title} (Markdown)`,
      type: "text/markdown",
    })),
  ];
}

/** The catalog for a default, English request. */
export const DISCOVERY_SURFACES: DiscoverySurface[] = englishSurfaces();
