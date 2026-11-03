import Link from "next/link";

import FriendlyDate from "./friendly-date";
import type { PublicPostSummary } from "@/lib/blog/types";

/** Shared between the blog index, category pages, and search results. */
export default function BlogPostList({
  posts,
  emptyMessage = "No published posts yet.",
}: {
  posts: PublicPostSummary[];
  emptyMessage?: string;
}) {
  if (posts.length === 0) {
    return (
      <p className="blog-empty" role="status">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="post-list">
      {posts.map((post) => (
        <li key={post.id} className="post-item">
          <article>
            {post.category ? (
              <Link
                href={`/blog/category/${encodeURIComponent(post.category)}`}
                className="post-category"
                rel="tag"
              >
                {post.category}
              </Link>
            ) : null}
            <h2 className="post-title">
              <Link href={`/blog/posts/${post.slug}`} rel="bookmark">
                {post.title}
              </Link>
            </h2>
            {post.excerpt ? (
              <p className="post-excerpt">{post.excerpt}</p>
            ) : null}
            <p className="post-meta">
              Published <FriendlyDate dateString={post.createdAt} />
            </p>
          </article>
        </li>
      ))}
    </ul>
  );
}
