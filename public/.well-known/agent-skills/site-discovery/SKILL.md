---
name: site-discovery
type: text/markdown
description: Enumerate Mash's published surfaces from /llms.txt and the API catalog.
---
# site-discovery

Enumerate Mash's published surfaces from /llms.txt and the API catalog.

Start with [/llms.txt](/llms.txt), then fetch the
[API catalog](/.well-known/api-catalog) and follow its `item` links. The catalog
reflects the surfaces available in this deployment, including whether optional
blog endpoints are enabled. Use the linked documentation Markdown twins or
[/llms-full.txt](/llms-full.txt) for page content. Read [/ai.txt](/ai.txt) for
citation and access policy.
