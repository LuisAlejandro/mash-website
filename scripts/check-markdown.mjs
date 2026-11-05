#!/usr/bin/env node
/**
 * Self-checks for Markdown negotiation, twin routing, and release copy.
 *
 * Run by `make test`, beside the docs and blog checks.
 */
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import { FEATURE_BLOG } from "../lib/features.ts";
import { acceptPrefersMarkdown } from "../lib/markdown/accept-negotiation.ts";
import { DOC_TWIN_PATHS, hasMarkdownTwin } from "../lib/markdown/has-twin.ts";
import { checkRateLimit } from "../lib/mcp/rate-limit.ts";
import {
  getMarketingNarrative,
  latestLine,
  substituteMarketingPlaceholders,
} from "../lib/markdown/marketing-copy.ts";
import { RELEASES_URL } from "../lib/site.ts";
import { buildSiteGraph } from "../lib/structured-data.ts";

const checks = [];

function check(name, fn) {
  checks.push([name, fn]);
}

check("browser Accept keeps HTML", () => {
  assert.equal(
    acceptPrefersMarkdown(
      "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    ),
    false
  );
});

check("text/markdown Accept selects Markdown", () => {
  assert.equal(acceptPrefersMarkdown("text/markdown"), true);
});

check("zero quality and wildcard Accept do not select Markdown", () => {
  assert.equal(acceptPrefersMarkdown("text/markdown;q=0"), false);
  assert.equal(acceptPrefersMarkdown("text/*"), false);
  assert.equal(acceptPrefersMarkdown("*/*"), false);
});

check("quality preference selects the higher-quality representation", () => {
  assert.equal(
    acceptPrefersMarkdown("text/markdown;q=0.9,text/html;q=0.8"),
    true
  );
  assert.equal(
    acceptPrefersMarkdown("text/markdown;q=0.8,text/html;q=0.9"),
    false
  );
});

check("equal quality uses header order", () => {
  assert.equal(
    acceptPrefersMarkdown("text/markdown;q=0.8,text/html;q=0.8"),
    true
  );
  assert.equal(
    acceptPrefersMarkdown("text/html;q=0.8,text/markdown;q=0.8"),
    false
  );
});

check("malformed or duplicate q parameters are ignored", () => {
  assert.equal(
    acceptPrefersMarkdown("text/markdown;q=invalid,text/html;q=0"),
    false
  );
  assert.equal(
    acceptPrefersMarkdown("text/markdown;q=0.8;q=1,text/html;q=0"),
    false
  );
});

check("proxy negotiates only mapped, safe twin paths", () => {
  assert.equal(hasMarkdownTwin([]), true);
  assert.equal(hasMarkdownTwin(["docs", "installation"]), true);
  assert.equal(hasMarkdownTwin(["docs", "not-a-page"]), false);
  assert.equal(hasMarkdownTwin(["docs", ".."]), false);
});

// The blog branch of hasMarkdownTwin is only reachable with the flag on, and
// package.json sets it for this script. Asserted so the check below cannot pass
// by being unreachable.
check("blog twin checks run with the blog flag on", () => {
  assert.equal(FEATURE_BLOG, true);
});

check("blog files with an extension have no Markdown twin", () => {
  assert.equal(hasMarkdownTwin(["blog", "posts", "a-post"]), true);
  assert.equal(hasMarkdownTwin(["blog", "posts", "feed.xml"]), false);
  assert.equal(hasMarkdownTwin(["blog", "posts", "atom.xml"]), false);
  assert.equal(hasMarkdownTwin(["blog", "posts", "feed.json"]), false);
});

check("proxy docs mapping matches the Markdown files", () => {
  const docsRoot = resolve("content/docs");
  const paths = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(path);
      } else if (entry.name.endsWith(".mdx")) {
        let slug = relative(docsRoot, path).replace(/\.mdx$/, "");
        if (slug === "index") slug = "";
        else if (slug.endsWith("/index")) slug = slug.slice(0, -6);
        paths.push(slug);
      }
    }
  };
  visit(docsRoot);
  assert.deepEqual([...DOC_TWIN_PATHS].sort(), paths.sort());
});

check("MCP rate-limit map clears when its size ceiling is reached", () => {
  for (let request = 0; request < 60; request += 1) {
    assert.equal(checkRateLimit("limited-ip").allowed, true);
  }
  assert.equal(checkRateLimit("limited-ip").allowed, false);

  for (let ip = 0; ip < 10_000; ip += 1) {
    assert.equal(checkRateLimit(`flood-${ip}`).allowed, true);
  }
  assert.equal(checkRateLimit("limited-ip").allowed, true);
});

check(
  "marketing substitutions require and resolve derived placeholders",
  () => {
    const narrative = getMarketingNarrative();
    const output = substituteMarketingPlaceholders(
      narrative,
      "derived availability",
      "derived captures"
    );
    assert.ok(!output.includes("{{"));
    assert.throws(
      () => substituteMarketingPlaceholders("{{DERIVED_CAPTURES}}", "", ""),
      /missing DERIVED_AVAILABILITY/
    );
    assert.throws(
      () => substituteMarketingPlaceholders("{{DERIVED_AVAILABILITY}}", "", ""),
      /missing DERIVED_CAPTURES/
    );
    assert.throws(
      () =>
        substituteMarketingPlaceholders(
          "{{DERIVED_AVAILABILITY}} {{DERIVED_CAPTURES}} {{OTHER}}",
          "",
          ""
        ),
      /unresolved placeholder/
    );
  }
);

check(
  "missing and assetless releases make no version or download claim",
  () => {
    const missing = latestLine(null);
    const assetless = latestLine({
      version: "v9.8.7",
      publishedAt: "",
      downloads: {},
    });
    assert.doesNotMatch(missing, /\bv?\d+(?:\.\d+){1,3}\b/);
    assert.doesNotMatch(missing, /https?:\/\//);
    assert.doesNotMatch(assetless, /\bv?\d+(?:\.\d+){1,3}\b/);
  }
);

check("a downloadable release names its version", () => {
  assert.match(
    latestLine({
      version: "v9.8.7",
      publishedAt: "2026-01-01",
      downloads: { mac: "https://example.com/mash.dmg" },
    }),
    /v9\.8\.7/
  );
});

check("null release schema omits version and uses the releases page", () => {
  const graph = buildSiteGraph(null);
  const application = graph["@graph"].find(
    (node) => node["@type"] === "SoftwareApplication"
  );
  assert.ok(application);
  assert.equal("softwareVersion" in application, false);
  assert.equal(application.offers.url, RELEASES_URL);
});

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
  console.error(`\n${failed} of ${checks.length} Markdown checks failed`);
  process.exit(1);
}

console.log(`${checks.length} Markdown checks pass`);
