'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const childProcess = require('child_process');
const utils = require('./utils');
const mergeSettingsModule = require('./merge-settings');

async function doPersonal() {
  console.log('Personal environment setup');
  console.log('');

  console.log('Available options:');
  console.log('');
  console.log('  1) Claude Code global settings');
  console.log('     Block destructive commands, safety hooks');
  console.log('');
  console.log('  2) Cursor global settings guide');
  console.log('     Copy recommended rules to clipboard');
  console.log('');

  const prompter = utils.createPrompter();

  try {
    const selections = await prompter.promptMultiple('Select options (space-separated): ');

    for (const sel of selections) {
      switch (sel) {
        case '1':
          setupClaudeCodeGlobal();
          break;
        case '2':
          setupCursorGlobal();
          break;
        default:
          console.log(`  Warning: "${sel}" is not a valid option, skipping`);
          break;
      }
    }

    console.log('');
    console.log('Personal setup complete!');
  } finally {
    prompter.close();
  }
}

/**
 * Apply Claude Code global safety settings by merging template into ~/.claude/settings.json.
 */
function setupClaudeCodeGlobal() {
  console.log('');
  console.log('--- Claude Code global settings ---');

  const claudeSettings = path.join(os.homedir(), '.claude', 'settings.json');
  const templatePath = path.join(utils.PACKAGE_ROOT, 'templates', 'settings-global.json.template');

  mergeSettingsModule.mergeSettings(claudeSettings, templatePath);
  console.log('  Claude Code global settings updated');
}

/**
 * Display Cursor global safety rules and copy to clipboard if available.
 * Uses platform-specific clipboard commands (pbcopy/clip/xclip).
 */
function setupCursorGlobal() {
  console.log('');
  console.log('--- Cursor global settings ---');
  console.log('');
  console.log('Cursor global rules are managed via GUI (SQLite-based).');
  console.log('Please manually configure:');
  console.log('');
  console.log('  Cursor Settings -> Rules -> User Rules');
  console.log('');

  const rules = `## Safety Rules

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
- Follow project coding conventions in documents/development/coding-rules/`;

  // Try to copy to clipboard
  let copied = false;
  try {
    if (os.platform() === 'darwin') {
      childProcess.execSync('pbcopy', { input: rules });
      copied = true;
    } else if (os.platform() === 'win32') {
      childProcess.execSync('clip', { input: rules });
      copied = true;
    } else {
      // Try xclip on Linux
      childProcess.execSync('xclip -selection clipboard', { input: rules });
      copied = true;
    }
  } catch {
    // Clipboard not available
  }

  if (copied) {
    console.log('  Recommended rules copied to clipboard');
    console.log('  Paste into Cursor Settings -> Rules -> User Rules');
  } else {
    console.log('Recommended rules:');
    console.log('---');
    console.log(rules);
    console.log('---');
    console.log('  (Clipboard not available. Please copy manually.)');
  }
}

module.exports = { doPersonal, _setupClaudeCodeGlobal: setupClaudeCodeGlobal, _setupCursorGlobal: setupCursorGlobal };
