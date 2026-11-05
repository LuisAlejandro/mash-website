import type { MetadataRoute } from "next";
import { listPublishedPosts } from "@/lib/blog";
import { FEATURE_BLOG } from "@/lib/features";
import { logError } from "@/lib/logger";
import { CAPTURES, FILM, ORCHESTRATION_FILM, SITE_URL } from "@/lib/site";
import { counterpartHref, languageAlternates } from "@/lib/i18n/locale";
import { source } from "@/lib/source";

export const dynamic = "force-static";

/**
 * A docs page's modification time, when the checkout can answer for it.
 *
 * Fumadocs resolves the value from Git history, so a shallow clone, a fresh
 * checkout or an uncommitted file has none. A sitemap date is a claim, and
 * guessing it from the build clock would tell crawlers every page changed on
 * deploy, so the field is dropped rather than filled in.
 */
function gitLastModified(data: object): Date | undefined {
  const value = "lastModified" in data ? data.lastModified : undefined;

  return value instanceof Date && !Number.isNaN(value.getTime())
    ? value
    : undefined;
}

/**
 * Blog entries, or nothing when the blog is off.
 *
 * A database that is unreachable at build time costs the blog its sitemap
 * entries; it does not fail the build and drop the 30-odd pages that do not
 * depend on it. Publishing revalidates /sitemap.xml, so entries appear as
 * soon as the next render succeeds.
 */
async function blogEntries(): Promise<MetadataRoute.Sitemap> {
  if (!FEATURE_BLOG) {
    return [];
  }

  try {
    const posts = await listPublishedPosts();
    const categories = new Set(
      posts
        .map((post) => post.category)
        .filter((category): category is string => Boolean(category))
    );

    return [
      {
        url: `${SITE_URL}/blog`,
        lastModified: posts[0] ? new Date(posts[0].updatedAt) : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      ...posts.map((post) => ({
        url: `${SITE_URL}/blog/posts/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...[...categories].map((category) => ({
        url: `${SITE_URL}/blog/category/${encodeURIComponent(category)}`,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
    ];
  } catch (error) {
    logError("sitemap-blog-entries", error);
    return [];
  }
}

/**
 * Next emits the image and video namespaces only for the elements it is given,
 * so this sitemap declares nothing it does not also populate.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const homeAlternates = {
    languages: languageAlternates({
      en: `${SITE_URL}/`,
      es: `${SITE_URL}/es/`,
    }),
  };
  const videoEntries = [
    {
      title: "A tour of Mash",
      thumbnail_loc: `${SITE_URL}${FILM.poster}`,
      description:
        "The Mash command palette, workspace picker, file finder, and review tab, recorded from the app.",
      content_loc: `${SITE_URL}${FILM.path}`,
      duration: 26,
      publication_date: FILM.uploadDate,
      family_friendly: "yes" as const,
      live: "no" as const,
      tag: "agentic coding, macOS, Linux, developer tools",
    },
    {
      title: ORCHESTRATION_FILM.title,
      thumbnail_loc: `${SITE_URL}${ORCHESTRATION_FILM.poster}`,
      description: ORCHESTRATION_FILM.description,
      content_loc: `${SITE_URL}${ORCHESTRATION_FILM.path}`,
      duration: ORCHESTRATION_FILM.seconds,
      publication_date: ORCHESTRATION_FILM.uploadDate,
      family_friendly: "yes" as const,
      live: "no" as const,
      tag: "agent orchestration, agentic coding, developer tools",
    },
  ];

  return [
    // The marketing entries below carry no `lastModified`. None of them has a
    // content-derived modification time, and the build clock is not one: an
    // absent date is truthful, a fixed or generated one is not.
    {
      url: `${SITE_URL}/`,
      changeFrequency: "weekly",
      priority: 1,
      alternates: homeAlternates,
      images: CAPTURES.map((capture) => `${SITE_URL}${capture.path}`),
      videos: videoEntries,
    },
    {
      url: `${SITE_URL}/es/`,
      changeFrequency: "weekly",
      priority: 1,
      alternates: homeAlternates,
    },
    {
      url: `${SITE_URL}/index.md`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/llms.txt`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/es/llms.txt`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    ...source.getPages().map((page) => {
      const lastModified = gitLastModified(page.data);
      const locale = page.locale ?? "en";
      const en = locale === "en" ? page.url : counterpartHref(page.url, "es");
      const es = locale === "es" ? page.url : counterpartHref(page.url, "en");

      return {
        url: `${SITE_URL}${page.url}/`,
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: "monthly" as const,
        priority: page.url === "/docs/" ? 0.9 : 0.7,
        alternates: {
          languages: languageAlternates({
            en: `${SITE_URL}${en}/`,
            es: `${SITE_URL}${es}/`,
          }),
        },
      };
    }),
    ...(await blogEntries()),
  ];
}
