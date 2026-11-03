import { Feed } from "feed";

import { listPublishedPosts } from "@/lib/blog";
import { APP_NAME, SITE_URL } from "@/lib/site";

/**
 * One feed object, rendered three ways by the routes under
 * /blog/posts. Keeping construction here means a change to the channel
 * metadata cannot land in RSS but miss Atom.
 */
const FEED_DESCRIPTION = `Release notes and writing from the ${APP_NAME} project.`;

export async function buildBlogFeed(): Promise<Feed> {
  const posts = await listPublishedPosts();

  const feed = new Feed({
    title: `${APP_NAME} blog`,
    description: FEED_DESCRIPTION,
    language: "en",
    id: `${SITE_URL}/blog`,
    link: `${SITE_URL}/blog`,
    image: `${SITE_URL}/assets/mash/favicon-32.png`,
    favicon: `${SITE_URL}/assets/mash/favicon.ico`,
    copyright: `${APP_NAME}, GPL-3.0-or-later`,
    // Dated from the newest post rather than the build clock, so an unchanged
    // blog keeps producing byte-identical feeds across rebuilds.
    updated: posts[0] ? new Date(posts[0].updatedAt) : undefined,
    generator: "Next.js",
    feedLinks: {
      rss2: `${SITE_URL}/blog/posts/feed.xml`,
      atom: `${SITE_URL}/blog/posts/atom.xml`,
      json: `${SITE_URL}/blog/posts/feed.json`,
    },
    author: { name: APP_NAME, link: SITE_URL },
  });

  for (const post of posts) {
    feed.addItem({
      title: post.title,
      id: `${SITE_URL}/blog/posts/${post.slug}`,
      link: `${SITE_URL}/blog/posts/${post.slug}`,
      description: post.excerpt,
      date: new Date(post.createdAt),
      category: post.category ? [{ name: post.category }] : undefined,
    });
  }

  return feed;
}
