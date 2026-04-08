#!/usr/bin/env node
'use strict';

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { printHeader } = require('../lib/utils');

yargs(hideBin(process.argv))
  .scriptName('ai-dev-helm')
  .usage('$0 <command> [options]')
  .command(
    'init',
    'Set up development foundation in a project',
    (yargs) => {
      return yargs
        .option('dry-run', {
          type: 'boolean',
          describe: 'Show what would be done without making changes',
          default: false,
        })
        .option('verbose', {
          type: 'boolean',
          describe: 'Show detailed output and stack traces on error',
          default: false,
        });
    },
    async (argv) => {
      printHeader();
      console.log('Project initialization mode');
      console.log('');
      const { doInit } = require('../lib/init');
      await doInit({ dryRun: argv.dryRun });
    }
  )
  .command(
    'personal',
    'Apply global settings to personal environment',
    (yargs) => {
      return yargs
        .option('verbose', {
          type: 'boolean',
          describe: 'Show detailed output and stack traces on error',
          default: false,
        });
    },
    async (argv) => {
      printHeader();
      const { doPersonal } = require('../lib/personal');
      await doPersonal();
    }
  )
  .demandCommand(1, 'Please specify a command: init or personal')
  .strict()
  .help()
  .version()
  .fail((msg, err, yargs) => {
    if (err) {
      console.error(`Error: ${err.message}`);
      if (process.argv.includes('--verbose')) {
        console.error(err.stack);
      }
      console.error('');
      console.error('Run with --verbose for more details.');
    } else {
      console.error(msg);
      console.error('');
      yargs.showHelp();
    }
    process.exit(1);
  })
  .parse();

process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err && err.message ? err.message : err}`);
  if (process.argv.includes('--verbose')) {
    console.error(err && err.stack ? err.stack : '');
  }
  process.exit(1);
});
