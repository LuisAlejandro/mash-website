import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const TITLE = "Mash - A complete agentic workspace for macOS";
const DESCRIPTION =
  "Mash is one Mac app with Herdr, Pi, and the Mash skills already wired together: parallel agents, a review path you control, and code you can still read and edit by hand.";

export const metadata: Metadata = {
  metadataBase: new URL("https://letsma.sh"),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Mash",
  alternates: { canonical: "/" },
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
    siteName: "Mash",
    type: "website",
    images: [{ url: "/assets/mash/og.png", width: 1200, height: 630, alt: "Mash, a complete agentic workspace in one Mac app" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/assets/mash/og.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="js-class" strategy="beforeInteractive">
          {`document.documentElement.classList.add("js")`}
        </Script>
        {children}
      </body>
    </html>
  );
}
