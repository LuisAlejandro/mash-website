import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const nextConfig: NextConfig = {
  // Netlify builds this through the Next.js runtime (@netlify/plugin-nextjs),
  // so `next build` output stays in `.next` and there is no static export.
  // Docs and marketing pages share that one build; `/docs` is a route in this
  // app, not a second site.
  trailingSlash: true,
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

export default withMDX(nextConfig);
