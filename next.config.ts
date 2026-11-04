import type { NextConfig } from "next";
// The build-time wrapper is a separate entry point from the runtime SDK: the
// main `@sentry/nextjs` export resolves to the server bundle, which has no
// `withSentryConfig`.
import { withSentryConfig } from "@sentry/nextjs/config";
import { createMDX } from "fumadocs-mdx/next";

/**
 * Both blog flags or neither.
 *
 * `FEATURE_BLOG` gates routes and server module loading; `NEXT_PUBLIC_FEATURE_BLOG`
 * is inlined into the client bundle and drives navigation. Setting one alone
 * produces a site whose nav links to pages that 404, which is invisible in a
 * green build. Next loads `.env` before this file, so these are the real values.
 */
function assertFeatureFlags(): void {
  const names = ["FEATURE_BLOG", "NEXT_PUBLIC_FEATURE_BLOG"] as const;

  for (const name of names) {
    const raw = process.env[name];
    if (raw !== undefined && raw !== "" && raw !== "0" && raw !== "1") {
      throw new Error(
        `${name} must be "0" or "1", but it is "${raw}". The flags are compared to "1", so any other value silently reads as off.`
      );
    }
  }

  const enabled = names.map((name) => process.env[name] === "1");
  if (enabled[0] === enabled[1]) return;

  throw new Error(
    `FEATURE_BLOG and NEXT_PUBLIC_FEATURE_BLOG disagree ` +
      `(${process.env.FEATURE_BLOG ?? "unset"} vs ${process.env.NEXT_PUBLIC_FEATURE_BLOG ?? "unset"}). ` +
      "Set both to 1 to publish the blog, or both to 0 to leave it off: " +
      "the server flag gates routes and module loading, the public mirror drives " +
      "navigation, and one without the other links visitors to pages that 404."
  );
}

assertFeatureFlags();

const nextConfig: NextConfig = {
  // Netlify builds this through the Next.js runtime (@netlify/plugin-nextjs),
  // so `next build` output stays in `.next` and there is no static export.
  // Docs and marketing pages share that one build; `/docs` is a route in this
  // app, not a second site.
  trailingSlash: true,
  outputFileTracingIncludes: {
    "/*": ["./content/llms/**/*"],
  },
  async headers() {
    const varyAccept = [{ key: "Vary", value: "Accept" }];
    const discoveryLink =
      '</llms.txt>; rel="describedby"; type="text/plain", </.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"';
    // Cache tags have to ride on the response itself. A `[[headers]]` rule in
    // netlify.toml only reaches static files on this host, so a tag declared
    // there would be attached to nothing and a purge of it would succeed
    // silently while the CDN kept serving the old page.
    return [
      {
        source: "/:path*",
        headers: [{ key: "Link", value: discoveryLink }],
      },
      { source: "/", headers: varyAccept },
      { source: "/docs/:path*", headers: varyAccept },
      {
        source: "/blog",
        headers: [
          { key: "Netlify-Cache-Tag", value: "blog-index, blog-listings" },
        ],
      },
      {
        source: "/blog/posts/:path*",
        headers: [
          ...varyAccept,
          { key: "Netlify-Cache-Tag", value: "blog-posts" },
        ],
      },
      {
        source: "/blog/category/:path*",
        headers: [
          ...varyAccept,
          { key: "Netlify-Cache-Tag", value: "blog-listings" },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [{ key: "Netlify-Cache-Tag", value: "sitemap" }],
      },
      // The full documentation corpus carries every published post body, so it
      // takes a tag of its own rather than riding on a blog one.
      {
        source: "/llms-full.txt",
        headers: [{ key: "Netlify-Cache-Tag", value: "llms-full" }],
      },
    ];
  },
  // Markdown twins. The rule sits in `afterFiles`, which Next tries after the
  // filesystem, so the real `/index.md` route keeps winning and only paths with
  // no route of their own reach the twin handler.
  async rewrites() {
    return {
      afterFiles: [
        {
          source: "/:path((?!(?:_next|api|\\.well-known)).*)\\.md",
          destination: "/markdown-twin/:path",
        },
      ],
    };
  },
};

const withMDX = createMDX();

// Source-map upload and release creation only run when a token is present;
// without one the wrapper is a no-op and a local or offline build still works.
// `/monitoring` is the tunnel route, and `proxy.ts` does not match it, so Sentry
// events are not rewritten into a Markdown twin.
export default withSentryConfig(withMDX(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.SENTRY_AUTH_TOKEN,
  tunnelRoute: "/monitoring",
  widenClientFileUpload: false,
  suppressOnRouterTransitionStartWarning: true,
});
