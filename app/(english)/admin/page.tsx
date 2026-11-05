import Link from "next/link";

import FriendlyDate from "@/app/components/friendly-date";
import {
  deletePostAction,
  publishPostAction,
  unpublishPostAction,
} from "@/app/(english)/admin/actions";
import { getAdminSession } from "@/lib/auth/session";
import { listAllPosts } from "@/lib/blog/admin";
import { logError } from "@/lib/logger";

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : String(value);
}

type PageProps = { searchParams: Promise<{ warning?: string }> };

export default async function AdminPage({ searchParams }: PageProps) {
  const session = await getAdminSession();
  const { warning } = await searchParams;

  if (session.status === "unauthenticated") {
    return (
      <div className="blog-wrap">
        <header className="blog-head">
          <h1 className="blog-title">Blog admin</h1>
          <p className="blog-lede">
            Sign in with GitHub to manage posts. Access is limited to
            allowlisted addresses.
          </p>
        </header>
      </div>
    );
  }

  if (session.status === "denied") {
    return (
      <div className="blog-wrap">
        <header className="blog-head">
          <h1 className="blog-title">Access denied</h1>
          <p className="blog-lede">
            You are signed in{session.email ? ` as ${session.email}` : ""}, but
            this account is not on the admin allowlist.
          </p>
        </header>
        <p className="admin-note">
          Ask an operator to add your address to{" "}
          <code>ADMIN_EMAIL_ALLOWLIST</code>, then reload this page.
        </p>
      </div>
    );
  }

  let posts: Awaited<ReturnType<typeof listAllPosts>>;
  try {
    posts = await listAllPosts();
  } catch (error) {
    logError("admin-list-posts", error);
    throw error;
  }

  return (
    <div className="blog-wrap">
      <header className="blog-head">
        <h1 className="blog-title">Posts</h1>
        <p className="blog-lede">Create, edit, publish, and unpublish.</p>
      </header>

      {warning ? (
        <p className="admin-note" role="status">
          Saved, but clearing the CDN cache failed. The change may take up to an
          hour to appear.
        </p>
      ) : null}

      {posts.length === 0 ? (
        <p className="blog-empty" role="status">
          No posts yet.
        </p>
      ) : (
        <ul className="admin-post-list">
          {posts.map((post) => (
            <li key={post.id} className="admin-post-item">
              <div className="admin-post-row">
                <div>
                  <p className="admin-status" data-status={post.status}>
                    {post.status}
                    {post.category ? ` · ${post.category}` : ""}
                  </p>
                  <h2 className="admin-post-title">
                    <Link href={`/admin/posts/${post.id}`}>{post.title}</Link>
                  </h2>
                  <p className="admin-post-slug">/{post.slug}</p>
                  <p className="admin-post-meta">
                    Updated <FriendlyDate dateString={toIso(post.updatedAt)} />
                  </p>
                </div>
                <div className="admin-actions">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="admin-link-button"
                  >
                    Edit
                  </Link>
                  {post.status === "published" ? (
                    <Link
                      href={`/blog/posts/${post.slug}`}
                      className="admin-link-button"
                    >
                      View
                    </Link>
                  ) : null}
                  <form
                    action={
                      post.status === "draft"
                        ? publishPostAction
                        : unpublishPostAction
                    }
                  >
                    <input type="hidden" name="id" value={post.id} />
                    <button type="submit" className="admin-link-button">
                      {post.status === "draft" ? "Publish" : "Unpublish"}
                    </button>
                  </form>
                  <form action={deletePostAction}>
                    <input type="hidden" name="id" value={post.id} />
                    <button
                      type="submit"
                      className="admin-link-button is-danger"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
