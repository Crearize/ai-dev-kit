'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const {
  PACKAGE_ROOT,
  createPrompter,
} = require('./utils');
const { mergeSettings } = require('./merge-settings');

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

  const prompter = createPrompter();

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
      }
    }

    console.log('');
    console.log('Personal setup complete!');
  } finally {
    prompter.close();
  }
}

function setupClaudeCodeGlobal() {
  console.log('');
  console.log('--- Claude Code global settings ---');

  const claudeSettings = path.join(os.homedir(), '.claude', 'settings.json');
  const templatePath = path.join(PACKAGE_ROOT, 'templates', 'settings-global.json.template');

  mergeSettings(claudeSettings, templatePath);
  console.log('  Claude Code global settings updated');
}

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
      execSync('pbcopy', { input: rules });
      copied = true;
    } else if (os.platform() === 'win32') {
      execSync('clip', { input: rules });
      copied = true;
    } else {
      // Try xclip on Linux
      execSync('xclip -selection clipboard', { input: rules });
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

module.exports = { doPersonal };
