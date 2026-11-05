import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../content/docs/", import.meta.url);
const repoRoot = new URL("../", import.meta.url);
const sourceRoot = fileURLToPath(new URL("../../mash/", import.meta.url));
const files = readdirSync(root, { recursive: true });

/** The languages the docs publish beyond English, matching `lib/i18n/locale`. */
const TRANSLATED = ["es"];

const esSuffix = (locale) => `.${locale}.mdx`;
const isTranslation = (file) =>
  TRANSLATED.some((locale) => file.endsWith(esSuffix(locale)));
/** `agents/voice.es.mdx` -> `agents/voice.mdx` */
const englishOf = (file) => file.replace(/\.(?:[a-z]{2})\.mdx$/, ".mdx");

const pages = files.filter((file) => file.endsWith(".mdx"));
const englishPages = pages.filter((file) => !isTranslation(file));
const translatedPages = pages.filter(isTranslation);

const urlFor = (file, prefix = "") =>
  `${prefix}/docs/${file.endsWith("index.mdx") ? file.slice(0, -"index.mdx".length) : `${file.slice(0, -".mdx".length)}/`}`;
const urls = new Set(englishPages.map((file) => urlFor(file)));
const translatedUrls = new Set(
  translatedPages.map((file) => urlFor(englishOf(file), localePrefixOf(file)))
);

function localePrefixOf(file) {
  const match = file.match(/\.([a-z]{2})\.mdx$/);
  return match ? `/${match[1]}` : "";
}

const declared = new Set();
const errors = [];

/**
 * Titles that are the same word in both languages: the product name, the
 * borrowed "plugins", and the name of the terminal pane. Everything else has
 * to differ, which is what catches a page nobody translated.
 */
const SHARED_TITLES = new Set(["Mash", "Plugins", "Mash Terminal"]);

// --- Every English page and section still resolves ---------------------------

for (const file of files.filter((name) => name.endsWith("meta.json"))) {
  const meta = JSON.parse(readFileSync(new URL(file, root), "utf8"));
  for (const name of meta.pages) {
    const prefix = dirname(file) === "." ? name : join(dirname(file), name);
    const candidate = [`${prefix}.mdx`, join(prefix, "index.mdx")].find(
      (path) => englishPages.includes(path)
    );
    if (candidate) declared.add(candidate);
    else if (!files.includes(join(prefix, "meta.json"))) {
      errors.push(`${file}: missing page or section ${name}`);
    }
  }
}

for (const file of englishPages) {
  if (!declared.has(file)) errors.push(`${file}: missing sidebar entry`);
}

// --- Translations are complete, and nothing else is published ----------------

for (const file of englishPages) {
  if (!files.includes(englishOf(file).replace(/\.mdx$/, ".es.mdx"))) {
    errors.push(`${file}: missing Spanish translation`);
  }
}

for (const file of translatedPages) {
  if (!englishPages.includes(englishOf(file))) {
    errors.push(`${file}: no English original`);
  }
}

for (const file of files) {
  const locale = file.match(/\.([a-z]{2})\.mdx$/)?.[1];
  if (locale && !TRANSLATED.includes(locale)) {
    errors.push(`${file}: ${locale} is not a published locale`);
  }
}

const metas = files.filter((name) => name.endsWith("meta.json"));
for (const file of metas) {
  const spanishFile = file.replace(/\.json$/, ".es.json");
  if (!files.includes(spanishFile)) {
    errors.push(`${file}: missing ${spanishFile}`);
    continue;
  }
  const english = JSON.parse(readFileSync(new URL(file, root), "utf8"));
  const spanish = JSON.parse(readFileSync(new URL(spanishFile, root), "utf8"));
  if (JSON.stringify(english.pages) !== JSON.stringify(spanish.pages)) {
    errors.push(`${spanishFile}: sidebar order differs from ${file}`);
  }
  if (!spanish.title) errors.push(`${spanishFile}: missing section title`);
  if (english.title === spanish.title && !SHARED_TITLES.has(english.title)) {
    errors.push(`${spanishFile}: section title is still English`);
  }
}

for (const file of files.filter((name) => name.endsWith(".es.json"))) {
  if (!files.includes(file.replace(/\.es\.json$/, ".json"))) {
    errors.push(`${file}: no English original`);
  }
}

// --- Each page's own rules, in both languages --------------------------------

/** Frontmatter `title`, for the "was this actually translated" check. */
function titleOf(body) {
  return body.match(/^---\n(?:[\s\S]*?\n)?title:\s*(.+)$/m)?.[1].trim();
}

function bodyWithoutFrontmatter(body) {
  return body.replace(/^---\n[\s\S]*?\n---\n/, "");
}

/**
 * The shape a translation must keep: headings by level, code fences, table
 * rows, list items and link targets. A translated page that drops a step or a
 * row is not the same document, and only the counts can prove it stayed whole.
 */
function shape(body) {
  const text = bodyWithoutFrontmatter(body);
  const count = (pattern) => (text.match(pattern) ?? []).length;

  return {
    headings: [1, 2, 3, 4, 5, 6].map((level) =>
      count(new RegExp(`^${"#".repeat(level)} `, "gm"))
    ),
    fences: count(/^```/gm),
    tableRows: count(/^\|/gm),
    listItems: count(/^\s*(?:[-*]|\d+\.) /gm),
    codeSpans: count(/`[^`\n]+`/g),
  };
}

for (const file of pages) {
  const body = readFileSync(new URL(file, root), "utf8");
  const translated = isTranslation(file);

  if (/!\[[^\]]*\]\(/.test(body))
    errors.push(`${file}: screenshots/images are out of scope`);
  if (/\b\d+\.\d+\.\d+\b/.test(body)) errors.push(`${file}: hardcoded version`);

  const links = translated
    ? /\]\((\/es\/docs\/[^)\s#]*)/g
    : /\]\((\/docs\/[^)\s#]*)/g;
  for (const match of body.matchAll(links)) {
    const known = translated ? translatedUrls : urls;
    if (!known.has(match[1]))
      errors.push(`${file}: broken docs link ${match[1]}`);
  }

  if (translated) {
    // A Spanish page that links into the English tree, or back to the English
    // homepage, drops the reader out of the language they chose.
    for (const match of body.matchAll(/\]\((\/docs\/[^)\s#]*)/g)) {
      errors.push(`${file}: links to English docs ${match[1]}`);
    }
    for (const match of body.matchAll(/\]\((\/)(?:[)\s#])/g)) {
      errors.push(`${file}: links to the English homepage ${match[1]}`);
    }
    const english = englishPages.includes(englishOf(file))
      ? readFileSync(new URL(englishOf(file), root), "utf8")
      : "";
    if (english) {
      const englishTitle = titleOf(english);
      if (englishTitle === titleOf(body) && !SHARED_TITLES.has(englishTitle)) {
        errors.push(`${file}: title is still English`);
      }
      if (bodyWithoutFrontmatter(english) === bodyWithoutFrontmatter(body)) {
        errors.push(`${file}: body is still English`);
      }
      const expected = shape(english);
      const actual = shape(body);
      for (const key of Object.keys(expected)) {
        if (JSON.stringify(expected[key]) !== JSON.stringify(actual[key])) {
          errors.push(
            `${file}: ${key} differ from ${englishOf(file)} (${JSON.stringify(actual[key])} vs ${JSON.stringify(expected[key])})`
          );
        }
      }
    }
  }
}

// --- Coverage ---------------------------------------------------------------

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
    if (slug && englishPages.includes(`${slug}.mdx`)) mapped.add(`${slug}.mdx`);
    else if (slug && englishPages.includes(join(slug, "index.mdx")))
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
  for (const file of englishPages)
    if (!mapped.has(file)) errors.push(`coverage: no row for ${file}`);
  if (mapped.size !== englishPages.length)
    errors.push(
      `coverage: expected ${englishPages.length} page rows, found ${mapped.size}`
    );
}

if (errors.length) {
  console.error(errors.slice(0, 40).join("\n"));
  if (errors.length > 40) console.error(`... ${errors.length - 40} more`);
  process.exitCode = 1;
} else {
  console.log(
    `${englishPages.length} docs pages and ${translatedPages.length} translations: sidebar, links, parity, and coverage resolve`
  );
}
