import type { MetadataRoute } from "next";

const BASE_URL = "https://letsma.sh";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date("2026-10-20"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
