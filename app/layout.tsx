import type { Metadata } from "next";
import Script from "next/script";
import Analytics from "./components/analytics";
import ConsentGate from "./components/consent";
import { ErrorBoundary } from "./components/error-boundary";
import { SOCIAL_OPEN_GRAPH, SOCIAL_TWITTER } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const TITLE = "Mash - A complete agentic workspace for macOS and Linux";
const DESCRIPTION =
  "Mash is one app with Herdr, Ghostty, Starship, Pi, and Fresh already wired together: parallel agents, a review path you control, and code you can still read and edit by hand.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Mash",
  authors: [{ name: "Mash", url: SITE_URL }],
  alternates: {
    canonical: "/",
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
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    type: "website",
    ...SOCIAL_OPEN_GRAPH,
  },
  twitter: {
    title: TITLE,
    description: DESCRIPTION,
    ...SOCIAL_TWITTER,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#272823",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body>
        <Script id="js-class" strategy="beforeInteractive">
          {`document.documentElement.classList.add("js")`}
        </Script>
        {children}
        {/* Analytics is isolated behind its own boundary: a blocked or hostile
            third-party script must not take the page down with it. It mounts
            only after analytics consent. */}
        <ErrorBoundary>
          <ConsentGate>
            <Analytics />
          </ConsentGate>
        </ErrorBoundary>
      </body>
    </html>
  );
}
