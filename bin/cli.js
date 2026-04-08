#!/usr/bin/env node
'use strict';

const path = require('path');
const { printHeader } = require('../lib/utils');

const mode = process.argv[2];

if (!mode || !['init', 'personal'].includes(mode)) {
  console.log('Usage: ai-dev-helm {init|personal}');
  console.log('');
  console.log('  init      - Set up development foundation in a project');
  console.log('  personal  - Apply global settings to personal environment');
  process.exit(1);
}

async function main() {
  printHeader();

  if (mode === 'init') {
    const { doInit } = require('../lib/init');
    await doInit();
  } else {
    const { doPersonal } = require('../lib/personal');
    await doPersonal();
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
