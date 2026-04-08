'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Merge settings from a template into an existing settings file.
 *
 * Behavior:
 * - Creates a timestamped backup of the existing file
 * - Top-level keys from template are added as defaults (existing values preserved)
 * - permissions.deny lists are merged (union)
 * - permissions.allow is preserved (defaulted to [] if missing)
 * - All other permissions keys (defaultMode, additionalDirectories, etc.) are preserved
 * - hooks are preserved from existing file
 *
 * @param {string} targetPath - Path to the existing settings file (created if missing)
 * @param {string} templatePath - Path to the template settings file
 */
function mergeSettings(targetPath, templatePath) {
  // Read or initialize existing settings
  let existing = {};
  if (fs.existsSync(targetPath)) {
    // Create backup
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const backup = `${targetPath}.backup.${timestamp}`;
    fs.copyFileSync(targetPath, backup);
    console.log(`  Backup created: ${backup}`);

    existing = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  } else {
    const dir = path.dirname(targetPath);
    fs.mkdirSync(dir, { recursive: true });
  }

  const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

  // Apply top-level settings from template as defaults (existing values take precedence)
  for (const key of Object.keys(template)) {
    if (key !== 'permissions' && key !== 'hooks') {
      if (!(key in existing)) {
        existing[key] = template[key];
      }
    }
  }

  // Ensure permissions object exists
  if (!existing.permissions) {
    existing.permissions = {};
  }

  // Merge deny lists (union) - all other permissions keys are preserved
  const existingDeny = new Set(existing.permissions.deny || []);
  const templateDeny = template.permissions?.deny || [];
  for (const rule of templateDeny) {
    existingDeny.add(rule);
  }
  existing.permissions.deny = [...existingDeny].sort();

  // Ensure allow list exists
  if (!existing.permissions.allow) {
    existing.permissions.allow = [];
  }

  // Write merged settings
  fs.writeFileSync(targetPath, JSON.stringify(existing, null, 2) + '\n', 'utf8');
  console.log('  Settings merged');
}

module.exports = { mergeSettings };
