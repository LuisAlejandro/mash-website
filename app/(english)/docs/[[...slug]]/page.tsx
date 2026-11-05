import type { Metadata } from "next";
import { DocsArticle, docsMetadata } from "@/app/components/docs-article";
import { docsParams } from "@/lib/source";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  return <DocsArticle slug={params.slug} locale="en" />;
}

export async function generateStaticParams() {
  return docsParams("en");
}

export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">
): Promise<Metadata> {
  const params = await props.params;
  return docsMetadata(params.slug, "en");
}
