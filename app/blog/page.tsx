import { notFound } from "next/navigation";

import BlogSearch from "@/app/components/blog-search";
import { listPublishedPosts } from "@/lib/blog";
import { FEATURE_BLOG } from "@/lib/features";
import { logError } from "@/lib/logger";

export default async function BlogIndexPage() {
  // The layout guard does not stop this component from running during
  // prerender, so the check has to be here too, ahead of any query.
  if (!FEATURE_BLOG) {
    notFound();
  }

  let posts: Awaited<ReturnType<typeof listPublishedPosts>>;
  try {
    posts = await listPublishedPosts();
  } catch (error) {
    // An unreachable database is a server fault, not an empty blog: let the
    // error boundary show a failure rather than claim there are no posts.
    logError("blog-index", error);
    throw error;
  }

  return (
    <div className="blog-wrap">
      <header className="blog-head">
        <h1 className="blog-title">Blog</h1>
        <p className="blog-lede">
          Release notes and writing from the Mash project.
        </p>
      </header>
      <BlogSearch posts={posts} />
    </div>
  );
}
