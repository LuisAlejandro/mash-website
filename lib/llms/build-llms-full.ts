import { FEATURE_BLOG } from "@/lib/features";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";
import { logError } from "@/lib/logger";
import { source } from "@/lib/source";
import { SITE_URL } from "@/lib/site";

/**
 * The whole documentation corpus as one document, in one language.
 *
 * The pages come from the locale-aware loader, so a Spanish corpus can only
 * contain Spanish pages. The blog is English-only, so it joins the English
 * corpus and nothing else.
 */
export async function buildLlmsFull(
  locale: Locale = DEFAULT_LOCALE
): Promise<string> {
  // `getText("processed")` is async; the whole corpus is awaited in parallel
  // so a page never renders as `[object Promise]`.
  const docsCorpus = (
    await Promise.all(
      source
        .getPages(locale)
        .map(async (page) =>
          [
            `# ${page.data.title}`,
            `${locale === "es" ? "URL canónica" : "Canonical URL"}: ${SITE_URL}${page.url}`,
            await page.data.getText("processed"),
          ].join("\n\n")
        )
    )
  ).join("\n\n");
  let postsCorpus = "";

  if (FEATURE_BLOG && locale === DEFAULT_LOCALE) {
    try {
      const { getPublishedPostBySlug, listPublishedPosts } =
        await import("@/lib/blog");
      const summaries = await listPublishedPosts();
      // ponytail: N+1 post reads; add batch accessor if volume grows.
      const posts = await Promise.all(
        summaries.map(({ slug }) => getPublishedPostBySlug(slug))
      );
      postsCorpus = posts
        .filter((post) => post !== null)
        .map(
          (post) =>
            `# ${post.title}\n\nCanonical URL: ${SITE_URL}/blog/posts/${post.slug}\nPublication date: ${post.createdAt}\n\n${post.body}`
        )
        .join("\n\n");
    } catch (error) {
      logError("build-llms-full-blog", error);
    }
  }

  const heading =
    locale === "es"
      ? `# Mash — Documentación completa\n\nSitio canónico: ${SITE_URL}/es/`
      : `# Mash — Full Documentation\n\nCanonical site: ${SITE_URL}/`;

  return [heading, docsCorpus, postsCorpus].filter(Boolean).join("\n\n");
}
