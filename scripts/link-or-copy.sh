#!/usr/bin/env bash
# Usage: ./scripts/link-or-copy.sh <source_dir> <link_path>
# Creates a symlink from link_path -> source_dir
# Falls back to directory copy on failure

set -euo pipefail

SOURCE_DIR="$1"
LINK_PATH="$2"

# Remove existing link/dir if present
if [ -L "$LINK_PATH" ] || [ -d "$LINK_PATH" ]; then
    rm -rf "$LINK_PATH"
fi

# Try symlink first
if ln -s "$SOURCE_DIR" "$LINK_PATH" 2>/dev/null; then
    echo "  Symlink created: $LINK_PATH -> $SOURCE_DIR"
    exit 0
fi

# Fallback: copy
cp -r "$SOURCE_DIR" "$LINK_PATH"
echo "  Symlink failed. Copied $SOURCE_DIR -> $LINK_PATH"
echo "  Note: Changes to skills/ won't auto-reflect. Re-run setup after updates."
