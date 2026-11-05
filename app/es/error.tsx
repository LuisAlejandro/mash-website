"use client";

import StatusError from "@/app/components/status-error";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <StatusError locale="es" error={error} retry={retry} />;
}
