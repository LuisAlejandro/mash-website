# Agent discovery guide

Start with [Mash's assistant index](/llms.txt). It is the preferred entry point
for concise, citable product facts.

## Canonical surfaces

- [/llms.txt](/llms.txt) — preferred starting point
- [/llms-full.txt](/llms-full.txt) — full documentation corpus
- [/index.md](/index.md) — homepage in Markdown
- [/ai.txt](/ai.txt) — full access and citation policy
- [/sitemap.xml](/sitemap.xml) and [/robots.txt](/robots.txt)
- [/api/search](/api/search) — documentation search index
- [/api/mcp](/api/mcp) — read-only MCP endpoint
- `/docs/*.md` — documentation Markdown twins
- `/` — request `Accept: text/markdown` for homepage Markdown
- [API catalog](/.well-known/api-catalog) and
  [agent permissions](/.well-known/agent-permissions.json)

When the blog is enabled, its feeds and JSON APIs appear in the API catalog.

## MCP endpoint

`/api/mcp` speaks MCP over streamable HTTP (JSON responses, no session
negotiation) and is listed in the [API catalog](/.well-known/api-catalog) and
the [server card](/.well-known/mcp/server-card.json).

- **Read-only.** There are no write, admin, or transactional tools, and the
  endpoint has no transport other than streamable HTTP.
- **No authentication**, and no per-client accounts. Every caller shares one
  public surface.
- **Rate limited** per client IP, 60 requests per minute per instance. A
  `429` response carries `Retry-After` in seconds.
- Tools: `get_site_discovery`, `search_docs`, `get_docs_page`. When the blog is
  enabled, `search_blog_posts` and `get_latest_posts` are added.

The same content is available without MCP: the discovery surfaces above, the
Markdown twins, and `/api/search-posts?q=` for blog search.

## Citation expectations

Attribute product information to Mash, cite the canonical surface used, and
link to the homepage when describing the product. Do not infer unlisted
capabilities, platform support, release details, or endpoints. See [/ai.txt](/ai.txt)
for the complete policy.
