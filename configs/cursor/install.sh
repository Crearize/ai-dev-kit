#!/usr/bin/env bash
# Cursor project setup
# Called by setup.sh with PROJECT_DIR and AI_DEV_KIT_DIR as arguments

set -euo pipefail

PROJECT_DIR="$1"
AI_DEV_KIT_DIR="$2"

echo "Setting up Cursor..."

# 1. Create .cursor directory
mkdir -p "$PROJECT_DIR/.cursor/rules"

# 2. Link skills
if [ -d "$PROJECT_DIR/skills" ]; then
    SKILLS_REL_PATH="$(python3 -c "import os; print(os.path.relpath('$PROJECT_DIR/skills', '$PROJECT_DIR/.cursor'))" 2>/dev/null || echo "../skills")"
    "$AI_DEV_KIT_DIR/scripts/link-or-copy.sh" "$SKILLS_REL_PATH" "$PROJECT_DIR/.cursor/skills"
fi

# 3. Convert and copy rules (.md -> .mdc)
if [ -n "${SELECTED_STACKS:-}" ]; then
    for stack in $SELECTED_STACKS; do
        stack_rules="$AI_DEV_KIT_DIR/stacks/$stack/rules"
        if [ -d "$stack_rules" ]; then
            find "$stack_rules" -name "*.md" -type f | while read -r md_file; do
                filename=$(basename "$md_file" .md)
                parent_dir=$(basename "$(dirname "$md_file")")

                # Extract first heading for description
                description=$(grep -m1 '^# ' "$md_file" | sed 's/^# //' || echo "$filename rules")

                # Determine globs based on directory
                case "$parent_dir" in
                    frontend)
                        globs='  - "frontend/**/*.ts"
  - "frontend/**/*.tsx"'
                        always_apply="false"
                        ;;
                    backend)
                        globs='  - "backend/**/*.java"'
                        always_apply="false"
                        ;;
                    *)
                        globs=""
                        always_apply="true"
                        ;;
                esac

                # Generate .mdc file
                mdc_file="$PROJECT_DIR/.cursor/rules/${parent_dir}-${filename}.mdc"
                {
                    echo "---"
                    echo "description: \"$description\""
                    if [ -n "$globs" ]; then
                        echo "globs:"
                        echo "$globs"
                        echo "alwaysApply: $always_apply"
                    else
                        echo "alwaysApply: $always_apply"
                    fi
                    echo "---"
                    echo ""
                    cat "$md_file"
                } > "$mdc_file"
                echo "  Rule created: $(basename "$mdc_file")"
            done
        fi
    done
fi

# 4. Generate .cursorrules from template
if [ -f "$AI_DEV_KIT_DIR/templates/cursorrules.template" ]; then
    if [ ! -f "$PROJECT_DIR/.cursorrules" ]; then
        cp "$AI_DEV_KIT_DIR/templates/cursorrules.template" "$PROJECT_DIR/.cursorrules"
        echo "  .cursorrules created"
    else
        echo "  .cursorrules already exists, skipping"
    fi
fi

echo "  Cursor setup complete"
