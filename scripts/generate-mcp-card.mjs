import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { LATEST_PROTOCOL_VERSION } from "@modelcontextprotocol/sdk/types.js";
import { MCP_TOOL_REGISTRY } from "../lib/mcp/tool-registry.ts";
import { APP_NAME, SITE_URL } from "../lib/site.ts";

const root = process.cwd();
const packageJson = JSON.parse(
  await readFile(resolve(root, "package.json"), "utf8")
);
const outputDirectory = resolve(root, "public/.well-known/mcp");

const tools = Object.values(MCP_TOOL_REGISTRY)
  .filter((tool) => !tool.feature || process.env.FEATURE_BLOG === "1")
  .map(({ name, title, description, inputSchema }) => ({
    name,
    title,
    description,
    inputSchema,
  }));

const card = {
  $schema:
    "https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json",
  version: "1.0",
  protocolVersion: LATEST_PROTOCOL_VERSION,
  serverInfo: {
    name: packageJson.name,
    title: APP_NAME,
    version: packageJson.version,
  },
  description: "Read-only; no authentication or transactional tools.",
  documentationUrl: `${SITE_URL}/agents.md`,
  transport: {
    type: "streamable-http",
    endpoint: `${SITE_URL}/api/mcp`,
  },
  capabilities: { tools: {} },
  authentication: { required: false, schemes: [] },
  tools,
};

await mkdir(outputDirectory, { recursive: true });
await writeFile(
  resolve(outputDirectory, "server-card.json"),
  `${JSON.stringify(card, null, 2)}\n`,
  "utf8"
);
