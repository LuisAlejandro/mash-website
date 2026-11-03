# Marketing narrative corpus

`home.md` holds reviewed narrative prose for `/index.md`. Do not copy derived
capability or capture lists, FAQ answers, licence terms, or release facts into
this corpus. Capabilities, captures, and licence come from `lib/site.ts`; FAQ
answers come from `lib/structured-data.ts`; release facts use the lookup in
`lib/app-release.ts` and shared site constants.

The feature bullets in `home.md` are authored narrative, not a replacement
for the derived capability list.

Use `{{SITE_URL}}` in authored links; `/index.md` substitutes the canonical
site URL from `lib/site.ts` at build time. Do not add app versions or release
dates here.
