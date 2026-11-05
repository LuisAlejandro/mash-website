import Link from "next/link";
import Footer from "./footer";
import Header from "./header";
import { homeHref, type Locale } from "@/lib/i18n/locale";
import { UI } from "@/lib/i18n/ui";
import { RELEASES_URL } from "@/lib/site";

/**
 * Served by the App Router for any path with no route. It renders its own
 * Header and Footer because the root layout only supplies `<html>`/`<body>`.
 *
 * The docs link stays on the English tree until the Spanish docs pages exist;
 * a Spanish 404 that pointed at `/es/docs/` would offer a second 404.
 */
export default function StatusNotFound({ locale }: { locale: Locale }) {
  const copy = UI[locale].status.notFound;

  return (
    <>
      <Header mode="status" locale={locale} />
      <main className="status-page wrap">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 className="status-title">
          {copy.heading.text}
          <em>{copy.heading.emphasis}</em>
        </h1>
        <p className="status-text">{copy.body}</p>
        <div className="status-actions">
          <Link className="btn-solid" href={homeHref(locale)}>
            {copy.home}
          </Link>
          <Link className="btn-quiet" href="/docs/">
            {copy.docs}
          </Link>
          <a className="btn-quiet" href={RELEASES_URL}>
            {copy.releases}
          </a>
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}
