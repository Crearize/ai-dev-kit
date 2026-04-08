'use strict';

const fs = require('fs');
const path = require('path');
const {
  PACKAGE_ROOT,
  createPrompter,
  copyDirSync,
  copyFilesSync,
  linkOrCopy,
  detectStacks,
} = require('./utils');

async function doInit() {
  console.log('Project initialization mode');
  console.log('');

  const prompter = createPrompter();
  const projectDir = process.cwd();

  try {
    // 1. Project name
    const projectName = await prompter.promptInput('Project name: ');

    // 2. AI tool selection
    console.log('');
    const toolChoice = await prompter.promptSelect('Select AI tool(s):', [
      'Claude Code only',
      'Cursor only',
      'Claude Code + Cursor',
    ]);

    // 3. Skill scope
    console.log('');
    const skillChoice = await prompter.promptSelect('Select skill scope:', [
      'All skills (superpowers + project)',
      'superpowers skills only',
      'project skills only',
    ]);

    // 4. Detect and select stacks
    const stacks = detectStacks();
    let selectedStacks = [];

    if (stacks.length === 1) {
      console.log('');
      console.log(`Tech stack: ${stacks[0]} (auto-applied)`);
      selectedStacks = [stacks[0]];
    } else if (stacks.length > 1) {
      console.log('');
      console.log('Available tech stacks (enter numbers separated by spaces):');
      stacks.forEach((s, i) => console.log(`  ${i + 1}) ${s}`));
      const stackInput = await prompter.promptMultiple('> ');
      for (const idx of stackInput) {
        const num = parseInt(idx, 10);
        if (num >= 1 && num <= stacks.length) {
          selectedStacks.push(stacks[num - 1]);
        }
      }
    }

    // 5. Copy skills
    console.log('');
    console.log('--- Setting up skills ---');
    const skillsDest = path.join(projectDir, 'skills');
    fs.mkdirSync(skillsDest, { recursive: true });

    if (skillChoice === 0 || skillChoice === 1) {
      // superpowers
      copyDirSync(
        path.join(PACKAGE_ROOT, 'skills', 'superpowers'),
        path.join(skillsDest, 'superpowers')
      );
    }
    if (skillChoice === 0 || skillChoice === 2) {
      // project
      copyDirSync(
        path.join(PACKAGE_ROOT, 'skills', 'project'),
        path.join(skillsDest, 'project')
      );
    }
    console.log('  Skills copied to skills/');

    // 6. Copy stacks and shared resources
    console.log('');
    console.log('--- Setting up documents and review guides ---');
    for (const stack of selectedStacks) {
      const stackDir = path.join(PACKAGE_ROOT, 'stacks', stack);
      if (!fs.existsSync(stackDir)) continue;

      // Review guides -> .github/
      const reviewDir = path.join(stackDir, 'review-guides');
      if (fs.existsSync(reviewDir)) {
        copyFilesSync(reviewDir, path.join(projectDir, '.github'));
      }

      // Documents -> documents/development/
      const docsDir = path.join(stackDir, 'documents');
      if (fs.existsSync(docsDir)) {
        copyDirSync(docsDir, path.join(projectDir, 'documents', 'development'));
      }
    }

    // Shared resources
    const sharedReview = path.join(PACKAGE_ROOT, 'shared', 'review-guides');
    if (fs.existsSync(sharedReview)) {
      copyFilesSync(sharedReview, path.join(projectDir, '.github'));
    }
    const sharedDocs = path.join(PACKAGE_ROOT, 'shared', 'documents');
    if (fs.existsSync(sharedDocs)) {
      copyDirSync(sharedDocs, path.join(projectDir, 'documents', 'development'));
    }
    console.log('  Documents and review guides copied');

    // 7. PR template
    const prTemplateSrc = path.join(PACKAGE_ROOT, 'templates', 'PULL_REQUEST_TEMPLATE.md');
    if (fs.existsSync(prTemplateSrc)) {
      fs.mkdirSync(path.join(projectDir, '.github'), { recursive: true });
      fs.copyFileSync(prTemplateSrc, path.join(projectDir, '.github', 'PULL_REQUEST_TEMPLATE.md'));
    }
    console.log('  PR template copied');

    // 8. AI tool specific setup
    console.log('');
    console.log('--- Setting up AI tool configuration ---');

    // Claude Code
    if (toolChoice === 0 || toolChoice === 2) {
      setupClaudeCode(projectDir, selectedStacks);
    }

    // Cursor
    if (toolChoice === 1 || toolChoice === 2) {
      setupCursor(projectDir, selectedStacks);
    }

    // 9. Replace placeholders
    for (const file of ['CLAUDE.md', '.cursorrules']) {
      const filePath = path.join(projectDir, file);
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }

    console.log('');
    console.log('Setup complete!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Review and customize CLAUDE.md / .cursorrules');
    console.log('  2. Update tech stack and port information');
    console.log('  3. Add project-specific coding rules');
    console.log('  4. Commit the generated files');
  } finally {
    prompter.close();
  }
}

function setupClaudeCode(projectDir, selectedStacks) {
  console.log('Setting up Claude Code...');

  // Create .claude/rules directory
  const claudeDir = path.join(projectDir, '.claude');
  fs.mkdirSync(path.join(claudeDir, 'rules'), { recursive: true });

  // Link skills
  const skillsDir = path.join(projectDir, 'skills');
  if (fs.existsSync(skillsDir)) {
    linkOrCopy(skillsDir, path.join(claudeDir, 'skills'));
  }

  // Copy rules from selected stacks
  for (const stack of selectedStacks) {
    const stackRules = path.join(PACKAGE_ROOT, 'stacks', stack, 'rules');
    if (fs.existsSync(stackRules)) {
      copyDirSync(stackRules, path.join(claudeDir, 'rules'));
    }
  }

  // Copy settings.json from template
  const settingsDest = path.join(claudeDir, 'settings.json');
  if (!fs.existsSync(settingsDest)) {
    fs.copyFileSync(
      path.join(PACKAGE_ROOT, 'templates', 'settings.json.template'),
      settingsDest
    );
    console.log('  settings.json created');
  } else {
    console.log('  settings.json already exists, skipping');
  }

  // Generate CLAUDE.md from template
  const claudeMdDest = path.join(projectDir, 'CLAUDE.md');
  if (!fs.existsSync(claudeMdDest)) {
    fs.copyFileSync(
      path.join(PACKAGE_ROOT, 'templates', 'CLAUDE.md.template'),
      claudeMdDest
    );
    console.log('  CLAUDE.md created');
  } else {
    console.log('  CLAUDE.md already exists, skipping');
  }

  console.log('  Claude Code setup complete');
}

function setupCursor(projectDir, selectedStacks) {
  console.log('Setting up Cursor...');

  // Create .cursor/rules directory
  const cursorDir = path.join(projectDir, '.cursor');
  fs.mkdirSync(path.join(cursorDir, 'rules'), { recursive: true });

  // Link skills
  const skillsDir = path.join(projectDir, 'skills');
  if (fs.existsSync(skillsDir)) {
    linkOrCopy(skillsDir, path.join(cursorDir, 'skills'));
  }

  // Convert and copy rules (.md -> .mdc)
  for (const stack of selectedStacks) {
    const stackRules = path.join(PACKAGE_ROOT, 'stacks', stack, 'rules');
    if (!fs.existsSync(stackRules)) continue;

    const mdFiles = findMdFiles(stackRules);
    for (const mdFile of mdFiles) {
      const filename = path.basename(mdFile, '.md');
      const parentDir = path.basename(path.dirname(mdFile));
      const content = fs.readFileSync(mdFile, 'utf8');

      // Extract first heading for description
      const headingMatch = content.match(/^# (.+)$/m);
      const description = headingMatch ? headingMatch[1] : `${filename} rules`;

      // Determine globs based on directory
      let globs = '';
      let alwaysApply = 'true';
      if (parentDir === 'frontend') {
        globs = '  - "frontend/**/*.ts"\n  - "frontend/**/*.tsx"';
        alwaysApply = 'false';
      } else if (parentDir === 'backend') {
        globs = '  - "backend/**/*.java"';
        alwaysApply = 'false';
      }

      // Generate .mdc file
      let mdcContent = `---\ndescription: "${description}"\n`;
      if (globs) {
        mdcContent += `globs:\n${globs}\n`;
      }
      mdcContent += `alwaysApply: ${alwaysApply}\n---\n\n${content}`;

      const mdcFile = path.join(cursorDir, 'rules', `${parentDir}-${filename}.mdc`);
      fs.writeFileSync(mdcFile, mdcContent, 'utf8');
      console.log(`  Rule created: ${path.basename(mdcFile)}`);
    }
  }

  // Generate .cursorrules from template
  const cursorrulesDest = path.join(projectDir, '.cursorrules');
  if (!fs.existsSync(cursorrulesDest)) {
    fs.copyFileSync(
      path.join(PACKAGE_ROOT, 'templates', 'cursorrules.template'),
      cursorrulesDest
    );
    console.log('  .cursorrules created');
  } else {
    console.log('  .cursorrules already exists, skipping');
  }

  console.log('  Cursor setup complete');
}

/**
 * Find all .md files recursively under a directory.
 */
function findMdFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMdFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

module.exports = { doInit };
