import { execFile } from "node:child_process";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";

const run = promisify(execFile);

/**
 * Modification time from Git history, for the sitemap's docs entries.
 *
 * The collection's built-in `lastModified: true` shells out to `git` and dies
 * when the binary is absent — which it is in the dev container, where the build
 * is otherwise expected to pass. This does the same lookup and returns
 * `undefined` when Git is missing or the file is uncommitted, so a checkout
 * without history costs a sitemap date instead of a build.
 *
 * ponytail: one `git log` per page, memoized. Fine for ~31 docs pages; batch
 * into a single `git log --name-only` walk if the corpus grows.
 */
const gitAvailable = { value: true as boolean };
const mtimes = new Map<string, Date | undefined>();

async function lastModifiedFromGit(
  filePath: string
): Promise<Date | undefined> {
  if (!gitAvailable.value) return undefined;

  const absolute = resolve(process.cwd(), filePath);
  if (mtimes.has(absolute)) return mtimes.get(absolute);

  try {
    const { stdout } = await run(
      "git",
      ["log", "-1", "--format=%cI", "--", absolute],
      { cwd: process.cwd() }
    );
    const stamp = stdout.trim();
    const date = stamp ? new Date(stamp) : undefined;
    const value = date && !Number.isNaN(date.getTime()) ? date : undefined;
    mtimes.set(absolute, value);
    return value;
  } catch {
    // No Git binary here. Stop trying, and omit every date.
    gitAvailable.value = false;
    return undefined;
  }
}

/**
 * The documentation lives beside the marketing page rather than in a second
 * site: Fumadocs compiles it into the same Next build that Netlify already
 * deploys. `content/docs` is the only source directory.
 */
export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    // Exposes the processed Markdown of each page, which the discovery
    // surfaces need: llms-full.txt and the .md twins read the same text a
    // reader gets on the page rather than a second hand-written copy.
    postprocess: { includeProcessedMarkdown: true },
    lastModified: lastModifiedFromGit,
  },
});

export default defineConfig();
