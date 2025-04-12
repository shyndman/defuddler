import { Defuddle } from 'defuddle/node';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import got from 'got';
import { JSDOM } from 'jsdom';
import { Logger } from 'winston';
import { ContentMetadata, InputSourceType } from '../types/index.js';
import { getUserAgent } from '../http/user-agents.js';

/**
 * Determines the type of input (URL, file, or string)
 */
export function determineInputType(input?: string): InputSourceType {
  if (!input || input === '-') {
    return InputSourceType.STDIN;
  }

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
export async function getHtmlContent(
  input: string | undefined,
  inputType: InputSourceType,
  timeout: number,
  userAgentSpec?: string,
  logger?: Logger
): Promise<string> {
  logger?.debug(`Getting HTML content from ${inputType}`);

  switch (inputType) {
    case InputSourceType.URL:
      return await getUrlContent(input, timeout, userAgentSpec, logger);

    case InputSourceType.FILE:
      return await getFileContent(input, logger);

    case InputSourceType.STDIN:
      return await getStdinContent(logger);

    case InputSourceType.STRING:
      return getStringContent(input, logger);

    default:
      throw new Error(`Unsupported input type: ${inputType}`);
  }
}

/**
 * Gets content from a URL
 */
async function getUrlContent(
  url: string | undefined,
  timeout: number,
  userAgentSpec?: string,
  logger?: Logger
): Promise<string> {
  if (!url) {
    throw new Error('URL input is required');
  }

  logger?.debug(`Fetching URL: ${url} with timeout: ${timeout}ms`);

  // Process user agent if specified
  const headers = await prepareHeaders(userAgentSpec, logger);

  const response = await got(url, {
    timeout: { request: timeout },
    headers,
  });
  return response.body;
}

/**
 * Prepares headers for HTTP requests
 */
async function prepareHeaders(
  userAgentSpec?: string,
  logger?: Logger
): Promise<Record<string, string>> {
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
  return headers;
}

/**
 * Gets content from a file
 */
async function getFileContent(filePath: string | undefined, logger?: Logger): Promise<string> {
  if (!filePath) {
    throw new Error('File path is required');
  }

  logger?.debug(`Reading file: ${filePath}`);
  return await fs.readFile(filePath, 'utf-8');
}

/**
 * Gets content from stdin
 */
async function getStdinContent(logger?: Logger): Promise<string> {
  logger?.debug('Reading from stdin');
  let content = '';

  // Read from stdin
  for await (const chunk of process.stdin) {
    content += chunk;
  }

  if (!content) {
    throw new Error('No content received from stdin');
  }

  return content;
}

/**
 * Gets content from a string
 */
function getStringContent(htmlString: string | undefined, logger?: Logger): string {
  if (!htmlString) {
    throw new Error('HTML string is required');
  }

  logger?.debug('Using input as HTML string');
  return htmlString;
}

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

/**
 * Extracts image URLs from HTML content
 */
export function extractImageUrls(html: string, baseUrl: string): string[] {
  // Create a temporary DOM to parse the HTML content
  const tempDom = new JSDOM(html, { url: baseUrl });
  const document = tempDom.window.document;

  const imageUrls = new Set<string>();

  // Extract URLs from different types of image elements
  extractImgElementUrls(document, baseUrl, imageUrls);
  extractSourceElementUrls(document, baseUrl, imageUrls);
  extractSvgElementUrls(document, baseUrl, imageUrls);

  // Return unique image URLs as an array
  return Array.from(imageUrls);
}

/**
 * Extracts URLs from elements matching a selector
 */
function extractUrlsFromElements(
  document: Document,
  selector: string,
  baseUrl: string,
  imageUrls: Set<string>,
  urlExtractor: (element: Element, baseUrl: string, imageUrls: Set<string>) => void
): void {
  const elements = document.querySelectorAll(selector);
  elements.forEach((element) => {
    urlExtractor(element, baseUrl, imageUrls);
  });
}

/**
 * Extracts URLs from img elements
 */
function extractImgElementUrls(document: Document, baseUrl: string, imageUrls: Set<string>): void {
  extractUrlsFromElements(document, 'img', baseUrl, imageUrls, (img, baseUrl, imageUrls) => {
    // Extract src attribute
    extractUrlFromAttribute(img, 'src', baseUrl, imageUrls);

    // Extract srcset attribute
    const srcset = img.getAttribute('srcset');
    if (srcset) {
      extractUrlsFromSrcset(srcset, baseUrl, imageUrls);
    }
  });
}

/**
 * Extracts URLs from source elements
 */
function extractSourceElementUrls(
  document: Document,
  baseUrl: string,
  imageUrls: Set<string>
): void {
  extractUrlsFromElements(document, 'source', baseUrl, imageUrls, (source, baseUrl, imageUrls) => {
    const srcset = source.getAttribute('srcset');
    if (srcset) {
      extractUrlsFromSrcset(srcset, baseUrl, imageUrls);
    }
  });
}

/**
 * Extracts URLs from SVG elements
 */
function extractSvgElementUrls(document: Document, baseUrl: string, imageUrls: Set<string>): void {
  extractUrlsFromElements(
    document,
    'svg image',
    baseUrl,
    imageUrls,
    (svgImage, baseUrl, imageUrls) => {
      // Try href attribute first, then xlink:href
      const href = svgImage.getAttribute('href') || svgImage.getAttribute('xlink:href');
      if (href && !href.startsWith('data:')) {
        addAbsoluteUrl(href, baseUrl, imageUrls);
      }
    }
  );
}

/**
 * Extracts URL from an element's attribute
 */
function extractUrlFromAttribute(
  element: Element,
  attributeName: string,
  baseUrl: string,
  imageUrls: Set<string>
): void {
  const value = element.getAttribute(attributeName);
  if (value) {
    addAbsoluteUrl(value, baseUrl, imageUrls);
  }
}

/**
 * Extracts URLs from srcset attribute
 */
function extractUrlsFromSrcset(srcset: string, baseUrl: string, imageUrls: Set<string>): void {
  // Parse srcset format: "url1 1x, url2 2x" or "url1 100w, url2 200w"
  const srcsetUrls = srcset.split(',').map((part) => part.trim().split(/\s+/)[0]);
  srcsetUrls.forEach((url) => {
    if (url) {
      addAbsoluteUrl(url, baseUrl, imageUrls);
    }
  });
}

/**
 * Adds an absolute URL to the set of image URLs
 */
function addAbsoluteUrl(url: string, baseUrl: string, imageUrls: Set<string>): void {
  try {
    // Resolve relative URLs to absolute URLs
    const absoluteUrl = new URL(url, baseUrl).href;
    imageUrls.add(absoluteUrl);
  } catch (e) {
    // Skip invalid URLs
  }
}

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

/**
 * Outputs the result to file or stdout
 */
export async function outputResult(
  output: string,
  outputPath?: string,
  logger?: Logger
): Promise<void> {
  if (outputPath) {
    await writeToFile(output, outputPath, logger);
  } else {
    writeToStdout(output, logger);
  }
}

/**
 * Writes output to a file
 */
async function writeToFile(output: string, outputPath: string, logger?: Logger): Promise<void> {
  logger?.debug(`Writing output to file: ${outputPath}`);
  await fs.writeFile(outputPath, output, 'utf-8');
  logger?.info(`Output written to ${outputPath}`);
}

/**
 * Writes output to stdout
 */
function writeToStdout(output: string, logger?: Logger): void {
  logger?.debug('Writing output to stdout');
  console.log(output);
}

/**
 * Extracts code blocks from HTML content
 */
export function extractCodeBlocks(html: string): string[] {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  return extractPreElements(document);
}

/**
 * Extracts content from pre elements
 */
function extractPreElements(document: Document): string[] {
  const codeBlocks: string[] = [];

  // Extract content from pre elements
  const preElements = document.querySelectorAll('pre');
  preElements.forEach((pre) => {
    extractCodeFromPre(pre, codeBlocks);
  });

  return codeBlocks;
}

/**
 * Extracts code from a pre element
 */
function extractCodeFromPre(pre: Element, codeBlocks: string[]): void {
  const codeElement = pre.querySelector('code');
  if (codeElement) {
    codeBlocks.push(codeElement.textContent || '');
  } else {
    codeBlocks.push(pre.textContent || '');
  }
}
