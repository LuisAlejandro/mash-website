import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

import { excerptFromBody } from "@/lib/blog/excerpt";
import type { PublicPost, PublicPostSummary } from "@/lib/blog/types";
import { db, posts, type Post } from "@/lib/db";

function requireDb() {
  if (!db) {
    throw new Error(
      'Blog database is unavailable. FEATURE_BLOG must be "1" and DATABASE_URL set.'
    );
  }
  return db;
}

function toIso(value: Date | string): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

/** Everything a list or feed needs. Deliberately excludes the body. */
function toPublicSummary(post: Post): PublicPostSummary {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: excerptFromBody(post.body),
    category: post.category,
    createdAt: toIso(post.createdAt),
    updatedAt: toIso(post.updatedAt),
  };
}

function toPublicPost(post: Post): PublicPost {
  return { ...toPublicSummary(post), body: post.body };
}

/**
 * Every public read filters on this. Drafts are excluded in the query rather
 * than in the view, so a new page cannot leak one by forgetting to filter.
 */
const published = eq(posts.status, "published");

/** Published posts, newest first. */
export async function listPublishedPosts(): Promise<PublicPostSummary[]> {
  const rows = await requireDb()
    .select()
    .from(posts)
    .where(published)
    .orderBy(desc(posts.createdAt));

  return rows.map(toPublicSummary);
}

/** One published post by slug. A draft slug returns null, so the page 404s. */
export async function getPublishedPostBySlug(
  slug: string
): Promise<PublicPost | null> {
  const rows = await requireDb()
    .select()
    .from(posts)
    .where(and(published, eq(posts.slug, slug)))
    .limit(1);

  return rows[0] ? toPublicPost(rows[0]) : null;
}

/** Most recently published posts. */
export async function getLatestPublishedPosts(
  limit = 10
): Promise<PublicPostSummary[]> {
  const rows = await requireDb()
    .select()
    .from(posts)
    .where(published)
    .orderBy(desc(posts.createdAt))
    .limit(limit);

  return rows.map(toPublicSummary);
}

/**
 * Most recently edited posts. There are no engagement metrics to rank by, so
 * "trending" means recently touched and differs from latest only by sort key.
 */
export async function getTrendingPublishedPosts(
  limit = 10
): Promise<PublicPostSummary[]> {
  const rows = await requireDb()
    .select()
    .from(posts)
    .where(published)
    .orderBy(desc(posts.updatedAt))
    .limit(limit);

  return rows.map(toPublicSummary);
}

/** Escape ILIKE wildcards so a query of "100%" matches that text literally. */
function escapeIlikePattern(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/** Case-insensitive search across title, body, and category. */
export async function searchPublishedPosts(
  query: string
): Promise<PublicPostSummary[]> {
  const pattern = `%${escapeIlikePattern(query)}%`;

  const rows = await requireDb()
    .select()
    .from(posts)
    .where(
      and(
        published,
        or(
          ilike(posts.title, pattern),
          ilike(posts.body, pattern),
          ilike(posts.category, pattern)
        )
      )
    )
    .orderBy(desc(posts.createdAt))
    .limit(50);

  return rows.map(toPublicSummary);
}

/** Distinct categories that have at least one published post. */
export async function listPublishedCategories(): Promise<string[]> {
  const rows = await requireDb()
    .selectDistinct({ category: posts.category })
    .from(posts)
    .where(and(published, sql`${posts.category} is not null`))
    .orderBy(posts.category);

  return rows
    .map((row) => row.category)
    .filter((value): value is string => Boolean(value));
}

/** Published posts in one category. */
export async function listPublishedPostsByCategory(
  category: string
): Promise<PublicPostSummary[]> {
  const rows = await requireDb()
    .select()
    .from(posts)
    .where(and(published, eq(posts.category, category)))
    .orderBy(desc(posts.createdAt));

  return rows.map(toPublicSummary);
}
