import Link from "next/link";
import { FEATURE_BLOG } from "@/lib/features";
import { RELEASES_URL, REPO_URL } from "@/lib/site";

export default function Footer() {
  return (
    <>
      {/* Footer */}
      <footer>
        <div className="wrap footer-row">
          <div className="footer-links">
            <Link href="/docs/">Docs</Link>
            {FEATURE_BLOG && <Link href="/blog">Blog</Link>}
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={RELEASES_URL} target="_blank" rel="noreferrer">
              Releases
            </a>
            <a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer">
              Issues
            </a>
            <a
              href={`${REPO_URL}/blob/develop/LICENSE`}
              target="_blank"
              rel="noreferrer"
            >
              License
            </a>
          </div>
          <p className="footer-credit">
            Mash · a complete agentic workspace for macOS and Linux
          </p>
        </div>
      </footer>
    </>
  );
}
