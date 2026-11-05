import { notFound } from "next/navigation";

/**
 * Any path this site does not publish, inside the English tree.
 *
 * Without a catch-all, an unknown URL falls through to Next's built-in 404,
 * which is an unstyled English page outside every root layout — it would lose
 * the site chrome and, on the Spanish side, the language. This renders the
 * tree's own not-found instead, under the tree's own `<html lang>`.
 */
export default function CatchAll(): never {
  notFound();
}
