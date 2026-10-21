export const dynamic = "force-static";

/**
 * robots.txt is a plain-text route rather than `app/robots.ts` because the
 * Content-Signal directive has no field in Next's MetadataRoute.Robots.
 *
 * Signal choice: letsma.sh exists to be found, quoted, and cited, and Mash is
 * GPL-3.0-or-later. Opting out of model training would gain the product nothing
 * and sit awkwardly beside its licence, so all three signals are `yes`. Flip
 * AI_TRAIN to "no" to withhold the page from training corpora while still
 * allowing real-time answer-engine use.
 */
const AI_TRAIN = "yes";

const CONTENT_SIGNAL = `search=yes, ai-input=yes, ai-train=${AI_TRAIN}`;

const BASE_URL = "https://letsma.sh";

const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "Bingbot",
  "CCBot",
  "meta-externalagent",
];

function crawlerBlock(userAgent: string): string {
  return `User-agent: ${userAgent}\nAllow: /\nContent-Signal: ${CONTENT_SIGNAL}\n`;
}

export function GET() {
  const body = `# ${BASE_URL}
# Public product page. Free and open source under GPL-3.0-or-later.

User-agent: *
Allow: /
Content-Signal: ${CONTENT_SIGNAL}

# Named AI crawlers and answer engines, declared explicitly rather than
# relying on the wildcard so the policy is visible to each operator.
${AI_CRAWLERS.map(crawlerBlock).join("\n")}
Sitemap: ${BASE_URL}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
