import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/lib/source";

// The docs are static, so the index is written once at build time and searched
// in the browser. A `force-static` route handler also drops the query string,
// so `/api/search?query=` could never answer at runtime; the exported index can.
export const dynamic = "force-static";

/**
 * One index for both languages, filtered by the locale the reader is in.
 *
 * Every record carries its own `locale`, and `localeFilter` is what makes the
 * exported index say so: without it the browser would receive English and
 * Spanish hits mixed together, which is exactly the confusion a translated
 * docs tree exists to avoid.
 */
const api = createFromSource(source, { localeFilter: true });

export const GET = api.staticGET;
