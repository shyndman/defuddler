import chalk from 'chalk';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import { JSDOM } from 'jsdom';
import open from 'open';
import ora from 'ora';
import os from 'os';
import path from 'path';
import { OutputFormat, InputSourceType } from '../../types/index.js';
import { extractContent } from '../../core/content.js';
import { extractCodeBlocks } from '../../core/extractors/index.js';
import { formatOutput } from '../../core/formatters/index.js';
import { determineInputType, getHtmlContent } from '../../io/input.js';
import { outputResult } from '../../io/output.js';
import { Program } from '../caporal.js';

export function setupMainCommand(program: Program): void {
  program
    .argument('[input]', 'URL, file path, or HTML content (if omitted, reads from stdin)')
    .option('-o, --output <path>', 'Write output to a file instead of stdout')
    .option('-f, --format <format>', 'Output format (text, html, json, markdown)', {
      validator: program.STRING,
      default: 'text',
    })
    .option('-b, --browser', 'Open result in default browser with styled view', {
      validator: program.BOOLEAN,
    })
    .option('-s, --style <path>', 'Custom CSS file for browser view')
    .option('--no-style', 'Disable default styling in browser view', {
      validator: program.BOOLEAN,
    })
    .option('--no-images', 'Remove all images from the output', {
      validator: program.BOOLEAN,
    })
    .option('--extract-code', 'Output only the content of code blocks', {
      validator: program.BOOLEAN,
    })
    .option('--read-time', 'Estimate reading time of the main content', {
      validator: program.BOOLEAN,
    })
    .option('--timeout <ms>', 'Maximum time to wait for URL fetching', {
      validator: program.NUMBER,
      default: 10000,
    })
    .option(
      '--user-agent <string>',
      'Custom user-agent string, browser-OS combination (e.g., firefox-linux), or crawler type (e.g., crawler-googlebot)'
    )
    .action(async ({ args, options, logger }) => {
      const { input } = args;
      logger.debug('Running main command with input: %s and options: %O', input, options);

      const spinner = ora('Processing content...').start();

      try {
        // Determine the input type
        const inputType = determineInputType(String(input));
        logger.debug(`Determined input type: ${inputType}`);

        // Get HTML content based on input type
        const html = await getHtmlContent(
          input ? String(input) : undefined,
          inputType,
          Number(options.timeout),
          options.userAgent ? String(options.userAgent) : undefined,
          logger
        );
        logger.debug('HTML content retrieved successfully');

        // Extract content using defuddle
        // Pass the original URL if the input was a URL
        const sourceUrl = inputType === InputSourceType.URL ? String(input) : undefined;
        const result = await extractContent(html, sourceUrl, logger);
        logger.debug('Content extracted successfully');

        // Process the content based on options
        let processedContent = result.content || '';

        // Remove images if requested
        if (options.noImages && processedContent) {
          logger.debug('Removing images from content');
          processedContent = removeImages(processedContent);
        }

        // Extract code blocks if requested
        if (options.extractCode && processedContent) {
          logger.debug('Extracting code blocks from content');
          const codeBlocks = extractCodeBlocks(processedContent);
          processedContent = codeBlocks.join('\n\n');
        }

        // Format the output
        const formattedOutput = formatOutput(
          processedContent,
          result,
          options.format as OutputFormat,
          options.readTime as boolean,
          logger
        );
        logger.debug('Output formatted successfully');

        // Output the result
        if (options.browser) {
          // Open in browser
          await openInBrowser(
            formattedOutput,
            result.title || 'Extracted Content',
            options.style ? String(options.style) : undefined,
            options.noStyle as boolean,
            logger
          );
          spinner.succeed('Content opened in browser');
        } else {
          // Output to file or stdout
          await outputResult(
            formattedOutput,
            options.output ? String(options.output) : undefined,
            logger
          );
          spinner.succeed('Content processed successfully');
        }
      } catch (error: unknown) {
        spinner.fail('Failed to process content');
        const errorMessage =
          error && typeof error === 'object' && 'message' in error
            ? (error as { message?: string }).message
            : 'An unknown error occurred';
        logger.error(chalk.red(`Error: ${errorMessage || 'An unknown error occurred'}`));
        process.exit(1);
      }
    });

  /**
   * Removes images from HTML content
   */
  function removeImages(html: string): string {
    // Simple regex-based approach to remove img tags
    // This is a basic implementation and might not handle all edge cases
    return html
      .replace(/<img\s+[^>]*>/gi, '') // Remove self-closing img tags
      .replace(/<img\s+[^>]*>.*?<\/img>/gi, '') // Remove img tags with content
      .replace(/<picture\s+[^>]*>.*?<\/picture>/gi, '') // Remove picture elements
      .replace(/<svg\s+[^>]*>.*?<\/svg>/gi, ''); // Remove svg elements
  }

  // Formatter functions have been moved to src/core/formatters/

  /**
   * Opens the content in the default browser
   */
  async function openInBrowser(
    content: string,
    title: string,
    customStylePath?: string,
    disableStyle?: boolean,
    logger?: any
  ): Promise<void> {
    // Create a temporary file
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `defuddle-${Date.now()}.html`);

    logger?.debug(`Creating temporary file: ${tempFilePath}`);

    // If custom style is specified, read it
    let customStyle = '';
    if (customStylePath && !disableStyle) {
      if (existsSync(customStylePath)) {
        customStyle = await fs.readFile(customStylePath, 'utf-8');
        logger?.debug('Custom style loaded successfully');
      } else {
        logger?.warn(`Custom style file not found: ${customStylePath}`);
      }
    }

    // Modify the content to include the custom style
    let modifiedContent = content;
    if (customStyle && !disableStyle) {
      modifiedContent = content.replace('</style>', `${customStyle}\n</style>`);
    }

    // Write the content to the temporary file
    await fs.writeFile(tempFilePath, modifiedContent, 'utf-8');
    logger?.debug('Content written to temporary file');

    // Open the file in the default browser
    logger?.debug('Opening in browser');
    await open(tempFilePath);

    // Return immediately, the file will be cleaned up by the OS eventually
  }
}
