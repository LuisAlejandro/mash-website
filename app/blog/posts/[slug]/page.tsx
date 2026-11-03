import type { Metadata } from "next";
import DOMPurify from "isomorphic-dompurify";
import Link from "next/link";
import { notFound } from "next/navigation";

import FriendlyDate from "@/app/components/friendly-date";
import { JsonLdScript } from "@/app/components/json-ld-script";
import { getPublishedPostBySlug } from "@/lib/blog";
import { FEATURE_BLOG } from "@/lib/features";
import { logError } from "@/lib/logger";
import { markdownToHtml } from "@/lib/markdown-to-html";
import { SOCIAL_OPEN_GRAPH } from "@/lib/metadata";
import { APP_NAME } from "@/lib/site";
import { buildBlogPostSchema } from "@/lib/structured-data";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  if (!FEATURE_BLOG) {
    return { title: `Blog | ${APP_NAME}` };
  }

  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug).catch(() => null);

  if (!post) {
    return { title: `Blog | ${APP_NAME}` };
  }

  return {
    title: `${post.title} | ${APP_NAME}`,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/posts/${post.slug}`,
      types: {
        "text/markdown": [
          {
            url: `/blog/posts/${post.slug}.md`,
            title: `${post.title} (Markdown)`,
          },
        ],
      },
    },
    openGraph: {
      ...SOCIAL_OPEN_GRAPH,
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/posts/${post.slug}`,
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  if (!FEATURE_BLOG) {
    notFound();
  }

  const { slug } = await params;

  let post: Awaited<ReturnType<typeof getPublishedPostBySlug>>;
  try {
    post = await getPublishedPostBySlug(slug);
  } catch (error) {
    logError("blog-post", error, { slug });
    throw error;
  }

  // Null covers both "no such post" and "that post is still a draft".
  if (!post) {
    notFound();
  }

  const html = await markdownToHtml(post.body);

  return (
    <div className="blog-wrap">
      <JsonLdScript data={buildBlogPostSchema(post)} />
      <Link href="/blog" className="blog-back">
        ← Blog
      </Link>
      <article>
        <header className="blog-head">
          {post.category ? (
            <Link
              href={`/blog/category/${encodeURIComponent(post.category)}`}
              className="post-category"
              rel="tag"
            >
              {post.category}
            </Link>
          ) : null}
          <h1 className="blog-title">{post.title}</h1>
          <p className="post-meta">
            Published <FriendlyDate dateString={post.createdAt} />
          </p>
        </header>
        <div
          className="post-body"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
        />
      </article>
    </div>
  );
}
