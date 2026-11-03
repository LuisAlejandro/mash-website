import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

/**
 * The components every docs page can use. Fumadocs supplies the defaults; a
 * page may pass its own on top, which is how relative links resolve.
 */
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...components,
  } satisfies MDXComponents;
}
