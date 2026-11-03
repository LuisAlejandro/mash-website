import { desc, eq } from "drizzle-orm";

import { db, posts, type NewPost, type Post } from "@/lib/db";

function requireDb() {
  if (!db) {
    throw new Error(
      'Blog database is unavailable. FEATURE_BLOG must be "1" and DATABASE_URL set.'
    );
  }
  return db;
}

export type AdminPostInput = {
  title: string;
  slug: string;
  body: string;
  category?: string | null;
  status?: "draft" | "published";
};

/**
 * Normalize a slug here rather than trusting the form: the same slug has to
 * survive a URL, a revalidate call, and a cache tag, and the admin field only
 * suggests the shape.
 */
function normalizeSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function validate(input: AdminPostInput): { title: string; slug: string } {
  const slug = normalizeSlug(input.slug);
  if (!slug) {
    throw new Error("Slug is required");
  }
  const title = input.title.trim();
  if (!title) {
    throw new Error("Title is required");
  }
  return { title, slug };
}

/** Every post, drafts included. Admin surfaces only. */
export async function listAllPosts(): Promise<Post[]> {
  return requireDb().select().from(posts).orderBy(desc(posts.updatedAt));
}

export async function getPostById(id: string): Promise<Post | null> {
  const rows = await requireDb()
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function createPost(input: AdminPostInput): Promise<Post> {
  const { title, slug } = validate(input);

  const values: NewPost = {
    title,
    slug,
    body: input.body,
    category: input.category?.trim() || null,
    status: input.status ?? "draft",
  };

  const rows = await requireDb().insert(posts).values(values).returning();
  const post = rows[0];
  if (!post) {
    throw new Error("Failed to create post");
  }
  return post;
}

export async function updatePost(
  id: string,
  input: AdminPostInput
): Promise<Post> {
  const { title, slug } = validate(input);

  const rows = await requireDb()
    .update(posts)
    .set({
      title,
      slug,
      body: input.body,
      category: input.category?.trim() || null,
      status: input.status ?? "draft",
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id))
    .returning();

  const post = rows[0];
  if (!post) {
    throw new Error("Post not found");
  }
  return post;
}

export async function setPostStatus(
  id: string,
  status: "draft" | "published"
): Promise<Post> {
  const rows = await requireDb()
    .update(posts)
    .set({ status, updatedAt: new Date() })
    .where(eq(posts.id, id))
    .returning();

  const post = rows[0];
  if (!post) {
    throw new Error("Post not found");
  }
  return post;
}

export async function deletePost(id: string): Promise<Post | null> {
  const rows = await requireDb()
    .delete(posts)
    .where(eq(posts.id, id))
    .returning();
  return rows[0] ?? null;
}
