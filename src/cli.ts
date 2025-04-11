#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import debug from 'debug';

// Import commands
import { setupMainCommand } from './commands/main.js';
import { setupCompletionsCommand } from './commands/completions.js';
import { setupValidateCommand } from './commands/validate.js';
import { setupInfoCommand } from './commands/info.js';

const logger = debug('defuddle:cli');
const packageJson = {
  name: '@shyndman/defuddle-cli',
  version: '0.1.0',
  description: 'A command-line interface for extracting main content from web pages and articles',
};

// Create the program
const program = new Command();

// Setup program metadata
program
  .name('defuddle')
  .description(packageJson.description)
  .version(packageJson.version, '-V, --version', 'Output the version number');

// Setup global options
program
  .option('-v, --verbose', 'Enable verbose logging')
  .hook('preAction', (thisCommand) => {
    if (thisCommand.opts().verbose) {
      debug.enable('defuddle:*');
      logger('Verbose logging enabled');
    }
  });

// Setup commands
setupMainCommand(program);
setupCompletionsCommand(program);
setupValidateCommand(program);
setupInfoCommand(program);

// Handle errors
program.exitOverride();

try {
  await program.parseAsync(process.argv);
} catch (err: unknown) {
  // Type guard for CommanderError
  if (err && typeof err === 'object' && 'code' in err) {
    const commanderErr = err as { code: string; message?: string };

    if (commanderErr.code === 'commander.help') {
      // Help was displayed, exit gracefully
      process.exit(0);
    } else if (commanderErr.code === 'commander.version') {
      // Version was displayed, exit gracefully
      process.exit(0);
    } else if (commanderErr.code === 'commander.unknownOption') {
      console.error(chalk.red(`Error: ${commanderErr.message || ''}`));
      process.exit(1);
    }
  }

  // Handle any other errors
  const errorMessage = err && typeof err === 'object' && 'message' in err
    ? (err as { message?: string }).message
    : 'An unknown error occurred';

  console.error(chalk.red(`Error: ${errorMessage || 'An unknown error occurred'}`));
  if (program.opts().verbose) {
    console.error(err);
  }
  process.exit(1);
}
