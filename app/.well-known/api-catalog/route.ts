import { DISCOVERY_SURFACES } from "@/lib/discovery/surfaces";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  return Response.json(
    {
      linkset: [
        {
          anchor: `${SITE_URL}/`,
          item: DISCOVERY_SURFACES.map(({ href, title, type }) => ({
            href,
            title,
            type,
          })),
        },
      ],
    },
    { headers: { "Content-Type": "application/linkset+json" } },
  );
}
