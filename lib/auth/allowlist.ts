/**
 * Admin email allowlist.
 *
 * Fail-closed on purpose: an unset or empty allowlist denies everyone rather
 * than admitting the first person who signs in. Completing GitHub OAuth only
 * proves who someone is; this decides whether they may write.
 */

export function parseAdminEmailAllowlist(
  raw: string | undefined = process.env.ADMIN_EMAIL_ALLOWLIST
): Set<string> {
  if (!raw || !raw.trim()) {
    return new Set();
  }

  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAllowlistedAdminEmail(
  email: string | null | undefined,
  allowlist: Set<string> = parseAdminEmailAllowlist()
): boolean {
  if (!email || allowlist.size === 0) {
    return false;
  }
  return allowlist.has(email.trim().toLowerCase());
}
