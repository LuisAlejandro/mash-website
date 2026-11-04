import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import packageJson from "@/package.json";
import { DISCOVERY_SURFACES } from "@/lib/discovery/surfaces";
import { FEATURE_BLOG } from "@/lib/features";
import { logError } from "@/lib/logger";
import { isSafePathSegment } from "@/lib/markdown/path-safety";
import { MCP_TOOL_REGISTRY, type McpToolName } from "@/lib/mcp/tool-registry";
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

type ToolResult = ReturnType<typeof textResult> | ReturnType<typeof toolError>;

function registerTool(
  server: McpServer,
  name: McpToolName,
  handler: (input: Record<string, string>) => Promise<ToolResult>
) {
  const definition = MCP_TOOL_REGISTRY[name];
  const inputSchema = Object.fromEntries(
    Object.entries(definition.inputSchema.properties).map(([key, field]) => [
      key,
      z.string().trim().min(field.minLength).max(field.maxLength),
    ])
  );

  server.registerTool(
    definition.name,
    { description: definition.description, inputSchema },
    handler
  );
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
  if (!segments.every(isSafePathSegment)) {
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
        0
      );
      return { page, index, score };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
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

  registerTool(server, "get_site_discovery", async () =>
    textResult(DISCOVERY_SURFACES)
  );

  registerTool(server, "search_docs", async ({ query }) =>
    textResult(scoreDocs(query))
  );

  registerTool(server, "get_docs_page", async ({ path }) => {
    const slugs = docsSlugs(path);
    const entry =
      slugs &&
      docsInventory().find(
        (page) =>
          page.slugs.length === slugs.length &&
          page.slugs.every((slug, index) => slug === slugs[index])
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
  });

  if (FEATURE_BLOG) {
    const { getLatestPublishedPosts, searchPublishedPosts } =
      await import("@/lib/blog");

    registerTool(server, "search_blog_posts", async ({ query }) => {
      try {
        return textResult(await searchPublishedPosts(query));
      } catch (error) {
        logError("mcp-search-blog-posts", error);
        return toolError("Blog search is temporarily unavailable.");
      }
    });

    registerTool(server, "get_latest_posts", async () => {
      try {
        return textResult(await getLatestPublishedPosts());
      } catch (error) {
        logError("mcp-latest-blog-posts", error);
        return toolError("Blog posts are temporarily unavailable.");
      }
    });
  }

  return server;
}
