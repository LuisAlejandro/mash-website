import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import Header from "@/app/components/header";
import { ReleaseProvider } from "@/app/components/release";
import { getLatestAppRelease } from "@/lib/app-release";
import { docsI18nProvider } from "@/lib/i18n/docs";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";
import "../../docs.css";

export default async function Layout({ children }: { children: ReactNode }) {
  const release = await getLatestAppRelease();
  const options = baseOptions("es");
  return (
    <ReleaseProvider release={release}>
      <RootProvider
        theme={{ enabled: false, defaultTheme: "dark" }}
        i18n={docsI18nProvider("es")}
        search={{ options: { type: "static", api: "/api/search" } }}
      >
        <DocsLayout
          tree={source.getPageTree("es")}
          {...options}
          nav={{
            ...options.nav,
            component: <Header mode="docs" locale="es" />,
          }}
        >
          {children}
        </DocsLayout>
      </RootProvider>
    </ReleaseProvider>
  );
}
