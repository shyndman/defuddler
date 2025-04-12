import { JSDOM } from 'jsdom';

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
