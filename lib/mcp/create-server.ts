import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import packageJson from "@/package.json";
import { DISCOVERY_SURFACES } from "@/lib/discovery/surfaces";
import { FEATURE_BLOG } from "@/lib/features";
import { logError } from "@/lib/logger";
import { docsInventory, source } from "@/lib/source";
import { APP_NAME, SITE_URL } from "@/lib/site";

function textResult(value: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value) }],
  };
}

function toolError(message: string) {
  return {
    content: [
      { type: "text" as const, text: JSON.stringify({ error: message }) },
    ],
    isError: true,
  };
}

function docsSlugs(value: string): string[] | null {
  const rawPath = value
    .trim()
    .split(/[?#]/, 1)[0]
    .replace(/^\/+|\/+$/g, "");
  let segments: string[];

  try {
    segments = rawPath ? rawPath.split("/").map(decodeURIComponent) : [];
  } catch {
    return null;
  }

  if (segments[0] === "docs") segments = segments.slice(1);
  if (
    !segments.every(
      (segment) =>
        segment.length > 0 &&
        segment !== "." &&
        segment !== ".." &&
        !segment.includes("/") &&
        !segment.includes("\\") &&
        !segment.includes("\0"),
    )
  ) {
    return null;
  }

  return segments;
}

function scoreDocs(query: string) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return docsInventory()
    .map((page, index) => {
      const title = page.title.toLowerCase();
      const description = page.description.toLowerCase();
      const url = page.url.toLowerCase();
      const score = terms.reduce(
        (total, term) =>
          total +
          (title.includes(term) ? 3 : 0) +
          (description.includes(term) ? 2 : 0) +
          (url.includes(term) ? 1 : 0),
        0,
      );
      return { page, index, score };
    })
    .filter((result) => result.score > 0)
    .sort(
      (left, right) => right.score - left.score || left.index - right.index,
    )
    .slice(0, 10)
    .map(({ page, score }) => ({
      title: page.title,
      url: `${SITE_URL}${page.url}`,
      description: page.description,
      score,
    }));
}

export async function createMcpServer(): Promise<McpServer> {
  const server = new McpServer({
    name: APP_NAME,
    version: packageJson.version,
  });

  server.registerTool(
    "get_site_discovery",
    {
      description: "Return canonical public surface URLs for this deployment.",
      inputSchema: {},
    },
    async () => textResult(DISCOVERY_SURFACES),
  );

  server.registerTool(
    "search_docs",
    {
      description: "Search documentation titles and descriptions locally.",
      inputSchema: { query: z.string().trim().min(1).max(200) },
    },
    async ({ query }) => textResult(scoreDocs(query)),
  );

  server.registerTool(
    "get_docs_page",
    {
      description:
        "Return a documentation page as Markdown; pass a slug or /docs/ path.",
      inputSchema: { path: z.string().trim().min(1).max(500) },
    },
    async ({ path }) => {
      const slugs = docsSlugs(path);
      const entry =
        slugs &&
        docsInventory().find(
          (page) =>
            page.slugs.length === slugs.length &&
            page.slugs.every((slug, index) => slug === slugs[index]),
        );
      const page = entry && source.getPage(entry.slugs);
      if (!entry || !page) return toolError("Documentation page not found.");

      let markdown: string | null | undefined;
      try {
        markdown = await page.data.getText("processed");
      } catch (error) {
        logError("mcp-get-docs-page", error);
        return toolError("Documentation Markdown is unavailable.");
      }
      if (typeof markdown !== "string") {
        return toolError("Documentation Markdown is unavailable.");
      }

      return textResult({
        title: entry.title,
        url: `${SITE_URL}${entry.url}`,
        markdown,
      });
    },
  );

  if (FEATURE_BLOG) {
    const { getLatestPublishedPosts, searchPublishedPosts } = await import(
      "@/lib/blog"
    );

    server.registerTool(
      "search_blog_posts",
      {
        description: "Search published blog posts by title, body, or category.",
        inputSchema: { query: z.string().trim().min(1).max(200) },
      },
      async ({ query }) => {
        try {
          return textResult(await searchPublishedPosts(query));
        } catch (error) {
          logError("mcp-search-blog-posts", error);
          return toolError("Blog search is temporarily unavailable.");
        }
      },
    );

    server.registerTool(
      "get_latest_posts",
      {
        description: "Return the latest published blog posts.",
        inputSchema: {},
      },
      async () => {
        try {
          return textResult(await getLatestPublishedPosts());
        } catch (error) {
          logError("mcp-latest-blog-posts", error);
          return toolError("Blog posts are temporarily unavailable.");
        }
      },
    );
  }

  return server;
}
