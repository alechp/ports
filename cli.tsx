#!/usr/bin/env bun
import { Command } from 'commander';
import { renderTUI } from './src/commands/tui';
import { upgradeCommand } from './src/commands/upgrade';
import { outputCommand } from './src/commands/output';
import { indexCommand } from './src/commands/index';

const packageJson = require('./package.json');

const program = new Command();

program
  .name('ports')
  .description('Port & URL Scanner - Scan projects for ports and URLs')
  .version(packageJson.version);

// TUI command (default)
program
  .command('tui', { isDefault: true })
  .description('Open interactive TUI to browse ports and URLs')
  .action(renderTUI);

// Upgrade command
program
  .command('upgrade')
  .description('Upgrade ports CLI to latest version from GitHub releases')
  .action(upgradeCommand);

// Output command
program
  .command('output')
  .description('Generate list of common local ports to avoid conflicts (for Claude)')
  .option('-f, --format <type>', 'Output format: text, json, or markdown', 'text')
  .action(outputCommand);

// Index command
program
  .command('index')
  .description('Index a directory to search for ports and URLs')
  .argument('<directory>', 'Directory to search')
  .option('-o, --output <file>', 'Save output to file')
  .action(indexCommand);

program.parse();
