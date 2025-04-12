import { JSDOM } from 'jsdom';
import { ContentMetadata } from '../../types/index.js';

/**
 * Formats the output as plain text
 */
export function formatAsText(
  content: string,
  metadata: ContentMetadata,
  includeReadingTime: boolean
): string {
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
export function stripHtmlTags(html: string): string {
  // Create a temporary DOM element
  const tempDom = new JSDOM(html);
  return tempDom.window.document.body.textContent || '';
}
