"use client";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export function AdminSignInButton({
  callbackURL = "/admin",
}: {
  callbackURL?: string;
}) {
  return (
    <button
      type="button"
      className="btn-solid"
      onClick={() => {
        void authClient.signIn.social({ provider: "github", callbackURL });
      }}
    >
      Sign in with GitHub
    </button>
  );
}

export function AdminSignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="admin-link-button"
      onClick={() => {
        void authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/");
              // The admin bar is server-rendered from the session, so the
              // cached version has to be discarded or it still shows the
              // signed-in state after the redirect.
              router.refresh();
            },
          },
        });
      }}
    >
      Sign out
    </button>
  );
}
