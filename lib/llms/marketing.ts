import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export function getMarketingNarrative(): string {
  return readFileSync(
    resolve(process.cwd(), "content/llms/home.md"),
    "utf8",
  ).trim();
}
