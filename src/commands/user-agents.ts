import chalk from 'chalk';
import ora from 'ora';
import { Program } from '../utils/caporal.js';
import { getAvailableBrowserOsCombinations } from '../utils/user-agents.js';

export function setupUserAgentsCommand(program: Program): void {
  program
    .command('user-agents', 'List available browser-OS combinations for the --user-agent option')
    .action(async ({ logger }) => {
      logger.debug('Listing available browser-OS combinations');

      const spinner = ora('Fetching available browser-OS combinations...').start();

      try {
        // Get available browser-OS combinations
        const combinations = await getAvailableBrowserOsCombinations();
        
        spinner.succeed('Available browser-OS combinations:');
        
        // Group by browser
        const browserGroups: Record<string, string[]> = {};
        combinations.forEach(combo => {
          const [browser, os] = combo.split('-');
          if (!browserGroups[browser]) {
            browserGroups[browser] = [];
          }
          browserGroups[browser].push(os);
        });
        
        // Display grouped combinations
        Object.entries(browserGroups).forEach(([browser, osList]) => {
          console.log(`\n${chalk.bold(browser)}:`);
          osList.forEach(os => {
            console.log(`  ${chalk.cyan(`${browser}-${os}`)}`);
          });
        });
        
        console.log(`\n${chalk.yellow('Usage:')} defuddle [command] --user-agent firefox-linux`);
        
      } catch (error: unknown) {
        spinner.fail('Failed to fetch browser-OS combinations');
        const errorMessage = error && typeof error === 'object' && 'message' in error
          ? (error as { message?: string }).message
          : 'An unknown error occurred';
        logger.error(chalk.red(`Error: ${errorMessage || 'An unknown error occurred'}`));
        process.exit(1);
      }
    });
}
