import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BlogHeader from "@/app/components/blog-header";
import Footer from "@/app/components/footer";
import { FEATURE_BLOG } from "@/lib/features";
import { APP_NAME } from "@/lib/site";
import "../../blog.css";

export const metadata: Metadata = {
  title: `Blog | ${APP_NAME}`,
  description: `Release notes and writing from the ${APP_NAME} project.`,
  alternates: {
    types: {
      "application/rss+xml": [
        { url: "/blog/posts/feed.xml", title: `${APP_NAME} blog (RSS)` },
      ],
      "application/atom+xml": [
        { url: "/blog/posts/atom.xml", title: `${APP_NAME} blog (Atom)` },
      ],
      "application/feed+json": [
        { url: "/blog/posts/feed.json", title: `${APP_NAME} blog (JSON)` },
      ],
    },
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!FEATURE_BLOG) {
    notFound();
  }

  return (
    <div id="blog-page">
      <BlogHeader />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
