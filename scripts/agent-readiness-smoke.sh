#!/usr/bin/env bash
#
# Agent readiness smoke check.
#
# Probes a *running* deployment for every surface a machine client is promised:
# the discovery documents, Markdown twins, Accept negotiation, cache tags, the
# skills digest index and the MCP endpoint. It is deliberately not part of
# `make test`, because it needs a served URL rather than a build.
#
#   scripts/agent-readiness-smoke.sh [base-url]
#   BASE_URL=https://letsma.sh scripts/agent-readiness-smoke.sh
#   make smoke BASE_URL=https://letsma.sh
#
# Exit codes:
#   0  every assertion passed
#   1  at least one assertion failed
#   2  the base URL did not answer, so nothing was asserted

set -euo pipefail

BASE_URL=${1:-${BASE_URL:-http://localhost:3000}}
BASE_URL=${BASE_URL%/}

EXIT_ASSERTION=1
EXIT_UNAVAILABLE=2

PASSES=0
FAILURES=0
STATUS=''
REQUEST_URL=''
BLOG_ENABLED=no

if [[ -t 1 ]]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  NC='\033[0m'
else
  RED=''
  GREEN=''
  YELLOW=''
  NC=''
fi

print_pass() { PASSES=$((PASSES + 1)); echo -e "  ${GREEN}PASS${NC}  $1"; }
print_fail() { FAILURES=$((FAILURES + 1)); echo -e "  ${RED}FAIL${NC}  $1"; }
print_skip() { echo -e "  ${YELLOW}SKIP${NC}  $1"; }
print_note() { echo "        $1"; }
print_section() { echo; echo "$1"; }

if ! command -v curl >/dev/null 2>&1; then
  echo "UNAVAILABLE  curl is not installed, so no assertion could run." >&2
  exit "$EXIT_UNAVAILABLE"
fi

SMOKE_DIR=$(mktemp -d "${TMPDIR:-/tmp}/agent-readiness-smoke.XXXXXX")
trap 'rm -rf "$SMOKE_DIR"' EXIT
BODY_FILE="$SMOKE_DIR/body"
HEADER_FILE="$SMOKE_DIR/headers"
ERROR_FILE="$SMOKE_DIR/curl-error"

# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------

# Run one request. The response body, the headers and the status land in the
# shared files above so a caller never repeats a request to read a second field.
run_curl() { # <follow:yes|no> <path-or-url> [curl flags...]
  local follow=$1
  local target=$2
  shift 2

  case "$target" in
    http://* | https://*) REQUEST_URL=$target ;;
    *) REQUEST_URL="$BASE_URL$target" ;;
  esac

  : >"$BODY_FILE"
  : >"$HEADER_FILE"
  : >"$ERROR_FILE"

  local -a follow_flags=()
  [[ $follow == yes ]] && follow_flags=(--location)

  if STATUS=$(curl --silent --show-error --max-time 25 \
    "${follow_flags[@]+"${follow_flags[@]}"}" \
    --dump-header "$HEADER_FILE" --output "$BODY_FILE" \
    --write-out '%{http_code}' "$@" -- "$REQUEST_URL" 2>"$ERROR_FILE"); then
    return 0
  fi

  STATUS=000
  return 1
}

request() { run_curl yes "$@"; }
request_raw() { run_curl no "$@"; }

describe_error() {
  if [[ -s $ERROR_FILE ]]; then
    tr '\n' ' ' <"$ERROR_FILE"
  else
    echo 'transport error'
  fi
}

# Header values of the *final* response only: a followed redirect leaves one
# header block per hop in the dump, and a stale hop must never answer for it.
header_values() {
  awk -v want="$1" '
    BEGIN { RS = "" }
    { last = $0 }
    END {
      count = split(last, lines, "\n")
      for (i = 1; i <= count; i++) {
        line = lines[i]
        sub(/\r$/, "", line)
        colon = index(line, ":")
        if (colon == 0) continue
        if (tolower(substr(line, 1, colon - 1)) != tolower(want)) continue
        value = substr(line, colon + 1)
        sub(/^[ \t]*/, "", value)
        print value
      }
    }
  ' "$HEADER_FILE"
}

content_type() {
  header_values content-type |
    tail -n 1 |
    sed 's/;.*//' |
    tr -d '[:space:]' |
    tr '[:upper:]' '[:lower:]'
}

# Comma-separated header tokens, trimmed and lowercased, compared for equality.
# A substring test is wrong here: `accept-encoding` must not satisfy `accept`.
header_has_token() { # <header> <expected token>
  local values token
  values=$(header_values "$1" | tr '[:upper:]' '[:lower:]')
  while IFS= read -r token; do
    token=${token#"${token%%[![:space:]]*}"}
    token=${token%"${token##*[![:space:]]}"}
    [[ -z $token ]] && continue
    if [[ $token == "$2" ]]; then
      return 0
    fi
  done < <(printf '%s\n' "$values" | tr ',' '\n')
  return 1
}

assert_media_type() { # <label> <path> <expected media types> [accept]
  local label=$1
  local path=$2
  local expected=$3
  local accept=${4:-}
  local -a extra=()
  [[ -n $accept ]] && extra=(-H "Accept: $accept")

  if ! request "$path" "${extra[@]+"${extra[@]}"}"; then
    print_fail "$label — no response ($(describe_error))"
    return
  fi

  if [[ $STATUS != 200 ]]; then
    print_fail "$label — expected 200, got $STATUS"
    return
  fi

  local got
  local alt
  local matched=no
  got=$(content_type)
  for alt in $expected; do
    if [[ $got == "$alt" ]]; then
      matched=yes
    fi
  done

  if [[ $matched == yes ]]; then
    print_pass "$label — 200 $got"
  else
    print_fail "$label — expected $expected, got ${got:-no content-type}"
  fi
}

sha256_of() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" | awk '{print $1}'
  else
    echo ''
  fi
}

# ---------------------------------------------------------------------------
# Reachability, before any assertion
# ---------------------------------------------------------------------------

echo "Agent readiness smoke check"
echo "Base URL: $BASE_URL"

if ! request /; then
  echo -e "${RED}UNAVAILABLE${NC}  $BASE_URL did not answer: $(describe_error)" >&2
  echo "No assertion was attempted; start the site or pass a deployed URL." >&2
  exit "$EXIT_UNAVAILABLE"
fi

if [[ $STATUS == 200 ]]; then
  print_pass "GET / — 200, the site answers"
else
  print_fail "GET / — expected 200, got $STATUS"
fi

# The blog flag decides which extra surfaces and tools are expected. It is read
# once here rather than guessed from the environment the script happens to run in.
if request /blog/; then
  if [[ $STATUS == 200 ]]; then
    BLOG_ENABLED=yes
  fi
fi

# ---------------------------------------------------------------------------
# Discovery surfaces
# ---------------------------------------------------------------------------

print_section "Discovery surfaces"

assert_media_type "GET /llms.txt" /llms.txt text/plain
assert_media_type "GET /llms-full.txt" /llms-full.txt text/markdown
assert_media_type "GET /index.md" /index.md text/markdown
assert_media_type "GET /ai.txt" /ai.txt text/plain
assert_media_type "GET /agents.md" /agents.md text/markdown
assert_media_type "GET /.well-known/api-catalog" /.well-known/api-catalog application/linkset+json
assert_media_type "GET /.well-known/agent-permissions.json" /.well-known/agent-permissions.json application/json
assert_media_type "GET /.well-known/agent-skills/index.json" /.well-known/agent-skills/index.json application/json
assert_media_type "GET /sitemap.xml" /sitemap.xml 'application/xml text/xml'
assert_media_type "GET /robots.txt" /robots.txt text/plain

# ---------------------------------------------------------------------------
# Link header: both discovery relations on one HTML page
# ---------------------------------------------------------------------------

print_section "Link header"

if request /docs/; then
  link_values=$(header_values link | tr -d '\r' | tr '\n' ' ')
  if [[ $link_values == *'rel="describedby"'* && $link_values == *'rel="api-catalog"'* ]]; then
    print_pass "GET /docs/ — Link carries describedby and api-catalog"
  else
    print_fail "GET /docs/ — Link is missing a relation: ${link_values:-<no Link header>}"
  fi
else
  print_fail "GET /docs/ — no response ($(describe_error))"
fi

# ---------------------------------------------------------------------------
# Cache tags: netlify.toml headers never reach a function response, so only a
# header set by next.config.ts or the handler itself can tag this sitemap.
# ---------------------------------------------------------------------------

print_section "Cache tags"

if request /sitemap.xml; then
  if [[ $STATUS != 200 ]]; then
    print_fail "GET /sitemap.xml — expected 200, got $STATUS"
  elif header_has_token netlify-cache-tag sitemap; then
    print_pass "GET /sitemap.xml — Netlify-Cache-Tag carries sitemap"
  else
    sitemap_tags=$(header_values netlify-cache-tag | tr -d '\r' | tr '\n' ' ')
    print_fail "GET /sitemap.xml — Netlify-Cache-Tag is missing sitemap: ${sitemap_tags:-<absent>}"
  fi
else
  print_fail "GET /sitemap.xml — no response ($(describe_error))"
fi

# ---------------------------------------------------------------------------
# Accept negotiation on one canonical docs URL
# ---------------------------------------------------------------------------

print_section "Accept negotiation"

CANONICAL=/docs/
BROWSER_ACCEPT='text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
MARKDOWN_ACCEPT=text/markdown

assert_media_type "GET $CANONICAL (browser Accept)" "$CANONICAL" text/html "$BROWSER_ACCEPT"

if request "$CANONICAL" -H "Accept: $MARKDOWN_ACCEPT"; then
  negotiated_status=$STATUS
  negotiated_type=$(content_type)
  if [[ $negotiated_status == 200 && $negotiated_type == text/markdown ]]; then
    print_pass "GET $CANONICAL (Accept: text/markdown) — 200 text/markdown"
    cp "$BODY_FILE" "$SMOKE_DIR/negotiated-md"
  else
    print_fail "GET $CANONICAL (Accept: text/markdown) — expected 200 text/markdown, got $negotiated_status ${negotiated_type:-no content-type}"
  fi

  cache_control=$(header_values cache-control | tr -d '\r' | tr '\n' ' ' | tr '[:upper:]' '[:lower:]')
  if [[ $cache_control == *no-store* ]]; then
    print_pass "GET $CANONICAL (Accept: text/markdown) — Cache-Control keeps it out of caches"
  else
    print_fail "GET $CANONICAL (Accept: text/markdown) — Cache-Control lacks no-store: ${cache_control:-<absent>}"
  fi

  vary_values=$(header_values vary | tr -d '\r' | tr '\n' ',' | sed 's/,$//')
  if header_has_token vary accept; then
    print_pass "GET $CANONICAL (Accept: text/markdown) — Vary carries the exact token accept"
  else
    print_fail "GET $CANONICAL (Accept: text/markdown) — Vary lacks the exact token accept"
    print_note "Vary: ${vary_values:-<absent>} (a value of accept-encoding alone is not accept)"
  fi
else
  print_fail "GET $CANONICAL (Accept: text/markdown) — no response ($(describe_error))"
  negotiated_status=000
  negotiated_type=''
fi

assert_media_type "GET $CANONICAL (Accept: text/markdown;q=0)" "$CANONICAL" text/html 'text/markdown;q=0'

UNKNOWN_PATH=/agent-readiness-smoke-unknown-page/
if request "$UNKNOWN_PATH" -H "Accept: $MARKDOWN_ACCEPT"; then
  unknown_type=$(content_type)
  if [[ $unknown_type == text/markdown ]]; then
    print_fail "GET $UNKNOWN_PATH (Accept: text/markdown) — an unknown path served Markdown"
  elif [[ $STATUS != 404 ]]; then
    print_fail "GET $UNKNOWN_PATH (Accept: text/markdown) — expected 404 HTML, got $STATUS ${unknown_type:-no content-type}"
  else
    print_pass "GET $UNKNOWN_PATH (Accept: text/markdown) — 404 $unknown_type, no Markdown"
  fi
else
  print_fail "GET $UNKNOWN_PATH (Accept: text/markdown) — no response ($(describe_error))"
fi

# ---------------------------------------------------------------------------
# Request ordering: one shared cache must not hand either representation the
# body that belongs to the other. Each ordering is compared against isolated
# requests for the same URL.
# ---------------------------------------------------------------------------

capture_body() { # <file> <path> [accept]: one 200 response, saved for comparing
  local file=$1
  local path=$2
  local accept=${3:-}
  local -a extra=()
  [[ -n $accept ]] && extra=(-H "Accept: $accept")

  if ! request "$path" "${extra[@]+"${extra[@]}"}"; then
    print_fail "GET $path — no response ($(describe_error))"
    return 1
  fi
  if [[ $STATUS != 200 ]]; then
    print_fail "GET $path — expected 200, got $STATUS"
    return 1
  fi

  # Next's dev server stamps a per-render nonce (`self.__next_r="…"`) into the
  # HTML. It is random on every response, so comparison happens after it is
  # blanked; everything else stays byte-exact.
  sed -E 's/self\.__next_r="[^"]*"/self.__next_r="nonce"/g' \
    "$BODY_FILE" >"$file"
  return 0
}

print_section "Negotiation isolation"

ORDERING_OK=yes
capture_body "$SMOKE_DIR/isolated-html" "$CANONICAL" "$BROWSER_ACCEPT" || ORDERING_OK=no
capture_body "$SMOKE_DIR/isolated-md" "$CANONICAL" "$MARKDOWN_ACCEPT" || ORDERING_OK=no
capture_body "$SMOKE_DIR/html-first-html" "$CANONICAL" "$BROWSER_ACCEPT" || ORDERING_OK=no
capture_body "$SMOKE_DIR/html-first-md" "$CANONICAL" "$MARKDOWN_ACCEPT" || ORDERING_OK=no
capture_body "$SMOKE_DIR/md-first-md" "$CANONICAL" "$MARKDOWN_ACCEPT" || ORDERING_OK=no
capture_body "$SMOKE_DIR/md-first-html" "$CANONICAL" "$BROWSER_ACCEPT" || ORDERING_OK=no

if [[ $ORDERING_OK == yes ]]; then
  if cmp -s "$SMOKE_DIR/isolated-md" "$SMOKE_DIR/html-first-md" &&
    cmp -s "$SMOKE_DIR/isolated-md" "$SMOKE_DIR/md-first-md"; then
    print_pass "Markdown body is identical after a preceding HTML request and before one"
  else
    print_fail "Markdown body changed with request ordering"
  fi

  if cmp -s "$SMOKE_DIR/isolated-html" "$SMOKE_DIR/html-first-html" &&
    cmp -s "$SMOKE_DIR/isolated-html" "$SMOKE_DIR/md-first-html"; then
    print_pass "HTML body is identical after a preceding Markdown request and before one"
  else
    print_fail "HTML body changed with request ordering"
  fi

  if cmp -s "$SMOKE_DIR/isolated-md" "$SMOKE_DIR/isolated-html"; then
    print_fail "the negotiated Markdown is byte-identical to the HTML page"
  else
    print_pass "the negotiated Markdown is a different document from the HTML page"
  fi

  if [[ -s $SMOKE_DIR/negotiated-md ]] && ! cmp -s "$SMOKE_DIR/negotiated-md" "$SMOKE_DIR/isolated-md"; then
    print_fail "the negotiated Markdown differs between separate requests"
  elif [[ -s $SMOKE_DIR/negotiated-md ]]; then
    print_pass "the negotiated Markdown is the same document on every request"
  fi
fi

# ---------------------------------------------------------------------------
# Markdown twins, enumerated from the sitemap itself
# ---------------------------------------------------------------------------

print_section "Markdown twins"

TWINS_CHECKED=0
TWINS_FAILED=0

if ! request /sitemap.xml || [[ $STATUS != 200 ]]; then
  print_fail "GET /sitemap.xml — cannot enumerate docs twins"
else
  cp "$BODY_FILE" "$SMOKE_DIR/sitemap.xml"
  grep -o '<loc>[^<]*</loc>' "$SMOKE_DIR/sitemap.xml" |
    sed 's|^<loc>||; s|</loc>$||' >"$SMOKE_DIR/locations" || true
  grep '/docs/' "$SMOKE_DIR/locations" >"$SMOKE_DIR/doc-locations" || true

  while IFS= read -r location; do
    [[ -z $location ]] && continue
    twin_path=$(printf '%s' "$location" | sed 's|^[a-z][a-z0-9+.-]*://[^/]*||')
    twin_path=${twin_path%/}
    twin="${twin_path}.md"
    TWINS_CHECKED=$((TWINS_CHECKED + 1))

    if ! request "$twin"; then
      TWINS_FAILED=$((TWINS_FAILED + 1))
      if [[ $TWINS_FAILED -le 3 ]]; then
        print_note "broken twin: GET $twin — no response ($(describe_error))"
      fi
      continue
    fi

    twin_type=$(content_type)
    if [[ $STATUS != 200 || $twin_type != text/markdown ]]; then
      TWINS_FAILED=$((TWINS_FAILED + 1))
      if [[ $TWINS_FAILED -le 3 ]]; then
        print_note "broken twin: GET $twin — got $STATUS ${twin_type:-no content-type}"
      fi
    fi
  done <"$SMOKE_DIR/doc-locations"

  if [[ $TWINS_CHECKED -eq 0 ]]; then
    print_fail "sitemap lists no docs page, so no twin could be checked"
  elif [[ $TWINS_FAILED -eq 0 ]]; then
    print_pass "all $TWINS_CHECKED docs twins return 200 text/markdown"
  else
    print_fail "$TWINS_FAILED of $TWINS_CHECKED docs twins are not Markdown"
  fi
fi

if [[ $TWINS_CHECKED -gt 0 && -n ${twin:-} ]]; then
  # A file-like path loses its trailing slash rather than gaining one, so this
  # must redirect instead of being served twice under two URLs.
  if request_raw "$twin/"; then
    redirect_location=$(header_values location | tail -n 1 | tr -d '\r')
    if [[ $STATUS != 3* ]]; then
      print_fail "GET $twin/ — expected a redirect, got $STATUS"
    elif [[ ${redirect_location%/} == *"$twin" ]]; then
      print_pass "GET $twin/ — $STATUS to the slashless twin"
    else
      print_fail "GET $twin/ — $STATUS to ${redirect_location:-<no Location>}"
    fi
  else
    print_fail "GET $twin/ — no response ($(describe_error))"
  fi
fi

# ---------------------------------------------------------------------------
# Catalog and permissions must name the same surfaces
# ---------------------------------------------------------------------------

print_section "Catalog and permissions"

extract_hrefs() { # <file>: every href, one per line, sorted
  grep -o '"href"[[:space:]]*:[[:space:]]*"[^"]*"' "$1" |
    sed 's/.*"\([^"]*\)"$/\1/' |
    sort -u
}

catalog_ok=no
if request /.well-known/api-catalog && [[ $STATUS == 200 ]]; then
  cp "$BODY_FILE" "$SMOKE_DIR/api-catalog.json"
  extract_hrefs "$SMOKE_DIR/api-catalog.json" >"$SMOKE_DIR/catalog-hrefs" || true
  catalog_ok=yes
else
  print_fail "GET /.well-known/api-catalog — cannot read the catalog"
fi

permissions_ok=no
if request /.well-known/agent-permissions.json && [[ $STATUS == 200 ]]; then
  cp "$BODY_FILE" "$SMOKE_DIR/permissions.json"
  extract_hrefs "$SMOKE_DIR/permissions.json" >"$SMOKE_DIR/permissions-hrefs" || true
  permissions_ok=yes
else
  print_fail "GET /.well-known/agent-permissions.json — cannot read the permissions"
fi

if [[ $catalog_ok == yes && $permissions_ok == yes ]]; then
  surface_count=$(wc -l <"$SMOKE_DIR/catalog-hrefs" | tr -d ' ')
  if [[ $surface_count -eq 0 ]]; then
    print_fail "the API catalog names no surface"
  elif cmp -s "$SMOKE_DIR/catalog-hrefs" "$SMOKE_DIR/permissions-hrefs"; then
    print_pass "catalog and permissions name the same $surface_count surfaces"
  else
    print_fail "catalog and permissions disagree on the surface set"
    print_note "catalog only: $(comm -23 "$SMOKE_DIR/catalog-hrefs" "$SMOKE_DIR/permissions-hrefs" | tr '\n' ' ')"
    print_note "permissions only: $(comm -13 "$SMOKE_DIR/catalog-hrefs" "$SMOKE_DIR/permissions-hrefs" | tr '\n' ' ')"
  fi
fi

# ---------------------------------------------------------------------------
# Skill digests: the index promises a sha256 for every document it lists
# ---------------------------------------------------------------------------

print_section "Agent skills"

if request /.well-known/agent-skills/index.json && [[ $STATUS == 200 ]]; then
  tr '\n' ' ' <"$BODY_FILE" | sed 's/}/}\n/g' >"$SMOKE_DIR/skill-entries"

  SKILLS_CHECKED=0

  while IFS= read -r entry; do
    skill_url=$(printf '%s' "$entry" | grep -o '"url"[[:space:]]*:[[:space:]]*"[^"]*"' | head -n 1 | sed 's/.*"\([^"]*\)"$/\1/') || true
    skill_sha=$(printf '%s' "$entry" | grep -o '"sha256"[[:space:]]*:[[:space:]]*"[^"]*"' | head -n 1 | sed 's/.*"\([^"]*\)"$/\1/') || true
    [[ -z $skill_url || -z $skill_sha ]] && continue
    SKILLS_CHECKED=$((SKILLS_CHECKED + 1))

    if ! request "$skill_url"; then
      print_fail "GET $skill_url — no response ($(describe_error))"
      continue
    fi

    if [[ $STATUS != 200 ]]; then
      print_fail "GET $skill_url — expected 200, got $STATUS"
      continue
    fi

    skill_type=$(content_type)
    if [[ $skill_type == text/markdown ]]; then
      print_pass "GET $skill_url — 200 text/markdown"
    else
      print_fail "GET $skill_url — expected text/markdown, got ${skill_type:-no content-type}"
    fi

    actual_sha=$(sha256_of "$BODY_FILE")
    if [[ -z $actual_sha ]]; then
      print_fail "GET $skill_url — no sha256 tool available to verify the digest"
    elif [[ $actual_sha == "$skill_sha" ]]; then
      print_pass "GET $skill_url — sha256 matches the index"
    else
      print_fail "GET $skill_url — sha256 $actual_sha does not match the declared $skill_sha"
    fi
  done <"$SMOKE_DIR/skill-entries"

  if [[ $SKILLS_CHECKED -eq 0 ]]; then
    print_fail "the skills index lists no document"
  fi
else
  print_fail "GET /.well-known/agent-skills/index.json — cannot read the skills index"
fi

# ---------------------------------------------------------------------------
# MCP: a JSON-RPC handshake and the tool list a client discovers from it
# ---------------------------------------------------------------------------

print_section "MCP endpoint"

MCP_URL=/api/mcp
MCP_JSON='Content-Type: application/json'
MCP_ACCEPT='Accept: application/json, text/event-stream'
INITIALIZE_BODY='{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"agent-readiness-smoke","version":"1.0.0"}}}'
INITIALIZED_BODY='{"jsonrpc":"2.0","method":"notifications/initialized"}'
TOOLS_BODY='{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'

MCP_SESSION=''
MCP_READY=no

if request "$MCP_URL" -X POST -H "$MCP_JSON" -H "$MCP_ACCEPT" --data-binary "$INITIALIZE_BODY"; then
  MCP_SESSION=$(header_values mcp-session-id | tail -n 1 | tr -d '\r')
  if [[ $STATUS != 200 ]]; then
    print_fail "POST $MCP_URL initialize — expected 200, got $STATUS"
  elif grep -q 'serverInfo' "$BODY_FILE"; then
    print_pass "POST $MCP_URL initialize — 200 with a serverInfo result"
    MCP_READY=yes
  else
    print_fail "POST $MCP_URL initialize — 200 without a JSON-RPC result"
  fi
else
  print_fail "POST $MCP_URL initialize — no response ($(describe_error))"
fi

if [[ $MCP_READY == yes ]]; then
  mcp_session_flags=()
  [[ -n $MCP_SESSION ]] && mcp_session_flags=(-H "Mcp-Session-Id: $MCP_SESSION")

  request "$MCP_URL" -X POST -H "$MCP_JSON" -H "$MCP_ACCEPT" \
    "${mcp_session_flags[@]+"${mcp_session_flags[@]}"}" \
    --data-binary "$INITIALIZED_BODY" || true

  if request "$MCP_URL" -X POST -H "$MCP_JSON" -H "$MCP_ACCEPT" \
    "${mcp_session_flags[@]+"${mcp_session_flags[@]}"}" \
    --data-binary "$TOOLS_BODY"; then
    if [[ $STATUS != 200 ]]; then
      print_fail "POST $MCP_URL tools/list — expected 200, got $STATUS"
    else
      for tool in get_site_discovery search_docs; do
        if grep -q "\"$tool\"" "$BODY_FILE"; then
          print_pass "POST $MCP_URL tools/list — exposes $tool"
        else
          print_fail "POST $MCP_URL tools/list — does not expose $tool"
        fi
      done

      if [[ $BLOG_ENABLED == yes ]]; then
        if grep -q '"search_blog_posts"' "$BODY_FILE"; then
          print_pass "POST $MCP_URL tools/list — exposes search_blog_posts"
        else
          print_fail "POST $MCP_URL tools/list — the blog is on but search_blog_posts is missing"
        fi
      else
        print_skip "the blog is off, so search_blog_posts is not expected"
      fi
    fi
  else
    print_fail "POST $MCP_URL tools/list — no response ($(describe_error))"
  fi
fi

# ---------------------------------------------------------------------------
# Blog flag: with the blog off, blog URLs must 404 rather than answer emptily
# ---------------------------------------------------------------------------

print_section "Blog flag"

if [[ $BLOG_ENABLED == yes ]]; then
  print_skip "/blog/ answers 200, so this deployment has the blog on and no 404 is expected"
else
  for blog_path in /blog/ /api/last-posts; do
    if ! request "$blog_path"; then
      print_fail "GET $blog_path — no response ($(describe_error))"
    elif [[ $STATUS == 404 ]]; then
      print_pass "GET $blog_path — 404 with the blog off"
    else
      print_fail "GET $blog_path — expected 404 with the blog off, got $STATUS"
    fi
  done
fi

# ---------------------------------------------------------------------------
# Result
# ---------------------------------------------------------------------------

print_section "Result"

if [[ $FAILURES -eq 0 ]]; then
  echo "READY  $PASSES assertions passed."
  exit 0
fi

echo "NOT READY  $FAILURES failed, $PASSES passed." >&2
exit "$EXIT_ASSERTION"
