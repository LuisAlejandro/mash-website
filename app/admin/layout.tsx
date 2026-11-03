import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  AdminSignInButton,
  AdminSignOutButton,
} from "@/app/components/admin-auth-buttons";
import { getAdminSession } from "@/lib/auth/session";
import { FEATURE_BLOG } from "@/lib/features";
import { APP_NAME } from "@/lib/site";
import "../blog.css";

export const metadata: Metadata = {
  title: `Admin | ${APP_NAME}`,
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!FEATURE_BLOG) {
    notFound();
  }

  const session = await getAdminSession();

  return (
    <div id="admin-page">
      <header className="admin-bar">
        <div className="admin-bar-row">
          <div className="admin-bar-links">
            <Link href="/admin" className="is-current">
              Admin
            </Link>
            <Link href="/">Public site</Link>
            <Link href="/blog">Blog</Link>
            {session.status === "admin" ? (
              <Link href="/admin/posts/new">New post</Link>
            ) : null}
          </div>
          <div className="admin-identity">
            {session.status === "unauthenticated" ? (
              <AdminSignInButton />
            ) : (
              <>
                <span>{session.email ?? "Signed in"}</span>
                <AdminSignOutButton />
              </>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
