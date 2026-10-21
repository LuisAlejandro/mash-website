import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site is one prerendered route, so it ships as plain files. Netlify
  // publishes `out/`; no server runtime or Next adapter is involved.
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
