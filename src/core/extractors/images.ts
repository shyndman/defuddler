import { JSDOM } from 'jsdom';

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
