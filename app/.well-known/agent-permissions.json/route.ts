import { DISCOVERY_SURFACES } from "@/lib/discovery/surfaces";

export const dynamic = "force-static";

export function GET() {
  return Response.json(
    {
      policy: "read-only",
      notice: "Declarative guidance only; this file does not enforce access control.",
      surfaces: DISCOVERY_SURFACES.map(({ href }) => ({
        href,
        permission: "read",
      })),
    },
    { headers: { "Content-Type": "application/json; charset=utf-8" } },
  );
}
