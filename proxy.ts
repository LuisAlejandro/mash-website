import { NextResponse, type NextRequest } from "next/server";
import { acceptPrefersMarkdown } from "@/lib/markdown/accept-negotiation";
import { resolveMarkdownTwin } from "@/lib/markdown/resolve-twin";
import { NEGOTIATED_TWIN_REQUEST_HEADER } from "@/lib/markdown/twin-headers";

export async function proxy(request: NextRequest) {
  if (
    (request.method !== "GET" && request.method !== "HEAD") ||
    !acceptPrefersMarkdown(request.headers.get("accept"))
  ) {
    return NextResponse.next();
  }

  const rawSegments = request.nextUrl.pathname.split("/").slice(1);
  if (rawSegments[rawSegments.length - 1] === "") rawSegments.pop();
  if (rawSegments.some((segment) => segment === "")) {
    return NextResponse.next();
  }

  let segments: string[];
  try {
    segments = rawSegments.map(decodeURIComponent);
  } catch {
    return NextResponse.next();
  }

  const first = segments[0]?.toLowerCase();
  if (
    first === "_next" ||
    first === "api" ||
    first === ".well-known" ||
    first === "admin" ||
    segments.some((segment) => segment.toLowerCase().endsWith(".md"))
  ) {
    return NextResponse.next();
  }

  // Reuse the twin resolver for both safe-path validation and mapping checks.
  try {
    if (!(await resolveMarkdownTwin(segments))) return NextResponse.next();
  } catch {
    return NextResponse.next();
  }

  const destination = request.nextUrl.clone();
  destination.pathname = segments.length
    ? `/markdown-twin/${segments.map(encodeURIComponent).join("/")}`
    : "/markdown-twin";
  const headers = new Headers(request.headers);
  headers.set(NEGOTIATED_TWIN_REQUEST_HEADER, "1");

  return NextResponse.rewrite(destination, { request: { headers } });
}

export const config = {
  matcher: ["/", "/docs/:path*", "/blog/:path*"],
};
