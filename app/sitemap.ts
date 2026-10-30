import type { MetadataRoute } from "next";
import { CAPTURES, FILM, ORCHESTRATION_FILM, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Next emits the image and video namespaces only for the elements it is given,
 * so this sitemap declares nothing it does not also populate.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date("2026-10-20"),
      changeFrequency: "weekly",
      priority: 1,
      images: CAPTURES.map((capture) => `${SITE_URL}${capture.path}`),
      videos: [
        {
          title: "A tour of Mash",
          thumbnail_loc: `${SITE_URL}${FILM.poster}`,
          description:
            "The Mash command palette, workspace picker, file finder, and review tab, recorded from the app.",
          content_loc: `${SITE_URL}${FILM.path}`,
          duration: 26,
          publication_date: FILM.uploadDate,
          family_friendly: "yes",
          live: "no",
          tag: "agentic coding, macOS, Linux, developer tools",
        },
        {
          title: ORCHESTRATION_FILM.title,
          thumbnail_loc: `${SITE_URL}${ORCHESTRATION_FILM.poster}`,
          description: ORCHESTRATION_FILM.description,
          content_loc: `${SITE_URL}${ORCHESTRATION_FILM.path}`,
          duration: ORCHESTRATION_FILM.seconds,
          publication_date: ORCHESTRATION_FILM.uploadDate,
          family_friendly: "yes",
          live: "no",
          tag: "agent orchestration, agentic coding, developer tools",
        },
      ],
    },
    {
      url: `${SITE_URL}/index.md`,
      lastModified: new Date("2026-10-20"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/llms.txt`,
      lastModified: new Date("2026-10-20"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
