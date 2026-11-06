import { otherLocale, type Locale } from "@/lib/i18n/locale";
import { UI } from "@/lib/i18n/ui";

/**
 * The switch to the other published language.
 *
 * `href` is supplied by the caller rather than derived from the current path:
 * not every page has a translation, and the blog never will. A control that
 * blindly prefixed `/es` would advertise pages this site does not publish.
 */
export default function LanguageSwitch({
  locale,
  href,
}: {
  locale: Locale;
  href: string;
}) {
  const copy = UI[locale].languageSwitch;
  const target = otherLocale(locale);

  return (
    <a
      href={href}
      hrefLang={target}
      lang={target}
      className="btn-quiet lang-switch"
      aria-label={copy.ariaLabel}
    >
      {copy.label}
    </a>
  );
}
