import { RELEASES_URL, REPO_URL } from "@/lib/site";

export default function Footer() {
  return (
    <>
      {/* Footer */}
      <footer>
        <div className="wrap footer-row">
          <div className="footer-links">
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={RELEASES_URL} target="_blank" rel="noreferrer">
              Releases
            </a>
            <a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer">
              Issues
            </a>
            <a href={`${REPO_URL}/blob/develop/LICENSE`} target="_blank" rel="noreferrer">
              License
            </a>
          </div>
          <p className="footer-credit">Mash · a complete agentic workspace for macOS</p>
        </div>
      </footer>
    </>
  );
}
