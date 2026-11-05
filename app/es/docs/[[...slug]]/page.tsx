import type { Metadata } from "next";
import { DocsArticle, docsMetadata } from "@/app/components/docs-article";
import { docsParams } from "@/lib/source";

export default async function Page(props: PageProps<"/es/docs/[[...slug]]">) {
  const params = await props.params;
  return <DocsArticle slug={params.slug} locale="es" />;
}

export async function generateStaticParams() {
  return docsParams("es");
}

export async function generateMetadata(
  props: PageProps<"/es/docs/[[...slug]]">
): Promise<Metadata> {
  const params = await props.params;
  return docsMetadata(params.slug, "es");
}
