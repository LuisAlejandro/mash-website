import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const nextConfig: NextConfig = {
  // Netlify builds this through the Next.js runtime (@netlify/plugin-nextjs),
  // so `next build` output stays in `.next` and there is no static export.
  // Docs and marketing pages share that one build; `/docs` is a route in this
  // app, not a second site.
  trailingSlash: true,
};

const withMDX = createMDX();

export default withMDX(nextConfig);
