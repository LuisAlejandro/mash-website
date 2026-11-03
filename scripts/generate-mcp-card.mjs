import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { LATEST_PROTOCOL_VERSION } from "@modelcontextprotocol/sdk/types.js";

const root = process.cwd();
const packageJson = JSON.parse(
  await readFile(resolve(root, "package.json"), "utf8"),
);
const siteSource = await readFile(resolve(root, "lib/site.ts"), "utf8");
const serverSource = await readFile(
  resolve(root, "lib/mcp/create-server.ts"),
  "utf8",
);
const outputDirectory = resolve(root, "public/.well-known/mcp");

function readStringConstant(source, name) {
  const match = source.match(
    new RegExp(`export const ${name} = "([^"]+)";`),
  );
  if (!match) throw new Error(`Missing string constant ${name}`);
  return match[1];
}

function parseInputSchema(options, toolName) {
  const match = options.match(/inputSchema:\s*\{([\s\S]*?)\}/);
  if (!match) throw new Error(`Missing inputSchema for ${toolName}`);

  const properties = {};
  const required = [];
  const declarations = match[1]
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  for (const declaration of declarations) {
    const field = declaration.match(
      /^([A-Za-z_][\w]*)\s*:\s*z\.string\(\)\.trim\(\)\.min\((\d+)\)\.max\((\d+)\)$/,
    );
    if (!field) {
      throw new Error(
        `Unsupported inputSchema for ${toolName}: ${declaration}`,
      );
    }
    const [, name, minLength, maxLength] = field;
    properties[name] = {
      type: "string",
      minLength: Number(minLength),
      maxLength: Number(maxLength),
    };
    required.push(name);
  }

  return {
    type: "object",
    properties,
    required,
    additionalProperties: false,
  };
}

function readToolRegistrations(source) {
  const toolCall =
    /server\.registerTool\(\s*"([^"]+)"\s*,\s*\{([\s\S]*?)\n\s*\},\s*\n\s*async\b/g;
  const tools = [...source.matchAll(toolCall)].map(([, name, options]) => {
    const description = options.match(
      /description:\s*("[^"]*")/,
    )?.[1];
    if (!description) throw new Error(`Missing description for ${name}`);

    return {
      name,
      title: name
        .split("_")
        .map((word, index) =>
          index === 0 ? word[0].toUpperCase() + word.slice(1) : word,
        )
        .join(" "),
      description: JSON.parse(description),
      inputSchema: parseInputSchema(options, name),
    };
  });
  const registrations = source.match(/server\.registerTool\(/g)?.length ?? 0;
  if (tools.length !== registrations) {
    throw new Error("Unable to parse every MCP tool registration.");
  }
  return tools;
}

const blogStart = serverSource.indexOf("if (FEATURE_BLOG) {");
const blogEnd = serverSource.indexOf("\n  }\n\n  return server;", blogStart);
if (blogStart < 0 || blogEnd < 0) {
  throw new Error("Unable to locate FEATURE_BLOG tool registrations.");
}

const alwaysTools = readToolRegistrations(serverSource.slice(0, blogStart));
const blogTools = readToolRegistrations(
  serverSource.slice(blogStart, blogEnd),
);
const tools = [
  ...alwaysTools,
  ...(process.env.FEATURE_BLOG === "1" ? blogTools : []),
];
if (tools.length === 0) {
  throw new Error("No MCP tools were discovered.");
}

const siteUrl = readStringConstant(siteSource, "SITE_URL");
const appName = readStringConstant(siteSource, "APP_NAME");
const card = {
  $schema:
    "https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json",
  version: "1.0",
  protocolVersion: LATEST_PROTOCOL_VERSION,
  serverInfo: {
    name: packageJson.name,
    title: appName,
    version: packageJson.version,
  },
  description: "Read-only; no authentication or transactional tools.",
  documentationUrl: `${siteUrl}/agents.md`,
  transport: {
    type: "streamable-http",
    endpoint: `${siteUrl}/api/mcp`,
  },
  capabilities: { tools: {} },
  authentication: { required: false, schemes: [] },
  tools,
};

await mkdir(outputDirectory, { recursive: true });
await writeFile(
  resolve(outputDirectory, "server-card.json"),
  `${JSON.stringify(card, null, 2)}\n`,
  "utf8",
);
