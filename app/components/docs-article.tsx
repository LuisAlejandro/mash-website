import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createRelativeLink } from "fumadocs-ui/mdx";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import { JsonLdScript } from "@/app/components/json-ld-script";
import { getMDXComponents } from "@/lib/mdx";
import { socialOpenGraph, SOCIAL_TWITTER } from "@/lib/metadata";
import { getDocsPage, source } from "@/lib/source";
import { buildWebPageSchema } from "@/lib/structured-data";
import {
  counterpartHref,
  DEFAULT_LOCALE,
  languageAlternates,
  type Locale,
} from "@/lib/i18n/locale";

/** What the docs are called in each language, for the `<title>` suffix. */
export const DOCS_TITLE: Record<Locale, string> = {
  en: "Mash docs",
  es: "Documentación de Mash",
};

/**
 * One docs page body, in the language of the route tree that renders it.
 *
 * `locale` also selects the page in the loader, so a Spanish URL can only ever
 * reach Spanish content: the loader has no fallback to English.
 */
export async function DocsArticle({
  slug,
  locale,
}: {
  slug: string[] | undefined;
  locale: Locale;
}) {
  const page = getDocsPage(slug, locale);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <>
      <JsonLdScript
        data={buildWebPageSchema({
          url: page.url,
          name: page.data.title,
          description: page.data.description,
          locale,
        })}
      />
      <DocsPage toc={page.data.toc} full={page.data.full}>
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>
        <DocsBody>
          <MDX
            components={getMDXComponents({
              // Lets a page link to another page with its relative file path.
              a: createRelativeLink(source, page),
            })}
          />
        </DocsBody>
      </DocsPage>
    </>
  );
}

/** The metadata for one docs page, in its own language. */
export async function docsMetadata(
  slug: string[] | undefined,
  locale: Locale
): Promise<Metadata> {
  const page = getDocsPage(slug, locale);
  if (!page) notFound();

  const title = `${page.data.title} | ${DOCS_TITLE[locale]}`;

  // Every docs page is published in both languages (the docs checker enforces
  // it), so the pair is always reciprocal and `x-default` is the English one.
  const counterpart = counterpartHref(page.url, locale);

  return {
    title,
    description: page.data.description,
    alternates: {
      canonical: page.url.replace(/\/?$/, "/"),
      languages: languageAlternates(
        locale === DEFAULT_LOCALE
          ? { en: page.url, es: counterpart }
          : { en: counterpart, es: page.url }
      ),
      types: {
        "text/markdown": [
          { url: `${page.url}.md`, title: `${title} (Markdown)` },
        ],
      },
    },
    openGraph: {
      ...socialOpenGraph(locale),
      title,
      description: page.data.description,
      url: page.url,
      type: "article",
    },
    twitter: {
      ...SOCIAL_TWITTER,
      title,
      description: page.data.description,
    },
  };
}
