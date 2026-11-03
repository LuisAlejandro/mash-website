import { notFound } from "next/navigation";
import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";
import { FEATURE_BLOG } from "@/lib/features";

/**
 * Better Auth catch-all. With the blog off there is no auth instance, so the
 * whole route 404s rather than exposing a sign-in endpoint that cannot work.
 */
export const dynamic = "force-dynamic";

function createHandlers() {
  if (!FEATURE_BLOG || !auth) {
    const disabled = async () => {
      notFound();
    };
    return { GET: disabled, POST: disabled };
  }
  return toNextJsHandler(auth);
}

export const { GET, POST } = createHandlers();
