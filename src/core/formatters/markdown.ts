import { ContentMetadata } from '../../types/index.js';

/**
 * Formats the output as Markdown
 */
export function formatAsMarkdown(
  content: string,
  metadata: ContentMetadata,
  includeReadingTime: boolean
): string {
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
