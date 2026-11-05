/**
 * The languages this site publishes, and the URLs each one lives at.
 *
 * English keeps the unprefixed paths it has always had; every other locale
 * lives under its own prefix and has its own root layout. Nothing here reads
 * the request: the URL alone selects the language, and there is no
 * browser-language redirect.
 */
export const LOCALES = ["en", "es"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** The path prefix a locale's pages live under; empty for English. */
export function localePrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "" : `/${locale}`;
}

/** A locale's homepage. Trailing slash, matching `trailingSlash: true`. */
export function homeHref(locale: Locale): string {
  return `${localePrefix(locale)}/`;
}

/** The other published language, for a page that has a translation. */
export function otherLocale(locale: Locale): Locale {
  return locale === DEFAULT_LOCALE ? "es" : "en";
}

/**
 * Reciprocal `hreflang` alternates for a translated pair.
 *
 * `x-default` points at English, the language every supported path has. Only
 * real pairs get this: a page the site publishes in one language advertises no
 * other, so nothing here is computed for the blog.
 */
export function languageAlternates(pair: {
  en: string;
  es: string;
}): Record<string, string> {
  return { en: pair.en, es: pair.es, "x-default": pair.en };
}

/** The same page path in the other language, for a translated pair. */
export function counterpartHref(href: string, locale: Locale): string {
  const target = otherLocale(locale);
  const own = `/${locale}`;
  const other = target === DEFAULT_LOCALE ? "" : `/${target}`;
  const path =
    locale === DEFAULT_LOCALE
      ? href
      : href.startsWith(own)
        ? href.slice(own.length) || "/"
        : href;

  return `${other}${path}` || "/";
}
