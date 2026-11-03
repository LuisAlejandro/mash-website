import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import Header from "@/app/components/header";
import { ReleaseProvider } from "@/app/components/release";
import { getLatestAppRelease } from "@/lib/app-release";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";
import "../docs.css";

export default async function Layout({ children }: { children: ReactNode }) {
  const release = await getLatestAppRelease();
  const options = baseOptions();

  return (
    <ReleaseProvider release={release}>
      <RootProvider
        theme={{ enabled: false, defaultTheme: "dark" }}
        search={{ options: { type: "static", api: "/api/search" } }}
      >
        <DocsLayout
          tree={source.getPageTree()}
          {...options}
          nav={{ ...options.nav, component: <Header mode="docs" /> }}
        >
          {children}
        </DocsLayout>
      </RootProvider>
    </ReleaseProvider>
  );
}
