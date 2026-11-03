import { docs } from "@/.source/server";
import { loader } from "fumadocs-core/source";

/** Every page under `/docs`, in sidebar order, read from `content/docs`. */
export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});
