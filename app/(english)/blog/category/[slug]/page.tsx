import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import BlogPostList from "@/app/components/blog-post-list";
import { listPublishedPostsByCategory } from "@/lib/blog";
import { FEATURE_BLOG } from "@/lib/features";
import { logError } from "@/lib/logger";
import { APP_NAME } from "@/lib/site";

type PageProps = { params: Promise<{ slug: string }> };

/** One hour of ISR; a publish invalidates this path directly. */
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  // Nothing to decode: the router hands back an already-decoded param, and the
  // category is free text, so decoding again turns a name containing "%" into
  // an unhandled URIError.
  const category = slug;
  return {
    title: `${category} | Blog | ${APP_NAME}`,
    description: `Published posts in ${category}.`,
    alternates: { canonical: `/blog/category/${slug}` },
  };
}

export default async function BlogCategoryPage({ params }: PageProps) {
  if (!FEATURE_BLOG) {
    notFound();
  }

  const { slug } = await params;
  const category = slug;

  let posts: Awaited<ReturnType<typeof listPublishedPostsByCategory>>;
  try {
    posts = await listPublishedPostsByCategory(category);
  } catch (error) {
    logError("blog-category", error, { category });
    throw error;
  }

  // A category only exists while a published post carries it, so an empty
  // result is a 404 rather than an empty page that could be linked forever.
  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="blog-wrap">
      <Link href="/blog/category" className="blog-back">
        ← Categories
      </Link>
      <header className="blog-head">
        <h1 className="blog-title">{category}</h1>
        <p className="blog-lede">Published posts in this category.</p>
      </header>
      <BlogPostList posts={posts} />
    </div>
  );
}
