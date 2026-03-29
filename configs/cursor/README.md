# Cursor Setup

## What Gets Installed

| Item | Location | Description |
|------|----------|-------------|
| Skills | `.cursor/skills/` | Symlink to `skills/` (superpowers + project skills) |
| Rules | `.cursor/rules/*.mdc` | Stack-specific coding rules (converted to .mdc format) |
| .cursorrules | `.cursorrules` (project root) | AI configuration file |

## Directory Structure After Setup

```
your-project/
├── .cursor/
│   ├── skills -> ../skills    # Symlink to shared skills
│   └── rules/
│       ├── frontend-coding.mdc  # Frontend rules (.mdc format)
│       └── backend-coding.mdc   # Backend rules (.mdc format)
├── skills/
│   ├── superpowers/           # Development process skills
│   └── project/               # Project workflow skills
├── .cursorrules               # Main AI configuration
└── ...
```

## How .mdc Rules Work

Cursor rules use `.mdc` format with YAML frontmatter:

```markdown
---
description: "Frontend Coding Rules"
globs:
  - "frontend/**/*.ts"
  - "frontend/**/*.tsx"
alwaysApply: false
---

# Rule content here...
```

- `globs`: File patterns that trigger this rule
- `alwaysApply`: If true, rule applies to all files
- When `globs` match the current file, the rule is automatically loaded

## Global Settings (Manual)

Cursor's global settings are GUI-based (stored in SQLite). To configure recommended rules:

1. Open **Cursor Settings** (Cmd+, or Ctrl+,)
2. Navigate to **Rules** > **User Rules**
3. Add the following recommended rules:

```
## Safety Rules

- Never run destructive commands without explicit confirmation:
  - rm -rf /, rm -rf ~, rm -rf .
  - git push --force to main/master
  - git reset --hard
  - git clean -fd
  - docker system prune
  - npm/pnpm/yarn publish

## Development Rules

- Always check current branch before work (git branch --show-current)
- Never work directly on main branch
- Create GitHub Issues before starting work
- Follow project coding conventions in documents/development/coding-rules/
```

## Customization

### Adding Project-Specific Rules

Create `.cursor/rules/[name].mdc` with YAML frontmatter:

```markdown
---
description: "My Custom Rule"
globs:
  - "src/**/*.ts"
alwaysApply: false
---

# My Custom Rule

Content here...
```
