import { ContentMetadata } from '../../types/index.js';
import TurndownService from 'turndown';
import { dump as yamlDump } from 'js-yaml';

// Initialize Turndown service with options
const turndownService = new TurndownService({
  headingStyle: 'atx', // Use # style headings
  codeBlockStyle: 'fenced', // Use ``` style code blocks
  emDelimiter: '*', // Use * for emphasis
  strongDelimiter: '**', // Use ** for strong
  bulletListMarker: '*', // Use * for bullet lists
  hr: '---', // Use --- for horizontal rules
  linkStyle: 'inlined', // Use inline links
});

/**
 * Formats the output as Markdown with optional YAML frontmatter
 */
export function formatAsMarkdown(
  content: string,
  metadata: ContentMetadata,
  includeReadingTime: boolean,
  useFrontmatter: boolean = false
): string {
  // Convert HTML to Markdown using Turndown
  const convertedContent = turndownService.turndown(content);

  if (useFrontmatter) {
    // Create frontmatter object from metadata
    const frontmatterObj: Record<string, any> = {};

    if (metadata.title) {
      frontmatterObj.title = metadata.title;
    }
    if (metadata.site) {
      frontmatterObj.source = metadata.site;
    }
    if (metadata.author) {
      frontmatterObj.author = metadata.author;
    }
    if (metadata.published) {
      frontmatterObj.date = metadata.published;
    }
    if (metadata.wordCount) {
      frontmatterObj.wordCount = metadata.wordCount;
    }
    if (includeReadingTime && metadata.readingTime) {
      frontmatterObj.readingTime = metadata.readingTime;
    }

    // Generate YAML frontmatter
    const yamlFrontmatter = Object.keys(frontmatterObj).length > 0 ? yamlDump(frontmatterObj) : '';

    // Combine frontmatter with content
    return `---\n${yamlFrontmatter}---\n\n${convertedContent}`;
  } else {
    // Traditional format with markdown headers
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

    // Add converted content
    markdown += convertedContent;

    return markdown;
  }
}
