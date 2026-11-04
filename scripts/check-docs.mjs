import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../content/docs/", import.meta.url);
const repoRoot = new URL("../", import.meta.url);
const sourceRoot = fileURLToPath(new URL("../../mash/", import.meta.url));
const files = readdirSync(root, { recursive: true });
const pages = files.filter((file) => file.endsWith(".mdx"));
const urlFor = (file) =>
  `/docs/${file.endsWith("index.mdx") ? file.slice(0, -"index.mdx".length) : `${file.slice(0, -".mdx".length)}/`}`;
const urls = new Set(pages.map(urlFor));
const declared = new Set();
const errors = [];

for (const file of files.filter((name) => name.endsWith("meta.json"))) {
  const meta = JSON.parse(readFileSync(new URL(file, root), "utf8"));
  for (const name of meta.pages) {
    const prefix = dirname(file) === "." ? name : join(dirname(file), name);
    const candidate = [`${prefix}.mdx`, join(prefix, "index.mdx")].find(
      (path) => pages.includes(path)
    );
    if (candidate) declared.add(candidate);
    else if (!files.includes(join(prefix, "meta.json"))) {
      errors.push(`${file}: missing page or section ${name}`);
    }
  }
}

for (const file of pages) {
  if (!declared.has(file)) errors.push(`${file}: missing sidebar entry`);
  const body = readFileSync(new URL(file, root), "utf8");
  if (/!\[[^\]]*\]\(/.test(body))
    errors.push(`${file}: screenshots/images are out of scope`);
  if (/\b\d+\.\d+\.\d+\b/.test(body)) errors.push(`${file}: hardcoded version`);
  for (const match of body.matchAll(/\]\((\/docs\/[^)\s#]*)(?:#[^)]*)?\)/g)) {
    if (!urls.has(match[1]))
      errors.push(`${file}: broken docs link ${match[1]}`);
  }
}

const coveragePath = new URL("docs/docs-coverage.md", repoRoot);
if (!existsSync(coveragePath)) {
  errors.push("coverage: docs/docs-coverage.md is missing");
} else {
  const coverage = readFileSync(coveragePath, "utf8");
  // The app repo is a separate checkout. Row coverage is checked everywhere;
  // citation ranges only where that checkout exists, and this says so out loud
  // rather than passing silently.
  const citationsVerifiable = existsSync(sourceRoot);
  if (!citationsVerifiable) {
    console.log("coverage citations not verified: no sibling ../mash checkout");
  }
  const mapped = new Set();
  for (const line of coverage.split(/\r?\n/)) {
    if (!line.startsWith("| `")) continue;
    const cells = line.split("|").map((cell) => cell.trim());
    const slug = cells[1]?.replace(/^`|`$/g, "");
    const sourceCell = cells.at(-2) ?? "";
    if (slug && pages.includes(`${slug}.mdx`)) mapped.add(`${slug}.mdx`);
    else if (slug && pages.includes(join(slug, "index.mdx")))
      mapped.add(join(slug, "index.mdx"));
    else errors.push(`coverage: page slug does not exist: ${slug}`);

    const citations = [
      ...sourceCell.matchAll(
        /([A-Za-z0-9_./-]+\.[A-Za-z0-9_-]+):(\d+)(?:-(\d+))?/g
      ),
    ];
    if (!citations.length)
      errors.push(`coverage ${slug}: missing source citation`);
    for (const [, source, start, end] of citations) {
      if (!citationsVerifiable) continue;
      const file = join(sourceRoot, source);
      if (!existsSync(file)) {
        errors.push(`coverage ${slug}: source file does not exist: ${source}`);
        continue;
      }
      const lineCount = readFileSync(file, "utf8").split(/\r?\n/).length;
      if (Number(start) < 1 || Number(end ?? start) > lineCount) {
        errors.push(
          `coverage ${slug}: citation out of range ${source}:${start}-${end ?? start}`
        );
      }
    }
  }
  for (const file of pages)
    if (!mapped.has(file)) errors.push(`coverage: no row for ${file}`);
  if (mapped.size !== pages.length)
    errors.push(
      `coverage: expected ${pages.length} page rows, found ${mapped.size}`
    );
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `${pages.length} docs pages: sidebar, links, and coverage resolve`
  );
}
