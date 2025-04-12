import { ParsedArgumentsObject } from '@caporal/core';
import chalk from 'chalk';
import ora from 'ora';
import { ParsedOptions } from 'types';
import { Logger } from 'winston';
import { ContentMetadata, InputSourceType } from '../../types/index.js';
import { Program } from '../caporal.js';
import {
  determineInputType,
  getHtmlContent,
  extractContent,
  outputResult,
} from '../../core/content.js';

export function setupInfoCommand(program: Program): void {
  program
    .command('info', 'Display metadata about the content without full processing')
    .argument('<input>', 'URL, file path, or HTML content')
    .option('--timeout <ms>', 'Maximum time to wait for URL fetching', {
      default: 10000,
      validator: program.NUMBER,
    })
    .option(
      '--user-agent <string>',
      'Custom user-agent string, browser-OS combination (e.g., firefox-linux), or crawler type (e.g., crawler-googlebot)'
    )
    .option('-o, --output <path>', 'Write output to a file instead of stdout')
    .option('-f, --format <format>', 'Output format (text, json)', {
      default: 'text',
      validator: program.STRING,
    })
    .option('--list-images', 'List all image URLs found in the main content', {
      validator: program.BOOLEAN,
    })
    .option('--read-time', 'Estimate reading time of the main content', {
      validator: program.BOOLEAN,
    })
    .action(
      async ({
        args,
        options,
        logger,
      }: {
        args: ParsedArgumentsObject;
        options: ParsedOptions;
        logger: Logger;
      }) => {
        const { input } = args;
        logger.debug('Getting info for input: %s with options: %O', input, options);

        const spinner = ora('Extracting metadata...').start();

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

          // Extract metadata using defuddle
          // Pass the original URL if the input was a URL
          const sourceUrl = inputType === InputSourceType.URL ? String(input) : undefined;
          const metadata = await extractContent(html, sourceUrl, logger);
          logger.debug('Metadata extracted successfully');

          // Format the output
          const formattedOutput = formatOutput(metadata, options, logger);
          logger.debug('Output formatted successfully');

          // Output the result
          await outputResult(
            formattedOutput,
            options.output ? String(options.output) : undefined,
            logger
          );

          spinner.succeed('Metadata extracted successfully');
        } catch (error: unknown) {
          spinner.fail('Failed to extract metadata');
          const errorMessage =
            error && typeof error === 'object' && 'message' in error
              ? (error as { message?: string }).message
              : 'An unknown error occurred';
          logger.error(chalk.red(`Error: ${errorMessage || 'An unknown error occurred'}`));
          process.exit(1);
        }
      }
    );

  /**
   * Formats the output based on options
   */
  function formatOutput(
    metadata: ContentMetadata,
    options: ParsedOptions,
    logger?: Logger
  ): string {
    logger?.debug('Formatting output', { format: options.format });

    // Filter metadata based on options
    const filteredMetadata = { ...metadata };

    // Only include reading time if requested
    if (!options.readTime) {
      delete filteredMetadata.readingTime;
    }

    // Only include content images if requested
    if (!options.listImages) {
      delete filteredMetadata.contentImages;
    }

    // Format based on requested format
    if (options.format === 'json') {
      return JSON.stringify(filteredMetadata, null, 2);
    } else {
      // Text format
      const lines: string[] = [];

      if (filteredMetadata.title) {
        lines.push(`Title: ${filteredMetadata.title}`);
      }

      if (filteredMetadata.site) {
        lines.push(`Site: ${filteredMetadata.site}`);
      }

      if (filteredMetadata.domain) {
        lines.push(`Domain: ${filteredMetadata.domain}`);
      }

      if (filteredMetadata.author) {
        lines.push(`Author: ${filteredMetadata.author}`);
      }

      if (filteredMetadata.published) {
        lines.push(`Published: ${filteredMetadata.published}`);
      }

      if (filteredMetadata.description) {
        lines.push(`Description: ${filteredMetadata.description}`);
      }

      if (filteredMetadata.wordCount) {
        lines.push(`Word count: ${filteredMetadata.wordCount}`);
      }

      if (filteredMetadata.readingTime) {
        lines.push(
          `Reading time: ${filteredMetadata.readingTime} minute${filteredMetadata.readingTime !== 1 ? 's' : ''}`
        );
      }

      // Include favicon and main image
      if (filteredMetadata.favicon) {
        lines.push(`Favicon: ${filteredMetadata.favicon}`);
      }

      if (filteredMetadata.image) {
        lines.push(`Main image: ${filteredMetadata.image}`);
      }

      // Include content images if requested
      if (filteredMetadata.contentImages && filteredMetadata.contentImages.length > 0) {
        lines.push('\nContent images:');
        filteredMetadata.contentImages.forEach((url, index) => {
          lines.push(`  ${index + 1}. ${url}`);
        });
      }

      return lines.join('\n');
    }
  }
}
