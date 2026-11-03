import { listPublishedPosts } from "@/lib/blog";
import { FEATURE_BLOG } from "@/lib/features";
import { logError } from "@/lib/logger";
import { resolveMarkdownTwin } from "@/lib/markdown/resolve-twin";
import { TWIN_HEADERS } from "@/lib/markdown/twin-headers";
import { docsInventory } from "@/lib/source";

/**
 * The pages whose Markdown twin is known at build time: the homepage and every
 * docs page, in sidebar order. Blog posts join the list when the blog is on and
 * the database answers; a build without either still serves them, rendered on
 * request instead.
 */
export async function generateStaticParams() {
  const paths: Array<{ path: string[] }> = [
    { path: [] },
    ...docsInventory().map((entry) => ({ path: ["docs", ...entry.slugs] })),
  ];

  if (FEATURE_BLOG) {
    try {
      const posts = await listPublishedPosts();
      paths.push(
        ...posts.map((post) => ({ path: ["blog", "posts", post.slug] }))
      );
    } catch (error) {
      logError("markdown-twin-static-params", error);
    }
  }

  return paths;
}

/**
 * One route for every Markdown twin.
 *
 * Deliberately not `force-static`: a published post changes without a rebuild,
 * so unlisted paths render on request and the cache header bounds how long a
 * stale twin can be served. A path this site does not publish as Markdown is a
 * 404 rather than an empty document, so a client can tell a missing twin from a
 * short one.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/markdown-twin/[[...path]]">
) {
  const { path } = await params;
  const twin = await resolveMarkdownTwin(path ?? []);

  if (!twin) {
    return new Response("Not found\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(twin.markdown, { headers: TWIN_HEADERS });
}
