const REPO = "https://github.com/LuisAlejandro/mash";

export default function Footer() {
  return (
    <>
      {/* Footer */}
      <footer>
        <div className="wrap footer-row">
          <div className="footer-links">
            <a href={REPO} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={`${REPO}/releases`} target="_blank" rel="noreferrer">
              Releases
            </a>
            <a href={`${REPO}/issues`} target="_blank" rel="noreferrer">
              Issues
            </a>
            <a href={`${REPO}/blob/develop/LICENSE`} target="_blank" rel="noreferrer">
              License
            </a>
          </div>
          <p className="footer-credit">Mash · a complete agentic workspace for macOS</p>
        </div>
      </footer>
    </>
  );
}
