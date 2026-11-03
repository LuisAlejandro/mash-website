/**
 * Derive a short plain-text excerpt from a markdown body.
 *
 * Fenced code, inline code, images, and links are dropped before truncation so
 * an excerpt never opens with a code block or a bare URL.
 */
export function excerptFromBody(body: string, maxLength = 200): string {
  const plain = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|-]+/g, " ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxLength) {
    return plain;
  }

  return `${plain.slice(0, maxLength).trimEnd()}…`;
}
