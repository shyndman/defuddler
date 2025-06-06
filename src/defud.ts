#!/usr/bin/env node

import { program } from './cli/caporal.js';
import chalk from 'chalk';
import logger, { setLogLevel } from './io/logger.js';

// Import commands
import { setupMainCommand } from './cli/commands/main.js';
import { setupCompletionsCommand } from './cli/commands/completions.js';
import { setupInfoCommand } from './cli/commands/info.js';
import { setupUserAgentsCommand } from './cli/commands/user-agents.js';

const packageJson = {
  name: '@shyndman/defuddler',
  version: '0.1.0',
  description: 'A command-line interface for extracting main content from web pages and articles',
};

// Setup program metadata
program.name('defud').description(packageJson.description).version(packageJson.version);

// Setup global options
program.option('-v, --verbose', 'Enable verbose logging', {
  global: true,
  validator: program.BOOLEAN,
});

// Process verbose flag before command execution
if (process.argv.includes('-v') || process.argv.includes('--verbose')) {
  setLogLevel(true);
  logger.debug('Verbose logging enabled');
}

// Setup commands
setupMainCommand(program);
setupCompletionsCommand(program);
setupInfoCommand(program);
setupUserAgentsCommand(program);

try {
  // Run the program (Caporal handles parsing arguments)
  await program.run();
} catch (err: unknown) {
  // Handle errors
  const errorMessage =
    err && typeof err === 'object' && 'message' in err
      ? (err as { message?: string }).message
      : 'An unknown error occurred';

  console.error(chalk.red(`Error: ${errorMessage || 'An unknown error occurred'}`));
  if (process.argv.includes('-v') || process.argv.includes('--verbose')) {
    console.error(err);
  }
  process.exit(1);
}
