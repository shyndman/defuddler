// Re-export all formatters
export * from './text.js';
export * from './html.js';
export * from './markdown.js';
export * from './json.js';

import { ContentMetadata } from '../../types/index.js';
import { OutputFormat } from '../../types/index.js';
import { formatAsText } from './text.js';
import { formatAsHtml } from './html.js';
import { formatAsMarkdown } from './markdown.js';
import { formatAsJson } from './json.js';
import { Logger } from 'winston';

/**
 * Formats the output based on the specified format
 */
export function formatOutput(
  content: string,
  metadata: ContentMetadata,
  format: OutputFormat,
  includeReadingTime: boolean,
  logger?: Logger,
  useFrontmatter?: boolean
): string {
  logger?.debug(`Formatting output as ${format}`);

  switch (format) {
    case 'html':
      return formatAsHtml(content, metadata, includeReadingTime);

    case 'markdown':
      return formatAsMarkdown(content, metadata, includeReadingTime, useFrontmatter);

    case 'json':
      return formatAsJson(content, metadata, includeReadingTime);

    case 'text':
    default:
      return formatAsText(content, metadata, includeReadingTime);
  }
}
