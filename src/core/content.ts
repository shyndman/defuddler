import { Defuddle } from 'defuddle/node';
import { JSDOM } from 'jsdom';
import { Logger } from 'winston';
import { ContentMetadata } from '../types/index.js';
import { extractImageUrls } from './extractors/images.js';

// Input/output functionality has been moved to src/io/input.ts and src/io/output.ts
// Re-export them here for backward compatibility
export { determineInputType, getHtmlContent } from '../io/input.js';

/**
 * Extracts metadata and content from HTML using defuddle
 * @param html The HTML content to extract from
 * @param sourceUrl The original URL of the content (if available)
 * @param logger Optional logger
 */
export async function extractContent(
  html: string,
  sourceUrl?: string,
  logger?: Logger
): Promise<ContentMetadata> {
  logger?.debug('Creating JSDOM from HTML');

  // Create DOM and ensure base URL is set
  const dom = createDomWithBaseUrl(html, sourceUrl, logger);

  logger?.debug(`Document base URI: ${dom.window.document.baseURI}`);
  logger?.debug('Initializing defuddle and extracting');

  try {
    // Extract content using defuddle
    return await extractWithDefuddle(dom, sourceUrl, logger);
  } catch (error) {
    // Fall back to basic extraction if defuddle fails
    logger?.error('Error extracting content with defuddle:', error);
    return extractBasicMetadata(dom, logger);
  }
}

/**
 * Creates a DOM with the correct base URL
 */
function createDomWithBaseUrl(html: string, sourceUrl?: string, logger?: Logger): JSDOM {
  // Create JSDOM with the source URL if available
  const jsdomOptions = sourceUrl ? { url: sourceUrl } : {};
  const dom = new JSDOM(html, jsdomOptions);

  // If we have a source URL but it's not set as the base URI, set it manually
  if (sourceUrl && dom.window.document.baseURI === 'about:blank') {
    // Create a base element to set the document base URI
    const baseEl = dom.window.document.createElement('base');
    baseEl.href = sourceUrl;

    // Insert at the beginning of head
    const head = dom.window.document.head || dom.window.document.getElementsByTagName('head')[0];
    if (head) {
      head.insertBefore(baseEl, head.firstChild);
      logger?.debug(`Added base element with href=${sourceUrl}`);
    }
  }

  return dom;
}

/**
 * Extracts content using defuddle
 */
async function extractWithDefuddle(
  dom: JSDOM,
  sourceUrl?: string,
  logger?: Logger
): Promise<ContentMetadata> {
  const result = await Defuddle(dom);

  // Calculate reading time if content is available
  const readingTime = result.content ? calculateReadingTime(result.content) : undefined;

  // Extract image URLs if content is available
  let contentImages: string[] | undefined;
  if (result.content) {
    contentImages = extractContentImages(result.content, dom, sourceUrl, logger);
  }

  // Return the result with additional metadata
  return {
    ...result,
    readingTime,
    contentImages,
  };
}

/**
 * Extracts images from content
 */
function extractContentImages(
  content: string,
  dom: JSDOM,
  sourceUrl?: string,
  logger?: Logger
): string[] {
  logger?.debug('Extracting image URLs from content');
  const baseUrl =
    dom.window.document.baseURI !== 'about:blank'
      ? dom.window.document.baseURI
      : sourceUrl || 'about:blank';

  const images = extractImageUrls(content, baseUrl);
  logger?.debug(`Found ${images.length} images in content`);
  return images;
}

/**
 * Extracts basic metadata when defuddle fails
 */
function extractBasicMetadata(dom: JSDOM, logger?: Logger): ContentMetadata {
  const metadata: ContentMetadata = {
    title: dom.window.document.title || undefined,
    content: dom.window.document.body?.textContent || undefined,
  };

  if (metadata.content) {
    metadata.wordCount = countWords(metadata.content);
    metadata.readingTime = calculateReadingTime(metadata.content);
  }

  return metadata;
}

// Image extraction functionality has been moved to src/core/extractors/images.ts
// Re-export it here for backward compatibility
export { extractImageUrls } from './extractors/images.js';

/**
 * Counts words in a string
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

/**
 * Calculates reading time in minutes (average reading speed: 200 words per minute)
 */
export function calculateReadingTime(text: string): number {
  const words = countWords(text);
  return Math.ceil(words / 200);
}

// Output functionality has been moved to src/io/output.ts
// Re-export it here for backward compatibility
export { outputResult } from '../io/output.js';

// Code extraction functionality has been moved to src/core/extractors/code.ts
// Re-export it here for backward compatibility
export { extractCodeBlocks } from './extractors/code.js';
