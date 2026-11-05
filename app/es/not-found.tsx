import type { Metadata } from "next";
import StatusNotFound from "@/app/components/status-not-found";
import { UI } from "@/lib/i18n/ui";

export const metadata: Metadata = {
  title: UI.es.status.notFound.title,
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <StatusNotFound locale="es" />;
}
