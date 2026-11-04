import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

import { clientIp } from "@/lib/client-ip";
import { createMcpServer } from "@/lib/mcp/create-server";
import { checkRateLimit } from "@/lib/mcp/rate-limit";
import { logError } from "@/lib/logger";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ORIGINS = new Set([
  new URL(SITE_URL).origin,
  "http://localhost",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

function responseHeaders(origin: string | null): Headers {
  const headers = new Headers({ "Cache-Control": "no-store" });
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    headers.set(
      "Access-Control-Allow-Headers",
      "Accept, Content-Type, Last-Event-ID, MCP-Protocol-Version, MCP-Session-Id"
    );
    headers.set(
      "Access-Control-Expose-Headers",
      "MCP-Protocol-Version, MCP-Session-Id"
    );
    headers.append("Vary", "Origin");
  }
  return headers;
}

function errorResponse(
  status: number,
  error: string,
  origin: string | null,
  retryAfter?: number
): Response {
  const headers = responseHeaders(origin);
  if (retryAfter) headers.set("Retry-After", String(retryAfter));
  return Response.json({ error }, { status, headers });
}

function checkRequest(request: Request): Response | null {
  const origin = request.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return errorResponse(403, "Origin not allowed", null);
  }

  const limit = checkRateLimit(clientIp(request));
  if (!limit.allowed) {
    return errorResponse(
      429,
      "Rate limit exceeded",
      origin,
      limit.retryAfterSeconds
    );
  }

  return null;
}

function withResponseHeaders(
  response: Response,
  origin: string | null
): Response {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  for (const [name, value] of responseHeaders(origin)) {
    if (name === "vary") {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function handleMcpRequest(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  const rejected = checkRequest(request);
  if (rejected) return rejected;

  try {
    const server = await createMcpServer();
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    await server.connect(transport);
    return withResponseHeaders(await transport.handleRequest(request), origin);
  } catch (error) {
    logError("mcp-endpoint", error);
    return errorResponse(500, "MCP request failed", origin);
  }
}

export async function GET(request: Request) {
  return handleMcpRequest(request);
}

export async function POST(request: Request) {
  return handleMcpRequest(request);
}

export async function DELETE(request: Request) {
  return handleMcpRequest(request);
}

export function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  const rejected = checkRequest(request);
  if (rejected) return rejected;
  return new Response(null, { status: 204, headers: responseHeaders(origin) });
}
