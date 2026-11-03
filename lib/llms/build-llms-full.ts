import { FEATURE_BLOG } from "@/lib/features";
import { logError } from "@/lib/logger";
import { source } from "@/lib/source";
import { SITE_URL } from "@/lib/site";

export async function buildLlmsFull(): Promise<string> {
  // `getText("processed")` is async; the whole corpus is awaited in parallel
  // so a page never renders as `[object Promise]`.
  const docsCorpus = (
    await Promise.all(
      source.getPages().map(async (page) =>
        [
          `# ${page.data.title}`,
          `Canonical URL: ${SITE_URL}${page.url}`,
          await page.data.getText("processed"),
        ].join("\n\n"),
      ),
    )
  ).join("\n\n");
  let postsCorpus = "";

  if (FEATURE_BLOG) {
    try {
      const { getPublishedPostBySlug, listPublishedPosts } = await import(
        "@/lib/blog"
      );
      const summaries = await listPublishedPosts();
      // ponytail: N+1 post reads; add batch accessor if volume grows.
      const posts = await Promise.all(
        summaries.map(({ slug }) => getPublishedPostBySlug(slug)),
      );
      postsCorpus = posts
        .filter((post) => post !== null)
        .map(
          (post) =>
            `# ${post.title}\n\nCanonical URL: ${SITE_URL}/blog/posts/${post.slug}\nPublication date: ${post.createdAt}\n\n${post.body}`,
        )
        .join("\n\n");
    } catch (error) {
      logError("build-llms-full-blog", error);
    }
  }

  return [
    `# Mash — Full Documentation\n\nCanonical site: ${SITE_URL}/`,
    docsCorpus,
    postsCorpus,
  ]
    .filter(Boolean)
    .join("\n\n");
}
