import { timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import {
  createPost,
  getPostBySlug,
  normalizeSlug,
  updatePost,
  type AdminPostInput,
} from "@/lib/blog/admin";
import type { Post } from "@/lib/db";
import { revalidateAfterPostChange } from "@/lib/blog/revalidate-cache";
import { FEATURE_BLOG } from "@/lib/features";
import { logError } from "@/lib/logger";
import { SITE_URL } from "@/lib/site";

/**
 * Publish a post from outside the admin UI.
 *
 * The admin server actions prove who is calling by reading the session cookie,
 * which an external publisher (Postiz) cannot produce, so this route authenticates
 * with a bearer token instead. It is a write path, so the token lives in its own
 * variable: sharing REVALIDATE_SECRET would let anyone allowed to clear the cache
 * also create posts.
 *
 * The write and the cache clear are separate outcomes on purpose. Once the row
 * exists the publish has happened, so a failed purge is reported as a warning
 * rather than an error the caller would retry into a duplicate.
 */

export const dynamic = "force-dynamic";

/** Cards and feeds read the body in one query; a longer one is a mistake. */
const MAX_BODY_LENGTH = 200_000;

interface PublishBody {
  title?: string;
  slug?: string;
  body?: string;
  category?: string | null;
  status?: "draft" | "published";
}

const PURGE_WARNING =
  "Published, but clearing the CDN cache failed. The post may take up to an hour to appear.";

/** An unset token denies every caller rather than admitting all of them. */
function authorized(request: NextRequest): boolean {
  const expected = process.env.BLOG_PUBLISH_TOKEN;
  if (!expected) {
    return false;
  }

  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  const given = match?.[1]?.trim();
  if (!given) {
    return false;
  }

  const givenBuffer = Buffer.from(given);
  const expectedBuffer = Buffer.from(expected);
  return (
    givenBuffer.length === expectedBuffer.length &&
    timingSafeEqual(givenBuffer, expectedBuffer)
  );
}

/** The unique violation a racing publish of the same slug produces. */
function isSlugConflict(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  return code === "23505";
}

export async function POST(request: NextRequest) {
  if (!FEATURE_BLOG) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!authorized(request)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  let payload: PublishBody;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = String(payload.title ?? "").trim();
  const markdown = String(payload.body ?? "").trim();
  const slug = normalizeSlug(String(payload.slug || title));

  if (!title || !markdown) {
    return NextResponse.json(
      { error: "title and body are required" },
      { status: 400 }
    );
  }

  if (!slug) {
    return NextResponse.json(
      { error: "a slug could not be derived from the title" },
      { status: 400 }
    );
  }

  if (markdown.length > MAX_BODY_LENGTH) {
    return NextResponse.json(
      { error: `body is longer than ${MAX_BODY_LENGTH} characters` },
      { status: 413 }
    );
  }

  const category = payload.category?.trim() || null;
  const status: AdminPostInput["status"] =
    payload.status === "draft" ? "draft" : "published";
  const input: AdminPostInput = {
    title,
    slug,
    body: markdown,
    category,
    status,
  };

  let post: Post | undefined;
  try {
    const existing = await getPostBySlug(slug);
    post = existing
      ? await updatePost(existing.id, input)
      : await createPost(input);
  } catch (error) {
    // Two publishes of the same new slug can both miss the lookup above; the
    // second insert then loses the race on the unique index and becomes an update.
    if (isSlugConflict(error)) {
      const existing = await getPostBySlug(slug);
      if (existing) {
        post = await updatePost(existing.id, input);
      }
    }

    if (!post) {
      logError("blog-publish-api", error, { slug });
      return NextResponse.json(
        { error: "Could not save the post" },
        { status: 500 }
      );
    }
  }

  let warning: string | undefined;
  try {
    const result = await revalidateAfterPostChange(post);
    if (!result.purgeOk) {
      warning = PURGE_WARNING;
    }
  } catch (error) {
    logError("blog-publish-api-revalidate", error, { slug: post.slug });
    warning = PURGE_WARNING;
  }

  return NextResponse.json({
    slug: post.slug,
    url: `${SITE_URL}/blog/posts/${post.slug}`,
    status: post.status,
    ...(warning ? { warning } : {}),
  });
}
