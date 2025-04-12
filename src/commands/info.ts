import { ParsedArgumentsObject } from '@caporal/core';
import chalk from 'chalk';
import { Defuddle } from 'defuddle/node';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import got from 'got';
import { JSDOM } from 'jsdom';
import ora from 'ora';
import { ParsedOptions } from 'types';
import { Logger } from 'winston';
import { ContentMetadata, InputSourceType } from '../types/index.js';
import { Program } from '../utils/caporal.js';
import { getUserAgent, getAvailableBrowserOsCombinations } from '../utils/user-agents.js';

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
      'Custom user-agent string or browser-OS combination (e.g., firefox-linux, chrome-macos)'
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
            String(input),
            inputType,
            Number(options.timeout),
            String(options['userAgent']),
            logger
          );
          logger.debug('HTML content retrieved successfully');

          // Extract metadata using defuddle
          const metadata = await extractMetadata(html, logger);
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
   * Determines the type of input (URL, file, or string)
   */
  function determineInputType(input: string): InputSourceType {
    // Check if input is a URL
    try {
      new URL(input);
      return InputSourceType.URL;
    } catch {
      // Not a URL
    }

    // Check if input is a file path
    if (existsSync(input)) {
      return InputSourceType.FILE;
    }

    // Default to treating as HTML string
    return InputSourceType.STRING;
  }

  /**
   * Gets HTML content based on input type
   */
  async function getHtmlContent(
    input: string,
    inputType: InputSourceType,
    timeout: number,
    userAgentSpec?: string,
    logger?: Logger
  ): Promise<string> {
    logger?.debug(`Getting HTML content from ${inputType}`);

    switch (inputType) {
      case InputSourceType.URL: {
        logger?.debug(`Fetching URL: ${input} with timeout: ${timeout}ms`);

        // Process user agent if specified
        let headers = {};
        if (userAgentSpec) {
          try {
            logger?.debug(`Processing user agent specification: ${userAgentSpec}`);
            const resolvedUserAgent = await getUserAgent(userAgentSpec);
            logger?.debug(`Resolved user agent: ${resolvedUserAgent}`);
            headers = { 'user-agent': resolvedUserAgent };
          } catch (error) {
            logger?.warn(`Failed to resolve user agent, using default: ${error}`);
          }
        }

        const response = await got(input, {
          timeout: { request: timeout },
          headers,
        });
        return response.body;
      }

      case InputSourceType.FILE: {
        logger?.debug(`Reading file: ${input}`);
        return await fs.readFile(input, 'utf-8');
      }

      case InputSourceType.STRING: {
        logger?.debug('Using input as HTML string');
        return input;
      }

      default:
        throw new Error(`Unsupported input type: ${inputType}`);
    }
  }

  /**
   * Extracts metadata from HTML content using defuddle
   */
  async function extractMetadata(html: string, logger?: Logger): Promise<ContentMetadata> {
    logger?.debug('Creating JSDOM from HTML');
    const dom = new JSDOM(html);

    logger?.debug('Initializing defuddle and extracting');
    const result = await Defuddle(dom);

    // Extract metadata
    const metadata: ContentMetadata = {
      ...result,
      readingTime: result.content ? calculateReadingTime(result.content) : undefined,
    };

    // Extract image URLs from the content if available
    if (result.content) {
      logger?.debug('Extracting image URLs from content');
      metadata.contentImages = extractImageUrls(result.content, dom.window.document.baseURI);
      logger?.debug(`Found ${metadata.contentImages.length} images in content`);
    }

    logger?.debug('Metadata extracted', metadata);
    return metadata;
  }

  /**
   * Extracts image URLs from HTML content
   */
  function extractImageUrls(html: string, baseUrl: string): string[] {
    // Create a temporary DOM to parse the HTML content
    const tempDom = new JSDOM(html, { url: baseUrl });
    const document = tempDom.window.document;

    const imageUrls = new Set<string>();

    // Extract URLs from img elements
    const imgElements = document.querySelectorAll('img');
    imgElements.forEach((img) => {
      const src = img.getAttribute('src');
      if (src) {
        try {
          // Resolve relative URLs to absolute URLs
          const absoluteUrl = new URL(src, baseUrl).href;
          imageUrls.add(absoluteUrl);
        } catch (e) {
          // Skip invalid URLs
        }
      }

      // Also check srcset attribute
      const srcset = img.getAttribute('srcset');
      if (srcset) {
        // Parse srcset format: "url1 1x, url2 2x" or "url1 100w, url2 200w"
        const srcsetUrls = srcset.split(',').map((part) => part.trim().split(/\s+/)[0]);
        srcsetUrls.forEach((url) => {
          if (url) {
            try {
              const absoluteUrl = new URL(url, baseUrl).href;
              imageUrls.add(absoluteUrl);
            } catch (e) {
              // Skip invalid URLs
            }
          }
        });
      }
    });

    // Extract URLs from picture elements and their source elements
    const sourceElements = document.querySelectorAll('source');
    sourceElements.forEach((source) => {
      const srcset = source.getAttribute('srcset');
      if (srcset) {
        const srcsetUrls = srcset.split(',').map((part) => part.trim().split(/\s+/)[0]);
        srcsetUrls.forEach((url) => {
          if (url) {
            try {
              const absoluteUrl = new URL(url, baseUrl).href;
              imageUrls.add(absoluteUrl);
            } catch (e) {
              // Skip invalid URLs
            }
          }
        });
      }
    });

    // Extract SVG elements with external references
    const svgElements = document.querySelectorAll('svg image');
    svgElements.forEach((svgImage) => {
      const href = svgImage.getAttribute('href') || svgImage.getAttribute('xlink:href');
      if (href && !href.startsWith('data:')) {
        try {
          const absoluteUrl = new URL(href, baseUrl).href;
          imageUrls.add(absoluteUrl);
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });

    // Return unique image URLs as an array
    return Array.from(imageUrls);
  }

  /**
   * Counts words in a string
   */
  function countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  /**
   * Calculates reading time in minutes (average reading speed: 200 words per minute)
   */
  function calculateReadingTime(text: string): number {
    const words = countWords(text);
    return Math.ceil(words / 200);
  }

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

  /**
   * Outputs the result to file or stdout
   */
  async function outputResult(output: string, outputPath?: string, logger?: Logger): Promise<void> {
    if (outputPath) {
      logger?.debug(`Writing output to file: ${outputPath}`);
      await fs.writeFile(outputPath, output, 'utf-8');
      logger?.info(chalk.green(`Output written to ${outputPath}`));
    } else {
      logger?.debug('Writing output to stdout');
      console.log(output);
    }
  }
}
