# ai-dev-kit Setup Script for Windows (PowerShell)
# Usage: .\setup.ps1 init | .\setup.ps1 personal

param(
    [Parameter(Position=0)]
    [ValidateSet("init", "personal")]
    [string]$Mode
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# --- Helper functions ---

function Write-Header {
    Write-Host ""
    Write-Host "ai-dev-kit Setup" -ForegroundColor Cyan
    Write-Host "================" -ForegroundColor Cyan
    Write-Host ""
}

function Read-Selection {
    param(
        [string]$Prompt,
        [string[]]$Options
    )
    Write-Host $Prompt
    for ($i = 0; $i -lt $Options.Count; $i++) {
        Write-Host "  $($i+1)) $($Options[$i])"
    }
    while ($true) {
        $choice = Read-Host ">"
        if ($choice -match '^\d+$' -and [int]$choice -ge 1 -and [int]$choice -le $Options.Count) {
            return [int]$choice - 1
        }
        Write-Host "Enter a number between 1 and $($Options.Count)"
    }
}

function New-LinkOrCopy {
    param(
        [string]$Source,
        [string]$Target
    )

    if (Test-Path $Target) {
        Remove-Item $Target -Recurse -Force
    }

    try {
        # Try junction (no admin required for directories)
        New-Item -ItemType Junction -Path $Target -Target $Source -ErrorAction Stop | Out-Null
        Write-Host "  Junction created: $Target -> $Source"
    } catch {
        # Fallback: copy
        Copy-Item -Path $Source -Destination $Target -Recurse
        Write-Host "  Junction failed. Copied $Source -> $Target"
        Write-Host "  Note: Changes to skills/ won't auto-reflect. Re-run setup after updates."
    }
}

function Merge-Settings {
    param(
        [string]$TargetFile,
        [string]$MergeFile
    )

    # Backup
    if (Test-Path $TargetFile) {
        $backup = "$TargetFile.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
        Copy-Item $TargetFile $backup
        Write-Host "  Backup created: $backup"
        $existing = Get-Content $TargetFile -Raw | ConvertFrom-Json -AsHashtable
    } else {
        $parentDir = Split-Path -Parent $TargetFile
        if (-not (Test-Path $parentDir)) {
            New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
        }
        $existing = @{ permissions = @{ deny = @(); allow = @() } }
    }

    $new = Get-Content $MergeFile -Raw | ConvertFrom-Json -AsHashtable

    # Merge deny lists (union)
    $existingDeny = @($existing.permissions.deny)
    $newDeny = @($new.permissions.deny)
    $merged = ($existingDeny + $newDeny) | Sort-Object -Unique
    $existing.permissions.deny = @($merged)

    # Preserve allow list
    if (-not $existing.permissions.ContainsKey('allow')) {
        $existing.permissions.allow = @()
    }

    $existing | ConvertTo-Json -Depth 10 | Set-Content $TargetFile -Encoding UTF8
    Write-Host "  Settings merged"
}

function Get-AvailableStacks {
    $stacks = @()
    Get-ChildItem -Path "$ScriptDir\stacks" -Directory | ForEach-Object {
        if ($_.Name -ne "_template") {
            $stacks += $_.Name
        }
    }
    return $stacks
}

# --- init mode ---

function Invoke-Init {
    Write-Header
    Write-Host "Project initialization mode"
    Write-Host ""

    # 1. Project name
    $ProjectName = Read-Host "Project name"
    $ProjectDir = Get-Location

    # 2. AI tool selection
    Write-Host ""
    $toolChoice = Read-Selection "Select AI tool(s):" @(
        "Claude Code only", "Cursor only", "Claude Code + Cursor"
    )

    # 3. Skill scope
    Write-Host ""
    $skillChoice = Read-Selection "Select skill scope:" @(
        "All skills (superpowers + project)",
        "superpowers skills only",
        "project skills only"
    )

    # 4. Detect and apply stacks
    $stacks = Get-AvailableStacks
    $selectedStacks = @()

    if ($stacks.Count -eq 1) {
        Write-Host ""
        Write-Host "Tech stack: $($stacks[0]) (auto-applied)"
        $selectedStacks = $stacks
    } elseif ($stacks.Count -gt 1) {
        Write-Host ""
        Write-Host "Available tech stacks (enter numbers separated by spaces):"
        for ($i = 0; $i -lt $stacks.Count; $i++) {
            Write-Host "  $($i+1)) $($stacks[$i])"
        }
        $stackInput = (Read-Host ">") -split '\s+'
        foreach ($idx in $stackInput) {
            if ([int]$idx -ge 1 -and [int]$idx -le $stacks.Count) {
                $selectedStacks += $stacks[[int]$idx - 1]
            }
        }
    }

    # 5. Copy skills
    Write-Host ""
    Write-Host "--- Setting up skills ---"
    New-Item -ItemType Directory -Path "$ProjectDir\skills" -Force | Out-Null
    switch ($skillChoice) {
        0 { # All
            Copy-Item -Path "$ScriptDir\skills\superpowers" -Destination "$ProjectDir\skills\" -Recurse -Force
            Copy-Item -Path "$ScriptDir\skills\project" -Destination "$ProjectDir\skills\" -Recurse -Force
        }
        1 { # superpowers only
            Copy-Item -Path "$ScriptDir\skills\superpowers" -Destination "$ProjectDir\skills\" -Recurse -Force
        }
        2 { # project only
            Copy-Item -Path "$ScriptDir\skills\project" -Destination "$ProjectDir\skills\" -Recurse -Force
        }
    }
    Write-Host "  Skills copied to skills/"

    # 6. Copy stacks and shared resources
    Write-Host ""
    Write-Host "--- Setting up documents and review guides ---"
    foreach ($stack in $selectedStacks) {
        $stackDir = "$ScriptDir\stacks\$stack"
        if (Test-Path $stackDir) {
            # Review guides
            if (Test-Path "$stackDir\review-guides") {
                New-Item -ItemType Directory -Path "$ProjectDir\.github" -Force | Out-Null
                Copy-Item "$stackDir\review-guides\*" "$ProjectDir\.github\" -Force
            }
            # Documents
            if (Test-Path "$stackDir\documents") {
                New-Item -ItemType Directory -Path "$ProjectDir\documents\development" -Force | Out-Null
                Copy-Item "$stackDir\documents\*" "$ProjectDir\documents\development\" -Recurse -Force
            }
        }
    }

    # Shared resources
    if (Test-Path "$ScriptDir\shared\review-guides") {
        New-Item -ItemType Directory -Path "$ProjectDir\.github" -Force | Out-Null
        Copy-Item "$ScriptDir\shared\review-guides\*" "$ProjectDir\.github\" -Force
    }
    if (Test-Path "$ScriptDir\shared\documents") {
        New-Item -ItemType Directory -Path "$ProjectDir\documents\development" -Force | Out-Null
        Copy-Item "$ScriptDir\shared\documents\*" "$ProjectDir\documents\development\" -Recurse -Force
    }
    Write-Host "  Documents and review guides copied"

    # 7. PR template
    New-Item -ItemType Directory -Path "$ProjectDir\.github" -Force | Out-Null
    Copy-Item "$ScriptDir\templates\PULL_REQUEST_TEMPLATE.md" "$ProjectDir\.github\" -Force
    Write-Host "  PR template copied"

    # 8. AI tool specific setup
    Write-Host ""
    Write-Host "--- Setting up AI tool configuration ---"

    # Claude Code setup
    if ($toolChoice -eq 0 -or $toolChoice -eq 2) {
        Write-Host "Setting up Claude Code..."
        New-Item -ItemType Directory -Path "$ProjectDir\.claude\rules" -Force | Out-Null

        # Link skills
        if (Test-Path "$ProjectDir\skills") {
            New-LinkOrCopy "$ProjectDir\skills" "$ProjectDir\.claude\skills"
        }

        # Copy rules
        foreach ($stack in $selectedStacks) {
            $stackRules = "$ScriptDir\stacks\$stack\rules"
            if (Test-Path $stackRules) {
                Copy-Item "$stackRules\*" "$ProjectDir\.claude\rules\" -Recurse -Force
            }
        }

        # Settings
        if (-not (Test-Path "$ProjectDir\.claude\settings.json")) {
            Copy-Item "$ScriptDir\templates\settings.json.template" "$ProjectDir\.claude\settings.json"
            Write-Host "  settings.json created"
        }

        # CLAUDE.md
        if (-not (Test-Path "$ProjectDir\CLAUDE.md")) {
            Copy-Item "$ScriptDir\templates\CLAUDE.md.template" "$ProjectDir\CLAUDE.md"
            Write-Host "  CLAUDE.md created"
        }
        Write-Host "  Claude Code setup complete"
    }

    # Cursor setup
    if ($toolChoice -eq 1 -or $toolChoice -eq 2) {
        Write-Host "Setting up Cursor..."
        New-Item -ItemType Directory -Path "$ProjectDir\.cursor\rules" -Force | Out-Null

        # Link skills
        if (Test-Path "$ProjectDir\skills") {
            New-LinkOrCopy "$ProjectDir\skills" "$ProjectDir\.cursor\skills"
        }

        # Convert rules to .mdc
        foreach ($stack in $selectedStacks) {
            $stackRules = "$ScriptDir\stacks\$stack\rules"
            if (Test-Path $stackRules) {
                Get-ChildItem "$stackRules" -Filter "*.md" -Recurse | ForEach-Object {
                    $mdFile = $_
                    $parentDir = $mdFile.Directory.Name
                    $filename = [System.IO.Path]::GetFileNameWithoutExtension($mdFile.Name)
                    $description = (Get-Content $mdFile.FullName | Select-String "^# " | Select-Object -First 1) -replace "^# ", ""

                    $globs = switch ($parentDir) {
                        "frontend" { "  - `"frontend/**/*.ts`"`n  - `"frontend/**/*.tsx`"" }
                        "backend" { "  - `"backend/**/*.java`"" }
                        default { "" }
                    }
                    $alwaysApply = if ($globs) { "false" } else { "true" }

                    $mdcContent = "---`ndescription: `"$description`"`n"
                    if ($globs) {
                        $mdcContent += "globs:`n$globs`n"
                    }
                    $mdcContent += "alwaysApply: $alwaysApply`n---`n`n"
                    $mdcContent += Get-Content $mdFile.FullName -Raw

                    $mdcFile = "$ProjectDir\.cursor\rules\$parentDir-$filename.mdc"
                    Set-Content $mdcFile $mdcContent -Encoding UTF8
                    Write-Host "  Rule created: $(Split-Path $mdcFile -Leaf)"
                }
            }
        }

        # .cursorrules
        if (-not (Test-Path "$ProjectDir\.cursorrules")) {
            Copy-Item "$ScriptDir\templates\cursorrules.template" "$ProjectDir\.cursorrules"
            Write-Host "  .cursorrules created"
        }
        Write-Host "  Cursor setup complete"
    }

    # 9. Replace placeholders
    foreach ($file in @("$ProjectDir\CLAUDE.md", "$ProjectDir\.cursorrules")) {
        if (Test-Path $file) {
            $content = Get-Content $file -Raw
            $content = $content -replace '\{\{PROJECT_NAME\}\}', $ProjectName
            Set-Content $file $content -Encoding UTF8
        }
    }

    Write-Host ""
    Write-Host "Setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Review and customize CLAUDE.md / .cursorrules"
    Write-Host "  2. Update tech stack and port information"
    Write-Host "  3. Add project-specific coding rules"
    Write-Host "  4. Commit the generated files"
}

# --- personal mode ---

function Invoke-Personal {
    Write-Header
    Write-Host "Personal environment setup"
    Write-Host ""

    Write-Host "Available options:"
    Write-Host ""
    Write-Host "  1) Claude Code global settings"
    Write-Host "     Block destructive commands, safety hooks"
    Write-Host ""
    Write-Host "  2) Cursor global settings guide"
    Write-Host "     Copy recommended rules to clipboard"
    Write-Host ""
    $selections = (Read-Host "Select options (space-separated)") -split '\s+'

    foreach ($sel in $selections) {
        switch ($sel) {
            "1" {
                Write-Host ""
                Write-Host "--- Claude Code global settings ---"
                $claudeSettings = "$env:USERPROFILE\.claude\settings.json"
                Merge-Settings $claudeSettings "$ScriptDir\templates\settings-global.json.template"
                Write-Host "  Claude Code global settings updated"
            }
            "2" {
                Write-Host ""
                Write-Host "--- Cursor global settings ---"
                Write-Host ""
                Write-Host "Cursor global rules are managed via GUI (SQLite-based)."
                Write-Host "Please manually configure:"
                Write-Host ""
                Write-Host "  Cursor Settings -> Rules -> User Rules"
                Write-Host ""

                # Copy rules to clipboard
                $rules = @"
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
"@
                Set-Clipboard $rules
                Write-Host "  Recommended rules copied to clipboard"
                Write-Host "  Paste into Cursor Settings -> Rules -> User Rules"
            }
        }
    }

    Write-Host ""
    Write-Host "Personal setup complete!" -ForegroundColor Green
}

# --- Main ---

if (-not $Mode) {
    Write-Host "Usage: .\setup.ps1 {init|personal}"
    Write-Host ""
    Write-Host "  init      - Set up development foundation in a project"
    Write-Host "  personal  - Apply global settings to personal environment"
    exit 1
}

switch ($Mode) {
    "init" { Invoke-Init }
    "personal" { Invoke-Personal }
}
