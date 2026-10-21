"use client";

import { useRelease } from "./release";

export default function VersionBadge() {
  const { state, version } = useRelease();

  return <span id="version-badge">{state === "ready" ? version : ""}</span>;
}
