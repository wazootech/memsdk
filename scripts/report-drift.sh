#!/usr/bin/env bash
# Creates, updates, or closes the single weekly drift issue.
set -euo pipefail

export GH_TOKEN="${GITHUB_TOKEN:?GITHUB_TOKEN is required}"
repo="${GITHUB_REPOSITORY:-wazootech/memsdk}"
title="[drift] Weekly Supermemory contract drift"
artifact_dir="${RUNNER_TEMP:-.}"
server="${GITHUB_SERVER_URL:-https://github.com}"
run_url="${server}/${repo}/actions/runs/${GITHUB_RUN_ID:-unknown}"
commit_url="${server}/${repo}/commit/${GITHUB_SHA:-unknown}"
event="${GITHUB_EVENT_NAME:-unknown}"

sdk_exit="${artifact_dir}/drift-sdk.exit"
openapi_exit="${artifact_dir}/drift-openapi.exit"
sdk_log="${artifact_dir}/drift-sdk.log"
openapi_log="${artifact_dir}/drift-openapi.log"

if [[ ! -f "$sdk_exit" && ! -f "$openapi_exit" ]]; then
  echo "No drift step output found; nothing to report."
  exit 0
fi

status() {
  local value
  value=$(tr -d '[:space:]' < "$1" 2>/dev/null || true)
  [[ "$value" =~ ^[0-9]+$ ]] || value=1
  printf '%s\n' "$value"
}
sdk_status=$(status "$sdk_exit")
openapi_status=$(status "$openapi_exit")

query="repo:${repo} is:issue label:drift"
search_file="${artifact_dir}/drift-search.json"
gh api --paginate --slurp -X GET search/issues -f q="$query" > "$search_file"
jq --arg title "$title" -r \
  '[.[] | .items[]? | select(.title == $title and .state == "open") | .number] | .[]' \
  "$search_file" > "${artifact_dir}/drift-open.txt"
jq --arg title "$title" -r \
  '[.[] | .items[]? | select(.title == $title and .state == "closed")] | sort_by(.updated_at) | reverse | .[] | .number' \
  "$search_file" > "${artifact_dir}/drift-closed.txt"
mapfile -t open_matches < "${artifact_dir}/drift-open.txt"
mapfile -t closed_matches < "${artifact_dir}/drift-closed.txt"

if (( ${#open_matches[@]} > 1 )); then
  echo "::error::Multiple open drift issues found: ${open_matches[*]}. Refusing to create or update another."
  exit 1
fi

issue=""
if (( ${#open_matches[@]} == 1 )); then
  issue="${open_matches[0]}"
elif (( ${#closed_matches[@]} > 0 )); then
  issue="${closed_matches[0]}"
fi

if (( sdk_status == 0 && openapi_status == 0 )); then
  if [[ -n "$issue" && ${#open_matches[@]} == 1 ]]; then
    gh issue comment "$issue" --body "Drift check is green in ${run_url} (${commit_url}). Closing."
    gh issue close "$issue"
    echo "Closed drift issue #${issue}."
  else
    echo "Green drift check; no open drift issue to close."
  fi
  exit 0
fi

failed=""
if (( sdk_status != 0 )); then failed="${failed}\`drift:sdk\` (exit ${sdk_status}); "; fi
if (( openapi_status != 0 )); then failed="${failed}\`drift:openapi\` (exit ${openapi_status}); "; fi
failed="${failed%; }"

version=$(jq -r '.devDependencies.supermemory // empty' package.json 2>/dev/null || true)
if [[ -z "$version" && -f node_modules/supermemory/package.json ]]; then
  version=$(jq -r '.version // empty' node_modules/supermemory/package.json 2>/dev/null || true)
fi
[[ -n "$version" ]] || version=unknown

body="${artifact_dir}/drift-issue-body.md"
cat > "$body" <<EOF
Weekly Supermemory contract drift detected.

- Upstream package: \`supermemory@${version}\`
- Failed step(s): ${failed}
- Run: ${run_url}
- Commit: ${commit_url}
- Event: ${event} (attempt ${GITHUB_RUN_ATTEMPT:-unknown})
- Detected: $(date -u +%Y-%m-%dT%H:%M:%SZ)

The next green run will close this issue automatically.
EOF

section() {
  local name="$1" log="$2" bytes=20000 size
  printf '\n### %s output\n\n' "$name" >> "$body"
  if [[ -f "$log" ]]; then
    size=$(wc -c < "$log")
    if (( size > bytes )); then
      printf '_Truncated to the first %s bytes of %s._\n\n' "$bytes" "$size" >> "$body"
    fi
    printf '```text\n' >> "$body"
    head -c "$bytes" "$log" >> "$body"
    printf '\n```\n' >> "$body"
  else
    printf '_No output captured._\n' >> "$body"
  fi
}
section "drift:sdk" "$sdk_log"
section "drift:openapi" "$openapi_log"

if [[ -n "$issue" ]]; then
  gh issue edit "$issue" --body-file "$body"
  if (( ${#open_matches[@]} == 0 )); then
    gh issue reopen "$issue" --comment "Drift recurred in ${run_url}."
  else
    gh issue comment "$issue" --body "Drift still failing in ${run_url}."
  fi
  echo "Updated drift issue #${issue}."
else
  gh issue create --title "$title" --label drift --body-file "$body"
  echo "Created drift issue with title: ${title}"
fi
