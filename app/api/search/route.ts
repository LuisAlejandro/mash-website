import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/lib/source";

// The docs are static, so the index is written once at build time and searched
// in the browser. A `force-static` route handler also drops the query string,
// so `/api/search?query=` could never answer at runtime; the exported index can.
export const dynamic = "force-static";

const api = createFromSource(source, { language: "english" });

export const GET = api.staticGET;
