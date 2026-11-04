"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession } from "@/lib/auth/session";
import {
  createPost,
  deletePost,
  getPostById,
  setPostStatus,
  updatePost,
  type AdminPostInput,
} from "@/lib/blog/admin";
import {
  revalidateAfterPostChange,
  type RevalidateBlogCacheResult,
} from "@/lib/blog/revalidate-cache";
import { logError } from "@/lib/logger";

/**
 * Admin mutations.
 *
 * Every action re-checks the session itself. A server action is a public
 * endpoint, so the page that rendered the form proves nothing about who is
 * calling it.
 */

export type AdminActionState = {
  ok: boolean;
  error?: string;
  postId?: string;
  /**
   * The write committed but a cache did not clear. Kept apart from `error` so
   * the operator does not retry a save that already succeeded.
   */
  warning?: string;
};

const PURGE_WARNING =
  "Saved, but clearing the CDN cache failed. The change may take up to an hour to appear.";

/** A failed purge is a warning: the database write has already committed. */
function purgeWarning(result?: RevalidateBlogCacheResult): string | undefined {
  return result && !result.purgeOk ? PURGE_WARNING : undefined;
}

/** Publish, unpublish and create redirect, so the warning rides the URL. */
function warningQuery(warning?: string): string {
  return warning ? "?warning=cdn" : "";
}

function formToInput(formData: FormData): AdminPostInput {
  const status = String(formData.get("status") ?? "draft");
  const category = String(formData.get("category") ?? "").trim();

  return {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    body: String(formData.get("body") ?? ""),
    category: category || null,
    status: status === "published" ? "published" : "draft",
  };
}

function message(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export async function createPostAction(
  _previous: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  let postId: string;
  let warning: string | undefined;

  try {
    await requireAdminSession();
    const post = await createPost(formToInput(formData));
    revalidatePath("/admin");

    if (post.status === "published") {
      warning = purgeWarning(await revalidateAfterPostChange(post));
    }

    postId = post.id;
  } catch (error) {
    logError("admin-create-post", error);
    return { ok: false, error: message(error, "Failed to create post") };
  }

  // Outside the try: redirect works by throwing, and catching it here would
  // turn a successful save into a reported failure.
  redirect(`/admin/posts/${postId}${warningQuery(warning)}`);
}

export async function updatePostAction(
  _previous: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  let warning: string | undefined;

  try {
    await requireAdminSession();

    const id = String(formData.get("id") ?? "");
    if (!id) {
      return { ok: false, error: "Missing post id" };
    }

    const existing = await getPostById(id);
    if (!existing) {
      return { ok: false, error: "Post not found" };
    }

    const post = await updatePost(id, formToInput(formData));
    revalidatePath("/admin");

    // Purge when the post is public now, was public before, or moved: an
    // edit that unpublishes or renames still leaves the old URL cached.
    const wasPublic = existing.status === "published";
    const isPublic = post.status === "published";

    if (isPublic || wasPublic) {
      warning = purgeWarning(await revalidateAfterPostChange(post));

      const movedSlug = existing.slug !== post.slug;
      const movedCategory = existing.category !== post.category;

      if (wasPublic && (movedSlug || movedCategory)) {
        warning ??= purgeWarning(
          await revalidateAfterPostChange({
            slug: existing.slug,
            category: existing.category,
          })
        );
      }
    }

    return { ok: true, postId: post.id, warning };
  } catch (error) {
    logError("admin-update-post", error);
    return { ok: false, error: message(error, "Failed to save post") };
  }
}

export async function publishPostAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const post = await setPostStatus(
    String(formData.get("id") ?? ""),
    "published"
  );
  revalidatePath("/admin");
  const warning = purgeWarning(await revalidateAfterPostChange(post));
  redirect(`/admin/posts/${post.id}${warningQuery(warning)}`);
}

export async function unpublishPostAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const post = await setPostStatus(String(formData.get("id") ?? ""), "draft");
  revalidatePath("/admin");
  const warning = purgeWarning(await revalidateAfterPostChange(post));
  redirect(`/admin/posts/${post.id}${warningQuery(warning)}`);
}

export async function deletePostAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "");
  const existing = await getPostById(id);
  const deleted = await deletePost(id);
  revalidatePath("/admin");

  let warning: string | undefined;
  if (deleted && existing?.status === "published") {
    warning = purgeWarning(await revalidateAfterPostChange(deleted));
  }

  redirect(`/admin${warningQuery(warning)}`);
}
