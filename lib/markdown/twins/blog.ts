import {
  getPublishedPostBySlug,
  listPublishedPostsByCategory,
} from "@/lib/blog";
import { FEATURE_BLOG } from "@/lib/features";
import type { MarkdownTwin } from "@/lib/markdown/types";

/**
 * One public blog page as a Markdown document.
 *
 * Only published content resolves: a post slug that is unknown or still a
 * draft, and a category with no published posts, are `null`. With the blog off
 * nothing resolves at all, so a deployment without a database cannot serve a
 * post through this surface.
 */
export async function blogTwin(
  segments: string[]
): Promise<MarkdownTwin | null> {
  if (!FEATURE_BLOG) return null;

  const [section, slug, ...rest] = segments;
  if (rest.length > 0 || !section || !slug) return null;

  if (section === "posts") {
    const post = await getPublishedPostBySlug(slug);
    if (!post) return null;

    return {
      title: post.title,
      url: `/blog/posts/${post.slug}`,
      markdown: `# ${post.title}\n\n${post.body.trim()}\n`,
    };
  }

  if (section === "category") {
    const category = decodeSegment(slug);
    if (!category) return null;

    const posts = await listPublishedPostsByCategory(category);
    if (posts.length === 0) return null;

    const list = posts
      .map(
        (post) =>
          `- [${post.title}](/blog/posts/${post.slug}) — ${post.excerpt}`
      )
      .join("\n");

    return {
      title: category,
      url: `/blog/category/${encodeURIComponent(category)}`,
      markdown: `# ${category}

Published posts in ${category}.

${list}
`,
    };
  }

  return null;
}

/** The category page decodes its segment, so the twin resolves the same way. */
function decodeSegment(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
