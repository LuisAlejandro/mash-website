import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { homeHref, type Locale } from "@/lib/i18n/locale";
import { UI } from "@/lib/i18n/ui";

/**
 * The chrome every docs layout shares with the marketing page, in the language
 * of the docs tree that renders it.
 */
export function baseOptions(locale: Locale): BaseLayoutProps {
  const copy = UI[locale].docs;

  return {
    nav: {
      title: copy.title,
      url: `${homeHref(locale)}docs/`,
    },
    links: [{ text: copy.home, url: homeHref(locale) }],
    themeSwitch: { enabled: false },
  };
}
