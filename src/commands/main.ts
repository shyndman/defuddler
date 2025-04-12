import chalk from 'chalk';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import { JSDOM } from 'jsdom';
import open from 'open';
import ora from 'ora';
import os from 'os';
import path from 'path';
import { OutputFormat, InputSourceType } from '../types/index.js';
import {
  determineInputType,
  getHtmlContent,
  extractContent,
  outputResult,
  extractCodeBlocks,
} from '../utils/content.js';
import { Program } from '../utils/caporal.js';

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

  /**
   * Formats the output based on the specified format
   */
  function formatOutput(
    content: string,
    metadata: any,
    format: OutputFormat,
    includeReadingTime: boolean,
    logger?: any
  ): string {
    logger?.debug(`Formatting output as ${format}`);

    switch (format) {
      case 'html':
        return formatAsHtml(content, metadata, includeReadingTime);

      case 'markdown':
        return formatAsMarkdown(content, metadata, includeReadingTime);

      case 'json':
        return formatAsJson(content, metadata, includeReadingTime);

      case 'text':
      default:
        return formatAsText(content, metadata, includeReadingTime);
    }
  }

  /**
   * Formats the output as HTML
   */
  function formatAsHtml(content: string, metadata: any, includeReadingTime: boolean): string {
    let html = '<!DOCTYPE html>\n<html>\n<head>\n';
    html += `<title>${metadata.title || 'Extracted Content'}</title>\n`;
    html += '<meta charset="utf-8">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';

    // Add metadata
    if (metadata.author) {
      html += `<meta name="author" content="${metadata.author}">\n`;
    }
    if (metadata.description) {
      html += `<meta name="description" content="${metadata.description}">\n`;
    }

    // Add basic styling
    html += '<style>\n';
    html +=
      'body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 1rem; }\n';
    html += 'img { max-width: 100%; height: auto; }\n';
    html += 'pre { background-color: #f5f5f5; padding: 1rem; overflow-x: auto; }\n';
    html += 'code { font-family: monospace; }\n';
    html += '</style>\n';

    html += '</head>\n<body>\n';

    // Add title
    if (metadata.title) {
      html += `<h1>${metadata.title}</h1>\n`;
    }

    // Add metadata section
    html += '<div class="metadata">\n';
    if (metadata.site) {
      html += `<p>Source: ${metadata.site}</p>\n`;
    }
    if (metadata.author) {
      html += `<p>Author: ${metadata.author}</p>\n`;
    }
    if (metadata.published) {
      html += `<p>Published: ${metadata.published}</p>\n`;
    }
    if (metadata.wordCount) {
      html += `<p>Word count: ${metadata.wordCount}</p>\n`;
    }
    if (includeReadingTime && metadata.readingTime) {
      html += `<p>Reading time: ${metadata.readingTime} minute${metadata.readingTime !== 1 ? 's' : ''}</p>\n`;
    }
    html += '</div>\n';

    // Add main content
    html += '<div class="content">\n';
    html += content;
    html += '\n</div>\n';

    html += '</body>\n</html>';

    return html;
  }

  /**
   * Formats the output as Markdown
   */
  function formatAsMarkdown(content: string, metadata: any, includeReadingTime: boolean): string {
    let markdown = '';

    // Add title
    if (metadata.title) {
      markdown += `# ${metadata.title}\n\n`;
    }

    // Add metadata section
    if (metadata.site) {
      markdown += `Source: ${metadata.site}\n\n`;
    }
    if (metadata.author) {
      markdown += `Author: ${metadata.author}\n\n`;
    }
    if (metadata.published) {
      markdown += `Published: ${metadata.published}\n\n`;
    }
    if (metadata.wordCount) {
      markdown += `Word count: ${metadata.wordCount}\n\n`;
    }
    if (includeReadingTime && metadata.readingTime) {
      markdown += `Reading time: ${metadata.readingTime} minute${metadata.readingTime !== 1 ? 's' : ''}\n\n`;
    }

    // Add separator
    markdown += '---\n\n';

    // Convert HTML to Markdown (basic conversion)
    // In a real implementation, we would use a proper HTML-to-Markdown converter
    // For now, we'll just use the content as is, assuming it's already in Markdown format
    // or that defuddle has done some conversion
    markdown += content;

    return markdown;
  }

  /**
   * Formats the output as JSON
   */
  function formatAsJson(content: string, metadata: any, includeReadingTime: boolean): string {
    const result: any = {
      ...metadata,
      content,
    };

    // Remove reading time if not requested
    if (!includeReadingTime) {
      delete result.readingTime;
    }

    return JSON.stringify(result, null, 2);
  }

  /**
   * Formats the output as plain text
   */
  function formatAsText(content: string, metadata: any, includeReadingTime: boolean): string {
    let text = '';

    // Add title
    if (metadata.title) {
      text += `${metadata.title}\n${'='.repeat(metadata.title.length)}\n\n`;
    }

    // Add metadata section
    if (metadata.site) {
      text += `Source: ${metadata.site}\n`;
    }
    if (metadata.author) {
      text += `Author: ${metadata.author}\n`;
    }
    if (metadata.published) {
      text += `Published: ${metadata.published}\n`;
    }
    if (metadata.wordCount) {
      text += `Word count: ${metadata.wordCount}\n`;
    }
    if (includeReadingTime && metadata.readingTime) {
      text += `Reading time: ${metadata.readingTime} minute${metadata.readingTime !== 1 ? 's' : ''}\n`;
    }

    // Add separator
    text += '\n' + '-'.repeat(80) + '\n\n';

    // Add content (strip HTML tags for plain text)
    text += stripHtmlTags(content);

    return text;
  }

  /**
   * Strips HTML tags from a string
   */
  function stripHtmlTags(html: string): string {
    // Create a temporary DOM element
    const tempDom = new JSDOM(html);
    return tempDom.window.document.body.textContent || '';
  }

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
