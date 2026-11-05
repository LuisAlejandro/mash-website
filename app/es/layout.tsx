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

const LOCALE = "es";
const COPY = FACTS[LOCALE];

/**
 * The Spanish root layout. Spanish pages live under `/es`, each with its own
 * document, so `<html lang="es">` is server-rendered here and never depends on
 * the browser's language.
 */
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
      // The English homepage twin; Spanish twins arrive with the generated
      // text endpoints for this tree.
      "text/plain": [{ url: "/llms.txt", title: "llms.txt" }],
      "application/xml": [{ url: "/sitemap.xml", title: "Mapa del sitio" }],
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

export default function RootLayout({ children }: LayoutProps<"/es">) {
  return (
    <html lang={LOCALE} suppressHydrationWarning className="dark">
      <body>
        <Script id="js-class" strategy="beforeInteractive">
          {`document.documentElement.classList.add("js")`}
        </Script>
        {children}
        <ErrorBoundary>
          <ConsentGate locale={LOCALE}>
            <Analytics />
          </ConsentGate>
        </ErrorBoundary>
      </body>
    </html>
  );
}
