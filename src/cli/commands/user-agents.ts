import chalk from 'chalk';
import ora from 'ora';
import { Program } from '../caporal.js';
import { getAvailableBrowserOsCombinations } from '../../http/user-agents.js';

export function setupUserAgentsCommand(program: Program): void {
  program
    .command(
      'user-agents',
      'List available browser-OS combinations and crawler types for the --user-agent option'
    )
    .action(async ({ logger }) => {
      logger.debug('Listing available user agent options');

      const spinner = ora('Fetching available user agent options...').start();

      try {
        // Get available browser-OS combinations and crawler types
        const combinations = await getAvailableBrowserOsCombinations();

        spinner.succeed('Available user agent options:');

        // Separate browser-OS combinations and crawler types
        const browserGroups: Record<string, string[]> = {};
        const crawlerTypes: string[] = [];

        combinations.forEach((combo) => {
          if (combo.startsWith('crawler-')) {
            crawlerTypes.push(combo.substring(8)); // Remove 'crawler-' prefix
          } else {
            const [browser, os] = combo.split('-');
            if (!browserGroups[browser]) {
              browserGroups[browser] = [];
            }
            browserGroups[browser].push(os);
          }
        });

        // Display browser-OS combinations
        console.log(`\n${chalk.bold('Browser-OS Combinations:')}`);
        Object.entries(browserGroups).forEach(([browser, osList]) => {
          console.log(`\n  ${chalk.bold(browser)}:`);
          osList.forEach((os) => {
            console.log(`    ${chalk.cyan(`${browser}-${os}`)}`);
          });
        });

        // Display crawler types
        console.log(`\n${chalk.bold('Crawler Types:\n')}`);
        crawlerTypes.sort().forEach((crawlerName) => {
          console.log(`  ${chalk.cyan(`crawler-${crawlerName}`)}`);
        });

        // Display usage examples
        console.log(`\n${chalk.yellow('Usage Examples:')}`);
        console.log(`  defud [command] --user-agent firefox-linux`);
        console.log(`  defud [command] --user-agent crawler-googlebot`);
        console.log(`  defud [command] --user-agent "Mozilla/5.0 (custom user agent)"`);
      } catch (error: unknown) {
        spinner.fail('Failed to fetch user agent options');
        const errorMessage =
          error && typeof error === 'object' && 'message' in error
            ? (error as { message?: string }).message
            : 'An unknown error occurred';
        logger.error(chalk.red(`Error: ${errorMessage || 'An unknown error occurred'}`));
        process.exit(1);
      }
    });
}
