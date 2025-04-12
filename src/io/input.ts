import { existsSync } from 'fs';
import fs from 'fs/promises';
import got from 'got';
import { Logger } from 'winston';
import { InputSourceType } from '../types/index.js';
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
