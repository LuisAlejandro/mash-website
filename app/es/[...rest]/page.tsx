import { notFound } from "next/navigation";

/**
 * Any path this site does not publish, inside the Spanish tree.
 *
 * A Spanish reader who mistypes a URL gets the Spanish not-found page, with
 * `<html lang="es">`, rather than an English one or Next's unstyled default.
 */
export default function CatchAll(): never {
  notFound();
}
