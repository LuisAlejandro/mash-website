import { defineConfig } from "drizzle-kit";

/**
 * Migrations need Neon's direct (unpooled) connection. The pooled URL is for
 * HTTP reads at runtime and cannot run migrations.
 */
const unpooledUrl = process.env.DATABASE_URL_UNPOOLED;

if (!unpooledUrl) {
  throw new Error(
    "DATABASE_URL_UNPOOLED is required for drizzle migrations. Set Neon's direct (unpooled) connection string."
  );
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: unpooledUrl },
});
