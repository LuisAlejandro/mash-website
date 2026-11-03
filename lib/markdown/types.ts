/**
 * One page as a Markdown document: what a `.md` URL serves.
 *
 * Declared here rather than beside the resolver because every twin builder
 * needs the type while the resolver imports every builder — keeping it in the
 * resolver would make that a cycle.
 */
export type MarkdownTwin = {
  title: string;
  /** Canonical URL of the HTML page this document mirrors. */
  url: string;
  markdown: string;
};
