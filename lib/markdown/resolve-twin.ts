import type { MarkdownTwin } from "@/lib/markdown/types";
import { isSafePathSegment } from "@/lib/markdown/path-safety";
import { blogTwin } from "@/lib/markdown/twins/blog";
import { docsTwin } from "@/lib/markdown/twins/docs";
import { marketingMarkdown } from "@/lib/markdown/twins/marketing";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/i18n/locale";

/** The locale a path's first segment names, defaulting to the unprefixed one. */
function localeOf(segment: string | undefined): Locale {
  return (
    LOCALES.find((locale) => locale !== DEFAULT_LOCALE && locale === segment) ??
    DEFAULT_LOCALE
  );
}

/**
 * Resolve one path, below the twin route, to the Markdown document it mirrors.
 *
 * Segments are validated before any lookup: a traversal component could
 * otherwise address a document this site does not publish, so it is rejected
 * rather than normalised. Everything unmapped resolves to `null`, which the
 * route serves as not-found.
 */
export async function resolveMarkdownTwin(
  segments: string[]
): Promise<MarkdownTwin | null> {
  if (!segments.every(isSafePathSegment)) return null;

  const locale = localeOf(segments[0]);

  const [surface, ...rest] =
    locale === DEFAULT_LOCALE ? segments : segments.slice(1);

  // No segments is a homepage, whose twin is assembled for `/index.md` and
  // `/es/index.md` too.
  if (!surface) {
    return {
      title: "Mash",
      url: `/${locale === DEFAULT_LOCALE ? "" : `${locale}/`}`,
      markdown: await marketingMarkdown(locale),
    };
  }

  if (surface === "docs") return docsTwin(rest, locale);

  // The blog is English-only: no locale prefix publishes one.
  if (surface === "blog" && locale === DEFAULT_LOCALE) return blogTwin(rest);

  return null;
}
