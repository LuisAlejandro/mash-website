import DOMPurify from "isomorphic-dompurify";

import { toJsonLdScript } from "@/lib/structured-data";

export function JsonLdScript({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(toJsonLdScript(data)),
      }}
    />
  );
}
