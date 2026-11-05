import { discoverySurfaces } from "@/lib/discovery/surfaces";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/** The Spanish catalog: the same shape as the English one, Spanish entries only. */
export function GET() {
  return Response.json(
    {
      linkset: [
        {
          anchor: `${SITE_URL}/es/`,
          item: discoverySurfaces("es").map(({ href, title, type }) => ({
            href,
            title,
            type,
          })),
        },
      ],
    },
    { headers: { "Content-Type": "application/linkset+json" } }
  );
}
