import Link from "next/link";
import { FEATURE_BLOG } from "@/lib/features";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";
import { UI } from "@/lib/i18n/ui";
import { RELEASES_URL, REPO_URL } from "@/lib/site";

export default function Footer({
  locale = DEFAULT_LOCALE,
}: {
  locale?: Locale;
}) {
  const copy = UI[locale].footer;

  return (
    <>
      {/* Footer */}
      <footer>
        <div className="wrap footer-row">
          <div className="footer-links">
            <Link href="/docs/">{copy.docs}</Link>
            {FEATURE_BLOG && <Link href="/blog">{copy.blog}</Link>}
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={RELEASES_URL} target="_blank" rel="noreferrer">
              {copy.releases}
            </a>
            <a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer">
              {copy.issues}
            </a>
            <a
              href={`${REPO_URL}/blob/develop/LICENSE`}
              target="_blank"
              rel="noreferrer"
            >
              {copy.license}
            </a>
          </div>
          <p className="footer-credit">{copy.credit}</p>
        </div>
      </footer>
    </>
  );
}
