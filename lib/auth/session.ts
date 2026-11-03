import { headers } from "next/headers";

import { auth, isAllowlistedAdminEmail } from "@/lib/auth";
import { logError } from "@/lib/logger";

export type AdminSessionResult =
  | { status: "unauthenticated" }
  | { status: "denied"; email: string | null; name: string | null }
  | { status: "admin"; email: string; name: string | null; userId: string };

/**
 * Resolve the current visitor's admin standing.
 *
 * The allowlist is checked here, at every protected read, rather than once at
 * sign-in: removing an email from the allowlist then takes effect on the next
 * request instead of whenever that person's session happens to expire.
 */
export async function getAdminSession(): Promise<AdminSessionResult> {
  if (!auth) {
    return { status: "unauthenticated" };
  }

  let session: Awaited<ReturnType<typeof auth.api.getSession>>;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch (error) {
    logError("admin-session", error);
    return { status: "unauthenticated" };
  }

  if (!session?.user) {
    return { status: "unauthenticated" };
  }

  const email = session.user.email ?? null;
  const name = session.user.name ?? null;

  if (!email || !isAllowlistedAdminEmail(email)) {
    return { status: "denied", email, name };
  }

  return { status: "admin", email, name, userId: session.user.id };
}

/**
 * Same check, but for server actions: every mutation calls this first so that
 * authorization does not depend on the page that rendered the form.
 */
export async function requireAdminSession() {
  const result = await getAdminSession();
  if (result.status !== "admin") {
    throw new Error(
      result.status === "unauthenticated"
        ? "Authentication required"
        : "Admin access denied"
    );
  }
  return result;
}
