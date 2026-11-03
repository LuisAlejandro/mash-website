import { defineConfig, defineDocs } from "fumadocs-mdx/config";

/**
 * The documentation lives beside the marketing page rather than in a second
 * site: Fumadocs compiles it into the same Next build that Netlify already
 * deploys. `content/docs` is the only source directory.
 */
export const docs = defineDocs({
  dir: "content/docs",
});

export default defineConfig();
