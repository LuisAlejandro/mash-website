export type McpToolDefinition = {
  name: string;
  title: string;
  description: string;
  feature?: "blog";
  inputSchema: {
    type: "object";
    properties: Record<
      string,
      { type: "string"; minLength: number; maxLength: number }
    >;
    required: string[];
    additionalProperties: false;
  };
};

export const MCP_TOOL_REGISTRY = {
  get_site_discovery: {
    name: "get_site_discovery",
    title: "Get site discovery",
    description: "Return canonical public surface URLs for this deployment.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false,
    },
  },
  search_docs: {
    name: "search_docs",
    title: "Search docs",
    description: "Search documentation titles and descriptions locally.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", minLength: 1, maxLength: 200 },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  get_docs_page: {
    name: "get_docs_page",
    title: "Get docs page",
    description:
      "Return a documentation page as Markdown; pass a slug or /docs/ path.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", minLength: 1, maxLength: 500 },
      },
      required: ["path"],
      additionalProperties: false,
    },
  },
  search_blog_posts: {
    name: "search_blog_posts",
    title: "Search blog posts",
    description: "Search published blog posts by title, body, or category.",
    feature: "blog",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", minLength: 1, maxLength: 200 },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  get_latest_posts: {
    name: "get_latest_posts",
    title: "Get latest posts",
    description: "Return the latest published blog posts.",
    feature: "blog",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false,
    },
  },
} as const satisfies Record<string, McpToolDefinition>;

export type McpToolName = keyof typeof MCP_TOOL_REGISTRY;
