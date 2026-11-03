import Link from "next/link";
import { notFound } from "next/navigation";

import AdminPostForm from "@/app/components/admin-post-form";
import { getAdminSession } from "@/lib/auth/session";
import { getPostById } from "@/lib/blog/admin";
import { logError } from "@/lib/logger";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: PageProps) {
  const session = await getAdminSession();

  if (session.status !== "admin") {
    return (
      <div className="blog-wrap">
        <header className="blog-head">
          <h1 className="blog-title">Admin access required</h1>
          <p className="blog-lede">
            Sign in with an allowlisted account to edit posts.
          </p>
        </header>
      </div>
    );
  }

  const { id } = await params;

  let post: Awaited<ReturnType<typeof getPostById>>;
  try {
    post = await getPostById(id);
  } catch (error) {
    logError("admin-edit-post", error, { id });
    throw error;
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="blog-wrap">
      <Link href="/admin" className="blog-back">
        ← Posts
      </Link>
      <header className="blog-head">
        <h1 className="blog-title">Edit post</h1>
        <p className="admin-status" data-status={post.status}>
          {post.status}
        </p>
      </header>
      <AdminPostForm
        mode="edit"
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          body: post.body,
          category: post.category,
          status: post.status,
        }}
      />
    </div>
  );
}
