import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

/** The chrome every docs layout shares with the marketing page. */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "Mash docs",
      url: "/docs/",
    },
    links: [{ text: "Home", url: "/" }],
    themeSwitch: { enabled: false },
  };
}
