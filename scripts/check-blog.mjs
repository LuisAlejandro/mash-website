/**
 * Self-check for the blog's pure logic.
 *
 * These three functions decide who may publish, what a post's URL becomes, and
 * what gets shown in a list. They have no database or network to mock, so they
 * are checked directly rather than left to a browser pass. Node's own type
 * stripping imports the TypeScript sources, so this needs no test framework
 * and no build step.
 *
 * Run by `make test`, beside scripts/check-docs.mjs.
 */
import assert from "node:assert/strict";

import {
  isAllowlistedAdminEmail,
  parseAdminEmailAllowlist,
} from "../lib/auth/allowlist.ts";
import { excerptFromBody } from "../lib/blog/excerpt.ts";

const checks = [];

function check(name, fn) {
  checks.push([name, fn]);
}

// --- Allowlist: fail-closed ------------------------------------------------

check("an unset allowlist admits nobody", () => {
  // The parser defaults to the ambient variable, so "unset" has to mean
  // actually unset. Reading whatever the environment happens to hold made this
  // check pass only on a machine with no allowlist configured.
  const saved = process.env.ADMIN_EMAIL_ALLOWLIST;
  delete process.env.ADMIN_EMAIL_ALLOWLIST;
  try {
    assert.equal(
      isAllowlistedAdminEmail("anyone@example.com", new Set()),
      false
    );
    assert.equal(parseAdminEmailAllowlist().size, 0);
    assert.equal(parseAdminEmailAllowlist("").size, 0);
    assert.equal(parseAdminEmailAllowlist("   ").size, 0);
  } finally {
    if (saved !== undefined) process.env.ADMIN_EMAIL_ALLOWLIST = saved;
  }
});

check("a listed address is admitted regardless of case or padding", () => {
  const list = parseAdminEmailAllowlist("  Maintainer@Example.com , b@x.io ");
  assert.equal(isAllowlistedAdminEmail("maintainer@example.com", list), true);
  assert.equal(
    isAllowlistedAdminEmail("  MAINTAINER@EXAMPLE.COM ", list),
    true
  );
  assert.equal(isAllowlistedAdminEmail("b@x.io", list), true);
});

check("an unlisted or missing address is refused", () => {
  const list = parseAdminEmailAllowlist("maintainer@example.com");
  assert.equal(isAllowlistedAdminEmail("someone@else.com", list), false);
  assert.equal(isAllowlistedAdminEmail(null, list), false);
  assert.equal(isAllowlistedAdminEmail(undefined, list), false);
  assert.equal(isAllowlistedAdminEmail("", list), false);
  // Substring matches must not pass.
  assert.equal(
    isAllowlistedAdminEmail("maintainer@example.com.evil.io", list),
    false
  );
});

// --- Excerpts --------------------------------------------------------------

check("an excerpt drops markdown scaffolding but keeps link text", () => {
  const excerpt = excerptFromBody(
    "# Title\n\nSome [linked words](https://example.com) and `code`."
  );
  assert.ok(excerpt.includes("linked words"), excerpt);
  assert.ok(!excerpt.includes("https://example.com"), excerpt);
  assert.ok(!excerpt.includes("#"), excerpt);
});

check("an excerpt drops fenced code rather than opening with it", () => {
  const excerpt = excerptFromBody(
    "```bash\nrm -rf /\n```\n\nThe prose that should surface."
  );
  assert.ok(!excerpt.includes("rm -rf"), excerpt);
  assert.ok(excerpt.startsWith("The prose"), excerpt);
});

check("a long excerpt is truncated with an ellipsis", () => {
  const excerpt = excerptFromBody("word ".repeat(200), 50);
  assert.ok(excerpt.length <= 51, String(excerpt.length));
  assert.ok(excerpt.endsWith("…"), excerpt);
});

check("a short body is returned whole, with no ellipsis", () => {
  assert.equal(excerptFromBody("Just a sentence."), "Just a sentence.");
});

// --- Run -------------------------------------------------------------------

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
  console.error(`\n${failed} of ${checks.length} blog checks failed`);
  process.exit(1);
}

console.log(`${checks.length} blog checks pass: allowlist and excerpts`);
