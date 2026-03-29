#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- Helper functions ---

print_header() {
    echo ""
    echo "ai-dev-kit Setup"
    echo "================"
    echo ""
}

prompt_select() {
    local prompt="$1"
    shift
    local options=("$@")
    echo "$prompt"
    for i in "${!options[@]}"; do
        echo "  $((i+1))) ${options[$i]}"
    done
    while true; do
        read -rp "> " choice
        if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#options[@]}" ]; then
            echo "$((choice-1))"
            return 0
        fi
        echo "Enter a number between 1 and ${#options[@]}"
    done
}

prompt_yn() {
    local prompt="$1"
    local default="${2:-Y}"
    if [ "$default" = "Y" ]; then
        read -rp "$prompt [Y/n]: " answer
        [ -z "$answer" ] || [[ "$answer" =~ ^[Yy] ]]
    else
        read -rp "$prompt [y/N]: " answer
        [[ "$answer" =~ ^[Yy] ]]
    fi
}

# --- Detect available stacks ---

detect_stacks() {
    local stacks=()
    for dir in "$SCRIPT_DIR"/stacks/*/; do
        local name
        name=$(basename "$dir")
        if [ "$name" != "_template" ]; then
            stacks+=("$name")
        fi
    done
    echo "${stacks[@]}"
}

# --- init mode ---

do_init() {
    print_header
    echo "Project initialization mode"
    echo ""

    # 1. Project name
    read -rp "Project name: " PROJECT_NAME
    PROJECT_DIR="$(pwd)"

    # 2. AI tool selection
    echo ""
    tool_choice=$(prompt_select "Select AI tool(s):" \
        "Claude Code only" "Cursor only" "Claude Code + Cursor")

    # 3. Skill scope
    echo ""
    skill_choice=$(prompt_select "Select skill scope:" \
        "All skills (superpowers + project)" \
        "superpowers skills only" \
        "project skills only")

    # 4. Detect and apply stacks
    local stacks
    read -ra stacks <<< "$(detect_stacks)"
    local selected_stacks=()

    if [ "${#stacks[@]}" -eq 1 ]; then
        echo ""
        echo "Tech stack: ${stacks[0]} (auto-applied)"
        selected_stacks=("${stacks[0]}")
    elif [ "${#stacks[@]}" -gt 1 ]; then
        echo ""
        echo "Available tech stacks (enter numbers separated by spaces):"
        for i in "${!stacks[@]}"; do
            echo "  $((i+1))) ${stacks[$i]}"
        done
        read -rp "> " stack_input
        for idx in $stack_input; do
            if [ "$idx" -ge 1 ] && [ "$idx" -le "${#stacks[@]}" ]; then
                selected_stacks+=("${stacks[$((idx-1))]}")
            fi
        done
    fi

    # Export for install scripts
    export SELECTED_STACKS="${selected_stacks[*]}"

    # 5. Copy skills
    echo ""
    echo "--- Setting up skills ---"
    mkdir -p "$PROJECT_DIR/skills"
    case $skill_choice in
        0) # All
            cp -r "$SCRIPT_DIR/skills/superpowers" "$PROJECT_DIR/skills/"
            cp -r "$SCRIPT_DIR/skills/project" "$PROJECT_DIR/skills/"
            ;;
        1) # superpowers only
            cp -r "$SCRIPT_DIR/skills/superpowers" "$PROJECT_DIR/skills/"
            ;;
        2) # project only
            cp -r "$SCRIPT_DIR/skills/project" "$PROJECT_DIR/skills/"
            ;;
    esac
    echo "  Skills copied to skills/"

    # 6. Copy stacks and shared resources
    echo ""
    echo "--- Setting up documents and review guides ---"
    for stack in "${selected_stacks[@]}"; do
        if [ -d "$SCRIPT_DIR/stacks/$stack" ]; then
            # Review guides -> .github/
            if [ -d "$SCRIPT_DIR/stacks/$stack/review-guides" ]; then
                mkdir -p "$PROJECT_DIR/.github"
                cp "$SCRIPT_DIR/stacks/$stack/review-guides/"* "$PROJECT_DIR/.github/" 2>/dev/null || true
            fi
            # Documents -> documents/development/
            if [ -d "$SCRIPT_DIR/stacks/$stack/documents" ]; then
                mkdir -p "$PROJECT_DIR/documents/development"
                cp -r "$SCRIPT_DIR/stacks/$stack/documents/"* "$PROJECT_DIR/documents/development/" 2>/dev/null || true
            fi
        fi
    done

    # Shared resources
    if [ -d "$SCRIPT_DIR/shared/review-guides" ]; then
        mkdir -p "$PROJECT_DIR/.github"
        cp "$SCRIPT_DIR/shared/review-guides/"* "$PROJECT_DIR/.github/" 2>/dev/null || true
    fi
    if [ -d "$SCRIPT_DIR/shared/documents" ]; then
        mkdir -p "$PROJECT_DIR/documents/development"
        cp -r "$SCRIPT_DIR/shared/documents/"* "$PROJECT_DIR/documents/development/" 2>/dev/null || true
    fi
    echo "  Documents and review guides copied"

    # 7. PR template
    mkdir -p "$PROJECT_DIR/.github"
    cp "$SCRIPT_DIR/templates/PULL_REQUEST_TEMPLATE.md" "$PROJECT_DIR/.github/" 2>/dev/null || true
    echo "  PR template copied"

    # 8. AI tool specific setup
    echo ""
    echo "--- Setting up AI tool configuration ---"
    case $tool_choice in
        0) # Claude Code only
            bash "$SCRIPT_DIR/configs/claude-code/install.sh" "$PROJECT_DIR" "$SCRIPT_DIR"
            ;;
        1) # Cursor only
            bash "$SCRIPT_DIR/configs/cursor/install.sh" "$PROJECT_DIR" "$SCRIPT_DIR"
            ;;
        2) # Both
            bash "$SCRIPT_DIR/configs/claude-code/install.sh" "$PROJECT_DIR" "$SCRIPT_DIR"
            bash "$SCRIPT_DIR/configs/cursor/install.sh" "$PROJECT_DIR" "$SCRIPT_DIR"
            ;;
    esac

    # 9. Replace placeholders
    if [ -f "$PROJECT_DIR/CLAUDE.md" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" "$PROJECT_DIR/CLAUDE.md"
        else
            sed -i "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" "$PROJECT_DIR/CLAUDE.md"
        fi
    fi
    if [ -f "$PROJECT_DIR/.cursorrules" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" "$PROJECT_DIR/.cursorrules"
        else
            sed -i "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" "$PROJECT_DIR/.cursorrules"
        fi
    fi

    echo ""
    echo "Setup complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Review and customize CLAUDE.md / .cursorrules"
    echo "  2. Update tech stack and port information"
    echo "  3. Add project-specific coding rules"
    echo "  4. Commit the generated files"
}

# --- personal mode ---

do_personal() {
    print_header
    echo "Personal environment setup"
    echo ""

    echo "Available options:"
    echo ""
    echo "  1) Claude Code global settings"
    echo "     Block destructive commands, safety hooks"
    echo ""
    echo "  2) Cursor global settings guide"
    echo "     Copy recommended rules to clipboard"
    echo ""
    read -rp "Select options (space-separated): " selections

    for sel in $selections; do
        case $sel in
            1)
                echo ""
                echo "--- Claude Code global settings ---"
                local claude_settings="$HOME/.claude/settings.json"
                mkdir -p "$HOME/.claude"
                bash "$SCRIPT_DIR/scripts/merge-settings.sh" \
                    "$claude_settings" \
                    "$SCRIPT_DIR/templates/settings-global.json.template"
                echo "  Claude Code global settings updated"
                ;;
            2)
                echo ""
                echo "--- Cursor global settings ---"
                echo ""
                echo "Cursor global rules are managed via GUI (SQLite-based)."
                echo "Please manually configure:"
                echo ""
                echo "  Cursor Settings -> Rules -> User Rules"
                echo ""
                echo "Recommended rules:"
                echo "---"
                # Display recommended rules from README
                if [ -f "$SCRIPT_DIR/configs/cursor/README.md" ]; then
                    # Extract the rules section
                    sed -n '/^## Safety Rules/,/^## Customization/p' "$SCRIPT_DIR/configs/cursor/README.md" 2>/dev/null | head -20 || true
                fi
                echo "---"

                # Copy to clipboard if possible
                if command -v pbcopy &>/dev/null; then
                    if [ -f "$SCRIPT_DIR/configs/cursor/README.md" ]; then
                        sed -n '/^## Safety Rules/,/^```$/p' "$SCRIPT_DIR/configs/cursor/README.md" 2>/dev/null | pbcopy || true
                        echo "  Copied to clipboard (pbcopy)"
                    fi
                elif command -v xclip &>/dev/null; then
                    if [ -f "$SCRIPT_DIR/configs/cursor/README.md" ]; then
                        sed -n '/^## Safety Rules/,/^```$/p' "$SCRIPT_DIR/configs/cursor/README.md" 2>/dev/null | xclip -selection clipboard || true
                        echo "  Copied to clipboard (xclip)"
                    fi
                else
                    echo "  (Clipboard not available. Please copy manually.)"
                fi
                ;;
        esac
    done

    echo ""
    echo "Personal setup complete!"
}

# --- Main ---

case "${1:-}" in
    init)
        do_init
        ;;
    personal)
        do_personal
        ;;
    *)
        echo "Usage: $0 {init|personal}"
        echo ""
        echo "  init      - Set up development foundation in a project"
        echo "  personal  - Apply global settings to personal environment"
        exit 1
        ;;
esac
