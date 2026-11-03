import Link from "next/link";
import { notFound } from "next/navigation";

import { listPublishedCategories } from "@/lib/blog";
import { FEATURE_BLOG } from "@/lib/features";
import { logError } from "@/lib/logger";
import { APP_NAME } from "@/lib/site";

export const metadata = {
  title: `Categories | Blog | ${APP_NAME}`,
  description: "Browse published posts by category.",
};

export default async function BlogCategoryIndexPage() {
  if (!FEATURE_BLOG) {
    notFound();
  }

  let categories: string[];
  try {
    categories = await listPublishedCategories();
  } catch (error) {
    logError("blog-category-index", error);
    throw error;
  }

  return (
    <div className="blog-wrap">
      <Link href="/blog" className="blog-back">
        ← Blog
      </Link>
      <header className="blog-head">
        <h1 className="blog-title">Categories</h1>
        <p className="blog-lede">Browse published posts by category.</p>
      </header>
      {categories.length === 0 ? (
        <p className="blog-empty" role="status">
          No categories yet.
        </p>
      ) : (
        <ul className="category-list">
          {categories.map((category) => (
            <li key={category}>
              <Link
                href={`/blog/category/${encodeURIComponent(category)}`}
                className="category-chip"
              >
                {category}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
