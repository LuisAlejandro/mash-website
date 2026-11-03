import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createRelativeLink } from "fumadocs-ui/mdx";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import { getMDXComponents } from "@/lib/mdx";
import { SOCIAL_OPEN_GRAPH, SOCIAL_TWITTER } from "@/lib/metadata";
import { source } from "@/lib/source";
import { buildWebPageSchema, toJsonLdScript } from "@/lib/structured-data";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: toJsonLdScript(
            buildWebPageSchema({
              url: page.url,
              name: page.data.title,
              description: page.data.description,
            })
          ),
        }}
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

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const title = `${page.data.title} | Mash docs`;

  return {
    title,
    description: page.data.description,
    alternates: { canonical: page.url },
    openGraph: {
      ...SOCIAL_OPEN_GRAPH,
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
