#!/usr/bin/env node
/**
 * Self-checks for the two-language site.
 *
 * Two questions, both cheap to answer and expensive to forget:
 *
 * 1. Does every locale carry the same copy? A missing row or a shorter list
 *    would ship an English string, or a heading with no sentence, under a
 *    Spanish URL. The structural walk below compares English and Spanish key
 *    by key, so a half-finished translation fails here instead of in front of
 *    a reader.
 * 2. Is every rendered route inside a root layout, and is the language control
 *    pointing at a page that exists?
 *
 * Run by `make test`, beside the docs, blog and Markdown checks.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";

import { FACTS } from "../lib/i18n/facts.ts";
import {
  DEFAULT_LOCALE,
  LOCALES,
  homeHref,
  localePrefix,
  otherLocale,
} from "../lib/i18n/locale.ts";
import { MARKETING } from "../lib/i18n/marketing.ts";
import { UI } from "../lib/i18n/ui.ts";

const checks = [];

function check(name, fn) {
  checks.push([name, fn]);
}

const appRoot = new URL("../app/", import.meta.url);
const assetRoot = new URL("../public/assets/mash/", import.meta.url);
const source = (path) => readFileSync(new URL(path, appRoot), "utf8");
const walk = (dir) => readdirSync(new URL(dir, appRoot), { recursive: true });
const appFiles = walk("")
  .map(String)
  .filter((path) => !path.endsWith("/"));

/** Every leaf string in a copy tree, with its key path. */
function leaves(value, path = "", into = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => leaves(item, `${path}[${index}]`, into));
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      leaves(item, path ? `${path}.${key}` : key, into);
    }
  } else {
    into.push([path, value]);
  }
  return into;
}

/**
 * Walk two copy trees together. Returns the mismatches: a key only one locale
 * has, a list of a different length, or a value of a different kind. Function
 * values are compared by name only, since only their arity matters here.
 */
function mismatches(en, es, path = "", errors = []) {
  const where = path || "(root)";

  if (Array.isArray(en)) {
    if (!Array.isArray(es)) {
      errors.push(`${where}: expected a list`);
      return errors;
    }
    if (en.length !== es.length) {
      errors.push(`${where}: ${en.length} rows in en, ${es.length} in es`);
      return errors;
    }
    en.forEach((item, index) =>
      mismatches(item, es[index], `${where}[${index}]`, errors)
    );
    return errors;
  }

  if (en && typeof en === "object") {
    if (!es || typeof es !== "object" || Array.isArray(es)) {
      errors.push(`${where}: expected an object`);
      return errors;
    }
    for (const key of new Set([...Object.keys(en), ...Object.keys(es)])) {
      if (!(key in en)) errors.push(`${where}.${key}: missing in en`);
      else if (!(key in es)) errors.push(`${where}.${key}: missing in es`);
      else mismatches(en[key], es[key], `${where}.${key}`, errors);
    }
    return errors;
  }

  if (typeof en !== typeof es) {
    errors.push(`${where}: ${typeof en} in en, ${typeof es} in es`);
  }
  return errors;
}

/** Short strings may legitimately match: product names, units, chords. */
const SHARED_STRINGS = new Set([
  "Herdr, Ghostty, Starship, Pi, Fresh",
  "mash — herdr-review",
  "Worktrees",
]);

/**
 * A sentence in English and a sentence in Spanish are never the same sentence,
 * so two identical long strings mean a row was copied and never translated.
 * Short values are exempt because proper nouns are supposed to repeat.
 */
const MIN_TRANSLATED_LENGTH = 25;

function untranslated(copyTrees) {
  const found = [];
  for (const [tree, name] of copyTrees) {
    const en = new Map(leaves(tree.en));
    for (const [key, value] of leaves(tree.es)) {
      if (typeof value !== "string" || value.length < MIN_TRANSLATED_LENGTH)
        continue;
      if (SHARED_STRINGS.has(value)) continue;
      if (en.get(key) === value) found.push(`${name}.${key}: still English`);
    }
  }
  return found;
}

const COPY_TREES = [
  [FACTS, "facts"],
  [UI, "ui"],
  [MARKETING, "marketing"],
];

// --- Locale registry --------------------------------------------------------

check("English is the default and keeps the unprefixed paths", () => {
  assert.deepEqual([...LOCALES], ["en", "es"]);
  assert.equal(DEFAULT_LOCALE, "en");
  assert.equal(localePrefix("en"), "");
  assert.equal(homeHref("en"), "/");
  assert.equal(localePrefix("es"), "/es");
  assert.equal(homeHref("es"), "/es/");
});

check("the language control leads to the other published locale", () => {
  assert.equal(otherLocale("en"), "es");
  assert.equal(otherLocale("es"), "en");
  for (const locale of LOCALES) {
    assert.notEqual(otherLocale(locale), locale);
    assert.ok(LOCALES.includes(otherLocale(locale)));
  }
});

check(
  "every locale has a copy of the facts, the chrome and the homepage",
  () => {
    for (const locale of LOCALES) {
      for (const [tree, name] of COPY_TREES) {
        assert.ok(tree[locale], `${name}: no copy for ${locale}`);
      }
    }
    // An extra key would be copy nothing renders, so the keys are the locales.
    for (const [tree, name] of COPY_TREES) {
      assert.deepEqual(Object.keys(tree).sort(), [...LOCALES].sort(), name);
    }
  }
);

// --- Copy parity ------------------------------------------------------------

check("Spanish copy has every row English has, in the same order", () => {
  for (const [tree, name] of COPY_TREES) {
    const errors = mismatches(tree.en, tree.es);
    assert.deepEqual(errors.slice(0, 10), [], name);
  }
});

check("page copy is translated, not copied", () => {
  const found = untranslated(COPY_TREES);
  assert.deepEqual(found.slice(0, 10), []);
});

// --- Routes ----------------------------------------------------------------

check("the homepage is defined inside a root layout, not above one", () => {
  assert.equal(appFiles.includes("layout.tsx"), false);
  assert.equal(appFiles.includes("page.tsx"), false);
  assert.ok(appFiles.includes("(english)/page.tsx"));
  assert.ok(appFiles.includes("es/page.tsx"));
});

check("every rendered page route sits under exactly one root layout", () => {
  const pages = appFiles.filter(
    (path) => path.endsWith("/page.tsx") || path === "page.tsx"
  );
  assert.ok(pages.length > 0);
  for (const page of pages) {
    const root = ["(english)/", "es/"].find((prefix) =>
      page.startsWith(prefix)
    );
    assert.ok(root, `${page}: no root layout above it`);
    assert.ok(appFiles.includes(`${root}layout.tsx`), `${root}: no layout`);
  }
});

check("each root layout declares the language it publishes", () => {
  for (const [layout, locale] of [
    ["(english)/layout.tsx", "en"],
    ["es/layout.tsx", "es"],
  ]) {
    const body = source(layout);
    assert.match(body, /<html lang=\{LOCALE\}/, `${layout}: dynamic lang`);
    assert.match(body, new RegExp(`const LOCALE = "${locale}"`), layout);
  }
});

check(
  "API and generated text endpoints stay outside the HTML root layouts",
  () => {
    const endpoints = [
      "api/mcp/route.ts",
      "api/search/route.ts",
      "ai.txt/route.ts",
      "index.md/route.ts",
      "llms-full.txt/route.ts",
      "llms.txt/route.ts",
      "robots.txt/route.ts",
      "sitemap.ts",
      ".well-known/api-catalog/route.ts",
      ".well-known/agent-permissions.json/route.ts",
    ];
    for (const endpoint of endpoints) {
      assert.ok(
        appFiles.includes(endpoint),
        `${endpoint}: moved under a layout`
      );
    }
  }
);

check("the optional blog is English-only", () => {
  assert.ok(appFiles.some((path) => path.startsWith("(english)/blog/")));
  assert.ok(!appFiles.some((path) => path.startsWith("es/blog")));
});

check("the homepage renders the language control and its own metadata", () => {
  const page = source("components/home-page.tsx");
  assert.match(page, /languageHref=\{homeHref\(otherLocale\(locale\)\)\}/);
  const layout = source("(english)/layout.tsx");
  assert.match(layout, /canonical: homeHref\(LOCALE\)/);
  assert.match(source("es/layout.tsx"), /canonical: homeHref\(LOCALE\)/);
});

check("the docs publish both languages from one locale-aware source", () => {
  const docs = readFileSync(
    new URL("../lib/i18n/docs.ts", import.meta.url),
    "utf8"
  );
  assert.match(
    docs,
    /hideLocale:\s*"default-locale"/,
    "English must stay unprefixed"
  );
  assert.match(
    docs,
    /parser:\s*"dot"/,
    "translations live beside their source"
  );
  assert.match(docs, /fallbackLanguage:\s*null/, "no English fallback");

  const sourceFile = readFileSync(
    new URL("../lib/source.ts", import.meta.url),
    "utf8"
  );
  assert.match(sourceFile, /i18n:\s*docsI18n/, "loader is not locale-aware");
  assert.match(
    sourceFile,
    /docsInventory\(locale/,
    "inventory ignored the locale"
  );

  assert.ok(appFiles.includes("es/docs/[[...slug]]/page.tsx"));
  assert.ok(appFiles.includes("es/docs/layout.tsx"));
  assert.ok(appFiles.includes("(english)/docs/[[...slug]]/page.tsx"));

  const page = source("es/docs/[[...slug]]/page.tsx");
  assert.match(page, /locale="es"/, "Spanish route renders English");

  const search = source("api/search/route.ts");
  assert.match(
    search,
    /createFromSource\(source, \{ localeFilter: true \}\)/,
    "search ignores the locale"
  );
});

check("Spanish discovery endpoints exist and serve Spanish builders", () => {
  const routes = {
    "es/index.md/route.ts": /marketingMarkdown\("es"\)/,
    "es/llms-full.txt/route.ts": /buildLlmsFull\("es"\)/,
    "es/llms.txt/route.ts": /es\/llms\.txt/,
    "es/ai.txt/route.ts": /es\/docs\//,
    "es/agents.md/route.ts": /agents\.es\.md/,
    "es/.well-known/api-catalog/route.ts": /discoverySurfaces\("es"\)/,
  };

  for (const [route, pattern] of Object.entries(routes)) {
    assert.ok(appFiles.includes(route), `${route}: missing`);
    assert.match(source(route), pattern, `${route}: not localized`);
  }

  assert.ok(
    existsSync(new URL("../content/llms/home.es.md", import.meta.url)),
    "content/llms/home.es.md: missing"
  );
  assert.ok(
    existsSync(new URL("../content/llms/agents.es.md", import.meta.url)),
    "content/llms/agents.es.md: missing"
  );
});

check("the MCP locale argument is optional and defaults to English", () => {
  const server = readFileSync(
    new URL("../lib/mcp/create-server.ts", import.meta.url),
    "utf8"
  );
  // A locale declared in the registry but wired as a required string would
  // break every existing caller, so the schema has to follow `required`.
  assert.match(server, /const required = new Set<string>\(/, "required fields");
  assert.match(server, /required\.has\(key\) \? base : base\.optional\(\)/);
  assert.match(server, /function localeOf\(value: string \| undefined\)/);

  const registry = readFileSync(
    new URL("../lib/mcp/tool-registry.ts", import.meta.url),
    "utf8"
  );
  assert.match(registry, /locale: \{ type: "string"/);
  // `locale` must never join the required list.
  assert.doesNotMatch(registry, /required: \[[^\]]*locale/);
});

check("the Spanish catalog lists Spanish documents only", () => {
  const catalog = readFileSync(
    new URL("../lib/discovery/surfaces.ts", import.meta.url),
    "utf8"
  );
  // The localized branch builds its URLs from the locale prefix, and the docs
  // twins from the localized inventory: neither can produce an English path.
  const localized = catalog.slice(
    catalog.indexOf("export function discoverySurfaces")
  );
  assert.match(localized, /docsInventory\(locale\)/, "twins are not localized");
  assert.match(localized, /prefix = `\$\{SITE_URL\}\/\$\{locale\}`/);
  assert.doesNotMatch(localized, /docsInventory\(\)/, "English twins leaked");
});

check("the sitemap declares alternates and both homepages", () => {
  const sitemap = readFileSync(
    new URL("../app/sitemap.ts", import.meta.url),
    "utf8"
  );
  assert.match(sitemap, /languageAlternates/, "no hreflang");
  assert.match(sitemap, /\$\{SITE_URL\}\/es\//, "no Spanish homepage");
  assert.match(sitemap, /counterpartHref/, "docs pairs are not reciprocal");
});

check(
  "the Markdown proxy covers the Spanish tree without redressing the blog",
  () => {
    const body = readFileSync(new URL("../proxy.ts", import.meta.url), "utf8");
    assert.ok(
      body.includes('"/es", "/es/:path*"'),
      "Spanish paths are not matched"
    );
    assert.doesNotMatch(body, /Accept-Language/i);
    assert.doesNotMatch(body, /redirect\(/i);

    const config = readFileSync(
      new URL("../next.config.ts", import.meta.url),
      "utf8"
    );
    assert.ok(
      config.includes('source: "/es/:path*"'),
      "no Vary on Spanish paths"
    );
  }
);

// --- Captions ---------------------------------------------------------------

const captions = readdirSync(assetRoot).filter((name) =>
  name.endsWith(".en.vtt")
);

/** The cue timings of a WebVTT file, in order. */
function cueTimes(body) {
  return body
    .split(/\r?\n/)
    .filter((line) => line.includes("-->"))
    .map((line) => line.trim());
}

/** The spoken text of each cue, one entry per cue. */
function cueText(body) {
  const lines = body.split(/\r?\n/);
  const text = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].includes("-->")) continue;
    const spoken = [];
    index += 1;
    while (index < lines.length && lines[index].trim() !== "") {
      spoken.push(lines[index].trim());
      index += 1;
    }
    text.push(spoken.join(" "));
  }
  return text;
}

check("every English caption track has a Spanish one on the same cues", () => {
  assert.ok(captions.length > 0);
  for (const name of captions) {
    const spanish = name.replace(/\.en\.vtt$/, ".es.vtt");
    assert.ok(existsSync(new URL(spanish, assetRoot)), `${spanish}: missing`);

    const en = readFileSync(new URL(name, assetRoot), "utf8");
    const es = readFileSync(new URL(spanish, assetRoot), "utf8");
    assert.deepEqual(cueTimes(es), cueTimes(en), `${spanish}: cue times`);
    assert.deepEqual(
      cueText(es).length,
      cueText(en).length,
      `${spanish}: cue count`
    );
    cueText(es).forEach((line, cue) => {
      assert.notEqual(
        line,
        cueText(en)[cue],
        `${spanish}: cue ${cue + 1} is English`
      );
    });
  }
});

check("each language leads with its own caption track", () => {
  // The film audio is English; the reader who chose Spanish still expects the
  // Spanish captions open first, so `default` follows the page language.
  for (const file of [
    "components/hero.tsx",
    "components/feature-spotlights.tsx",
  ]) {
    const body = source(file);
    assert.match(body, /default=\{locale === "en"\}/, `${file}: English`);
    assert.match(body, /default=\{locale === "es"\}/, `${file}: Spanish`);
  }
});

// --- Run --------------------------------------------------------------------

let failed = 0;

for (const [name, fn] of checks) {
  try {
    fn();
  } catch (error) {
    failed += 1;
    console.error(`FAIL  ${name}`);
    console.error(`      ${error.message.split("\n").join("\n      ")}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} of ${checks.length} locale checks failed`);
  process.exit(1);
}

console.log(
  `${checks.length} locale checks pass: ${LOCALES.join(", ")} copy, routes and captions`
);
