"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Browser-side auth client, used by the admin sign-in and sign-out buttons.
 * It talks to /api/auth, which 404s when the blog is off.
 */
export const authClient = createAuthClient();
