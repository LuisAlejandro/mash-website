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
    return [
      {
        source: "/:path*",
        headers: [{ key: "Link", value: discoveryLink }],
      },
      { source: "/", headers: varyAccept },
      { source: "/docs/:path*", headers: varyAccept },
      { source: "/blog/posts/:path*", headers: varyAccept },
      { source: "/blog/category/:path*", headers: varyAccept },
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
