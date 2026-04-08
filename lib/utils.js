'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');

/** Root directory of ai-dev-helm package */
const PACKAGE_ROOT = path.resolve(__dirname, '..');

function printHeader() {
  console.log('');
  console.log('ai-dev-helm Setup');
  console.log('=================');
  console.log('');
}

/**
 * Prompt helper that works with both interactive and piped input.
 * Uses a line queue to handle buffered pipe input correctly.
 */
function createPrompter() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: process.stdin.isTTY || false,
  });

  const lineQueue = [];
  let lineWaiter = null;
  let closed = false;

  rl.on('line', (line) => {
    if (lineWaiter) {
      const resolve = lineWaiter;
      lineWaiter = null;
      resolve(line.trim());
    } else {
      lineQueue.push(line.trim());
    }
  });

  rl.on('close', () => {
    closed = true;
    if (lineWaiter) {
      const resolve = lineWaiter;
      lineWaiter = null;
      resolve(null);
    }
  });

  function getLine() {
    return new Promise((resolve) => {
      if (lineQueue.length > 0) {
        resolve(lineQueue.shift());
      } else if (closed) {
        resolve(null);
      } else {
        lineWaiter = resolve;
      }
    });
  }

  async function promptInput(prompt) {
    process.stdout.write(prompt);
    const answer = await getLine();
    if (answer === null) {
      console.log('');
      console.log('Input ended. Exiting.');
      process.exit(0);
    }
    return answer;
  }

  async function promptSelect(prompt, options) {
    console.log(prompt);
    options.forEach((opt, i) => {
      console.log(`  ${i + 1}) ${opt}`);
    });

    while (true) {
      const answer = await promptInput('> ');
      const num = parseInt(answer, 10);
      if (num >= 1 && num <= options.length) {
        return num - 1;
      }
      console.log(`Enter a number between 1 and ${options.length}`);
    }
  }

  async function promptMultiple(prompt) {
    const answer = await promptInput(prompt);
    return answer.split(/\s+/).filter(Boolean);
  }

  function close() {
    rl.close();
  }

  return { promptInput, promptSelect, promptMultiple, close };
}

/**
 * Recursively copy a directory. Cleans up on failure.
 * @param {string} src - Source directory path
 * @param {string} dest - Destination directory path
 */
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  try {
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyDirSync(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  } catch (err) {
    // Clean up partially copied directory
    try {
      fs.rmSync(dest, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
    throw new Error(`Failed to copy ${src} to ${dest}: ${err.message}`);
  }
}

/**
 * Copy files from src directory to dest directory (non-recursive, files only).
 * @param {string} src - Source directory path
 * @param {string} dest - Destination directory path
 */
function copyFilesSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.isFile()) {
      fs.copyFileSync(path.join(src, entry.name), path.join(dest, entry.name));
    }
  }
}

/**
 * Try to create a symlink/junction, fall back to directory copy.
 * On Windows, uses NTFS junction (no admin required).
 * @param {string} target - Target directory to link to
 * @param {string} linkPath - Path where the link/copy will be created
 */
function linkOrCopy(target, linkPath) {
  // Remove existing
  if (fs.existsSync(linkPath)) {
    fs.rmSync(linkPath, { recursive: true, force: true });
  }

  try {
    if (os.platform() === 'win32') {
      // Junction for directories on Windows (no admin needed)
      fs.symlinkSync(path.resolve(target), linkPath, 'junction');
      console.log(`  Junction created: ${linkPath} -> ${target}`);
    } else {
      // Relative symlink on Unix
      const relTarget = path.relative(path.dirname(linkPath), target);
      fs.symlinkSync(relTarget, linkPath);
      console.log(`  Symlink created: ${linkPath} -> ${relTarget}`);
    }
  } catch {
    copyDirSync(target, linkPath);
    console.log(`  Symlink/junction failed. Copied ${target} -> ${linkPath}`);
    console.log('  Note: Changes to skills/ won\'t auto-reflect. Re-run setup after updates.');
  }
}

/**
 * Detect available tech stacks (directories under stacks/, excluding _template).
 * @returns {string[]} Array of stack directory names
 */
function detectStacks() {
  const stacksDir = path.join(PACKAGE_ROOT, 'stacks');
  if (!fs.existsSync(stacksDir)) return [];
  return fs.readdirSync(stacksDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== '_template')
    .map((d) => d.name);
}

module.exports = {
  PACKAGE_ROOT,
  printHeader,
  createPrompter,
  copyDirSync,
  copyFilesSync,
  linkOrCopy,
  detectStacks,
};
