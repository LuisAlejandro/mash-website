import AdminPostForm from "@/app/components/admin-post-form";
import { getAdminSession } from "@/lib/auth/session";

export default async function NewPostPage() {
  const session = await getAdminSession();

  if (session.status !== "admin") {
    return (
      <div className="blog-wrap">
        <header className="blog-head">
          <h1 className="blog-title">Admin access required</h1>
          <p className="blog-lede">
            Sign in with an allowlisted account to create posts.
          </p>
        </header>
      </div>
    );
  }

  return (
    <div className="blog-wrap">
      <header className="blog-head">
        <h1 className="blog-title">New post</h1>
        <p className="blog-lede">
          Saved as a draft unless you set the status to published.
        </p>
      </header>
      <AdminPostForm mode="create" />
    </div>
  );
}
