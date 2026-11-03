import { defineConfig, defineDocs } from "fumadocs-mdx/config";

/**
 * The documentation lives beside the marketing page rather than in a second
 * site: Fumadocs compiles it into the same Next build that Netlify already
 * deploys. `content/docs` is the only source directory.
 */
export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    // Exposes the processed Markdown of each page, which the discovery
    // surfaces need: llms-full.txt and the .md twins read the same text a
    // reader gets on the page rather than a second hand-written copy.
    postprocess: { includeProcessedMarkdown: true },
  },
});

export default defineConfig();
