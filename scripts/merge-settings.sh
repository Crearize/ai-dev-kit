#!/usr/bin/env bash
# Usage: ./scripts/merge-settings.sh <target_file> <merge_file>
# Merges merge_file into target_file (deny list union)
# Creates backup before modification

set -euo pipefail

TARGET="$1"
MERGE_SOURCE="$2"

# Backup
if [ -f "$TARGET" ]; then
    BACKUP="${TARGET}.backup.$(date +%Y%m%d%H%M%S)"
    cp "$TARGET" "$BACKUP"
    echo "  Backup created: $BACKUP"
else
    mkdir -p "$(dirname "$TARGET")"
    echo '{}' > "$TARGET"
fi

# Try jq first
if command -v jq &>/dev/null; then
    jq -s '
      .[0] as $existing |
      .[1] as $new |
      ($new | del(.permissions, .hooks)) as $new_toplevel |
      ($existing | del(.permissions, .hooks)) as $existing_toplevel |
      ($new_toplevel * $existing_toplevel) * {
        permissions: {
          allow: ($existing.permissions.allow // []),
          deny: (($existing.permissions.deny // []) + ($new.permissions.deny // []) | unique)
        }
      } * (if $existing.hooks then { hooks: $existing.hooks } else {} end)
    ' "$TARGET" "$MERGE_SOURCE" > "${TARGET}.tmp"
    mv "${TARGET}.tmp" "$TARGET"
    echo "  Settings merged using jq"
    exit 0
fi

# Try Python
if command -v python3 &>/dev/null; then
    python3 -c "
import json

with open('$TARGET') as f:
    existing = json.load(f)
with open('$MERGE_SOURCE') as f:
    new = json.load(f)

# Apply top-level settings from template as defaults (existing values take precedence)
for key, value in new.items():
    if key not in ('permissions', 'hooks'):
        existing.setdefault(key, value)

# Merge deny lists
existing.setdefault('permissions', {})
existing_deny = set(existing['permissions'].get('deny', []))
new_deny = set(new.get('permissions', {}).get('deny', []))
existing['permissions']['deny'] = sorted(existing_deny | new_deny)

# Preserve allow list
if 'allow' not in existing['permissions']:
    existing['permissions']['allow'] = []

with open('$TARGET', 'w') as f:
    json.dump(existing, f, indent=2, ensure_ascii=False)
    f.write('\n')

print('  Settings merged using Python')
"
    exit 0
fi

echo "Error: jq or python3 is required for settings merge"
echo "  Install jq: https://jqlang.github.io/jq/download/"
exit 1
