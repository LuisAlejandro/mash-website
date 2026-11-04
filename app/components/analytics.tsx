"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Analytics, mounted only after consent (see `consent.tsx`), and inert when
 * neither measurement ID is configured.
 *
 * `GoogleAnalytics` sends one page view from its initial `gtag('config')` but
 * does not observe App Router navigations, so route changes are forwarded to
 * both GA and the Meta Pixel explicitly.
 */
export default function Analytics() {
  const pathname = usePathname();
  const firstView = useRef(true);

  useEffect(() => {
    if (!pathname) return;
    // The first render is already counted by gtag('config') and fbq('init').
    if (firstView.current) {
      firstView.current = false;
      return;
    }

    if (GA_ID) {
      window.gtag?.("event", "page_view", {
        page_path: pathname,
        page_location: window.location.href,
      });
    }

    if (PIXEL_ID) window.fbq?.("track", "PageView");
  }, [pathname]);

  return (
    <>
      {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
      {PIXEL_ID ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
        </Script>
      ) : null}
    </>
  );
}
