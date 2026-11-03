import { FEATURE_BLOG } from "@/lib/features";
import { APP_NAME, SITE_URL } from "@/lib/site";
import { docsInventory } from "@/lib/source";

export type DiscoverySurface = {
  href: string;
  title: string;
  type: string;
};

export const DISCOVERY_SURFACES: DiscoverySurface[] = [
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
  ...docsInventory().map((page) => ({
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
