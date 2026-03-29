#!/usr/bin/env bash
# Claude Code project setup
# Called by setup.sh with PROJECT_DIR and AI_DEV_KIT_DIR as arguments

set -euo pipefail

PROJECT_DIR="$1"
AI_DEV_KIT_DIR="$2"

echo "Setting up Claude Code..."

# 1. Create .claude directory
mkdir -p "$PROJECT_DIR/.claude/rules"

# 2. Link skills
if [ -d "$PROJECT_DIR/skills" ]; then
    SKILLS_REL_PATH="$(python3 -c "import os; print(os.path.relpath('$PROJECT_DIR/skills', '$PROJECT_DIR/.claude'))" 2>/dev/null || echo "../skills")"
    "$AI_DEV_KIT_DIR/scripts/link-or-copy.sh" "$SKILLS_REL_PATH" "$PROJECT_DIR/.claude/skills"
fi

# 3. Copy rules from selected stacks
if [ -n "${SELECTED_STACKS:-}" ]; then
    for stack in $SELECTED_STACKS; do
        stack_rules="$AI_DEV_KIT_DIR/stacks/$stack/rules"
        if [ -d "$stack_rules" ]; then
            cp -r "$stack_rules/"* "$PROJECT_DIR/.claude/rules/" 2>/dev/null || true
        fi
    done
fi

# 4. Copy settings.json from template
if [ -f "$AI_DEV_KIT_DIR/templates/settings.json.template" ]; then
    if [ ! -f "$PROJECT_DIR/.claude/settings.json" ]; then
        cp "$AI_DEV_KIT_DIR/templates/settings.json.template" "$PROJECT_DIR/.claude/settings.json"
        echo "  settings.json created"
    else
        echo "  settings.json already exists, skipping"
    fi
fi

# 5. Generate CLAUDE.md from template
if [ -f "$AI_DEV_KIT_DIR/templates/CLAUDE.md.template" ]; then
    if [ ! -f "$PROJECT_DIR/CLAUDE.md" ]; then
        cp "$AI_DEV_KIT_DIR/templates/CLAUDE.md.template" "$PROJECT_DIR/CLAUDE.md"
        echo "  CLAUDE.md created"
    else
        echo "  CLAUDE.md already exists, skipping"
    fi
fi

echo "  Claude Code setup complete"
