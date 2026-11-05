import type { Metadata } from "next";
import Script from "next/script";
import Analytics from "@/app/components/analytics";
import ConsentGate from "@/app/components/consent";
import { ErrorBoundary } from "@/app/components/error-boundary";
import { FACTS } from "@/lib/i18n/facts";
import { homeHref, languageAlternates } from "@/lib/i18n/locale";
import { socialOpenGraph, SOCIAL_TWITTER } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

const LOCALE = "en";
const COPY = FACTS[LOCALE];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: COPY.siteTitle,
  description: COPY.siteDescription,
  applicationName: "Mash",
  authors: [{ name: "Mash", url: SITE_URL }],
  alternates: {
    canonical: homeHref(LOCALE),
    languages: languageAlternates({ en: homeHref("en"), es: homeHref("es") }),
    types: {
      // The page's markdown twin; llms.txt is the site-level index and is
      // advertised through the describedby Link header in netlify.toml.
      "text/markdown": [
        { url: "/index.md", title: "Markdown version of this page" },
      ],
      "text/plain": [{ url: "/llms.txt", title: "llms.txt" }],
      "application/xml": [{ url: "/sitemap.xml", title: "Sitemap" }],
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/assets/mash/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/assets/mash/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/assets/mash/apple-touch-icon.png",
  },
  openGraph: {
    title: COPY.siteTitle,
    description: COPY.siteDescription,
    url: homeHref(LOCALE),
    type: "website",
    ...socialOpenGraph(LOCALE),
  },
  twitter: {
    title: COPY.siteTitle,
    description: COPY.siteDescription,
    ...SOCIAL_TWITTER,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#272823",
};

/**
 * The English root layout. English keeps the unprefixed URLs it has always
 * published; the Spanish tree has a root layout of its own under `app/es`, so
 * each locale serves its own `<html lang>` from the server.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={LOCALE} suppressHydrationWarning className="dark">
      <body>
        <Script id="js-class" strategy="beforeInteractive">
          {`document.documentElement.classList.add("js")`}
        </Script>
        {children}
        {/* Analytics is isolated behind its own boundary: a blocked or hostile
            third-party script must not take the page down with it. It mounts
            only after analytics consent. */}
        <ErrorBoundary>
          <ConsentGate locale={LOCALE}>
            <Analytics />
          </ConsentGate>
        </ErrorBoundary>
      </body>
    </html>
  );
}
