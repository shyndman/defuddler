import { ContentMetadata } from '../../types/index.js';

/**
 * Formats the output as HTML
 */
export function formatAsHtml(
  content: string, 
  metadata: ContentMetadata, 
  includeReadingTime: boolean
): string {
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
  html += 'body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 1rem; }\n';
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
