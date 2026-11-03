import { revalidatePath } from "next/cache";

import { purgeByTags as purgeCloudflareByTags } from "@/lib/cloudflare/purge-by-tags";
import { logError } from "@/lib/logger";
import { BLOG_PURGE_TAGS, purgeByTags } from "@/lib/netlify/purge-by-tags";

/**
 * Publishing has two caches to clear: Next's own route cache and the CDN in
 * front of it. Clearing one and not the other is the failure this module
 * exists to prevent, so both happen here and the result reports each.
 *
 * The surfaces listed below are the ones that actually render post data. The
 * site's product-only machine-readable files (/llms.txt, /ai.txt, /index.md)
 * describe the product rather than the blog, so a publish deliberately leaves
 * them be; the documentation corpus (/llms-full.txt) and the Markdown twins of
 * blog pages do carry published posts, so they are revalidated too.
 */

const SLUG_PATTERN = /^[a-z0-9-]+$/;

export type RevalidateBlogCacheInput = {
  posts?: Array<{ slug: string }>;
  categories?: Array<{ slug: string }>;
};

export type RevalidateBlogCacheResult = {
  revalidatedPaths: string[];
  purgedTags: string[];
  purgeOk: boolean;
  purgeError?: string;
  cfPurgeOk: boolean;
  cfPurgeError?: string;
};

function isValidPostSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

/** Category URLs carry the free-text category, so they are encoded. */
function categoryPathSegment(category: string): string {
  return encodeURIComponent(category.trim());
}

export async function revalidateBlogCache(
  input: RevalidateBlogCacheInput = {}
): Promise<RevalidateBlogCacheResult> {
  const revalidatedPaths: string[] = [];

  function revalidate(path: string) {
    revalidatePath(path);
    revalidatedPaths.push(path);
  }

  revalidate("/blog");
  revalidate("/blog/category");

  for (const post of input.posts ?? []) {
    // A slug that failed normalization would revalidate the wrong path, so
    // skip it rather than guess.
    if (post.slug && isValidPostSlug(post.slug)) {
      revalidate(`/blog/posts/${post.slug}`);
      // The twin's rewrite destination, not the public `.md` alias: the alias
      // is a rewrite source, so there is no path of its own to revalidate.
      revalidate(`/markdown-twin/blog/posts/${post.slug}`);
    }
  }

  for (const category of input.categories ?? []) {
    if (category.slug && category.slug.trim()) {
      const segment = categoryPathSegment(category.slug);
      revalidate(`/blog/category/${segment}`);
      revalidate(`/markdown-twin/blog/category/${segment}`);
    }
  }

  revalidate("/blog/posts/feed.xml");
  revalidate("/blog/posts/atom.xml");
  revalidate("/blog/posts/feed.json");
  revalidate("/sitemap.xml");
  // The full documentation corpus renders every published post body.
  revalidate("/llms-full.txt");

  const purgedTags = [...BLOG_PURGE_TAGS];
  const [netlifyPurge, cfPurge] = await Promise.all([
    purgeByTags(purgedTags),
    purgeCloudflareByTags(purgedTags),
  ]);

  if (!netlifyPurge.ok) {
    logError(
      "revalidate-blog-cache-purge-netlify",
      new Error(`Netlify purge failed: ${netlifyPurge.reason ?? "unknown"}`),
      { purgedTags, status: netlifyPurge.status }
    );
  }

  // Cloudflare is optional, so only a configured-but-failing purge is logged.
  if (!cfPurge.ok && cfPurge.reason !== "missing_env") {
    logError(
      "revalidate-blog-cache-purge-cloudflare",
      new Error(`Cloudflare purge failed: ${cfPurge.reason ?? "unknown"}`),
      { purgedTags, status: cfPurge.status }
    );
  }

  return {
    revalidatedPaths,
    purgedTags,
    purgeOk: netlifyPurge.ok,
    purgeError: netlifyPurge.ok ? undefined : netlifyPurge.reason,
    cfPurgeOk: cfPurge.ok,
    cfPurgeError: cfPurge.ok ? undefined : cfPurge.reason,
  };
}

/**
 * Invalidate everything one post touches.
 *
 * This throws when the CDN purge fails, which fails the publish action in the
 * admin UI. That is deliberate: a publish that reports success while the CDN
 * still serves the old page is worse than one that visibly did not finish.
 */
export async function revalidateAfterPostChange(post: {
  slug: string;
  category?: string | null;
}): Promise<RevalidateBlogCacheResult> {
  const categories: Array<{ slug: string }> = [];
  if (post.category?.trim()) {
    categories.push({ slug: post.category });
  }

  const result = await revalidateBlogCache({
    posts: [{ slug: post.slug }],
    categories,
  });

  if (!result.purgeOk) {
    throw new Error(
      result.purgeError === "missing_env"
        ? "CDN purge is not configured (NETLIFY_PURGE_TOKEN / NETLIFY_SITE_ID). Refusing to report a publish that may leave stale pages on the CDN."
        : `CDN purge failed (${result.purgeError ?? "unknown"}). Refusing to report a publish that may leave stale pages on the CDN.`
    );
  }

  return result;
}
