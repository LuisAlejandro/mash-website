import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Netlify builds this through the Next.js runtime (@netlify/plugin-nextjs),
  // so `next build` output stays in `.next` and there is no static export.
  trailingSlash: true,
};

export default nextConfig;
