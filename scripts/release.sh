#!/usr/bin/env bash
# Release tamaclaude: ./scripts/release.sh 0.9.0 "one line per change" ["another line" ...]
# Bumps both manifests, prepends a CHANGELOG entry, validates, tests, commits, pushes,
# tags (claude plugin tag), creates the GitHub release, updates the local install.
set -euo pipefail
cd "$(dirname "$0")/.."

v="${1:?version, e.g. 0.9.0}"; shift
[ $# -gt 0 ] || { echo "need at least one changelog line"; exit 1; }
[[ "$v" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "bad version: $v"; exit 1; }
[ -z "$(git status --porcelain)" ] || { echo "working tree dirty — commit or stash first"; exit 1; }
[ "$(git branch --show-current)" = main ] || { echo "release from main"; exit 1; }

old=$(python3 -c 'import json;print(json.load(open("tamaclaude/.claude-plugin/plugin.json"))["version"])')
[ "$v" != "$old" ] || { echo "already at $v"; exit 1; }

# manifests
sed -i '' "s/\"version\": \"$old\"/\"version\": \"$v\"/" tamaclaude/.claude-plugin/plugin.json .claude-plugin/marketplace.json
grep -q "\"version\": \"$v\"" tamaclaude/.claude-plugin/plugin.json .claude-plugin/marketplace.json

# changelog entry
notes=$(printf -- '- %s\n' "$@")
{ echo "# Changelog"; echo; echo "## $v — $(date +%F)"; echo "$notes"; echo; tail -n +3 CHANGELOG.md; } > CHANGELOG.tmp && mv CHANGELOG.tmp CHANGELOG.md

# checks
claude plugin validate tamaclaude
for t in tamaclaude/tests/*.test.ts; do npx -y tsx "$t"; done

# ship
git add -A
git commit -q -m "release: $v" -m "$notes"
git push -q
claude plugin tag ./tamaclaude --push
gh release create "tamaclaude--v$v" --title "tamaclaude $v" --notes "$notes"
claude plugin marketplace update tamaclaude >/dev/null
claude plugin update tamaclaude@tamaclaude
echo "shipped $v — /reload-plugins in open sessions"
