/** Site-wide social metadata, declared once and shared by every page. */
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/site";

type OpenGraph = NonNullable<Metadata["openGraph"]>;
type Twitter = NonNullable<Metadata["twitter"]>;
type TwitterLargeImageCard = Extract<Twitter, { card: "summary_large_image" }>;

/** The one place the social preview image path is written down. */
const SOCIAL_IMAGE_PATH = "/assets/mash/og.png";

const SOCIAL_IMAGE = {
  url: SOCIAL_IMAGE_PATH,
  width: 1200,
  height: 630,
  alt: `${APP_NAME}, a complete agentic workspace in one Mac app`,
};

/**
 * Next replaces a nested `openGraph` object instead of merging it, so a page
 * that returns its own `openGraph` drops these inherited fields. Spread them
 * back in and override only title, description, url and type.
 */
export const SOCIAL_OPEN_GRAPH = {
  siteName: APP_NAME,
  locale: "en_US",
  images: [SOCIAL_IMAGE],
} satisfies Pick<OpenGraph, "siteName" | "locale" | "images">;

/** The same replacement applies to `twitter`; its card needs the image. */
export const SOCIAL_TWITTER: TwitterLargeImageCard = {
  card: "summary_large_image",
  images: [SOCIAL_IMAGE_PATH],
};
