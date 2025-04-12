import { DefuddleResponse } from 'defuddle';

/**
 * Supported output formats
 */
export type OutputFormat = 'text' | 'html' | 'json' | 'markdown';

/**
 * Supported shell types for completions
 */
export type ShellType = 'zsh' | 'bash' | 'fish';

/**
 * Input source types
 */
export enum InputSourceType {
  URL = 'url',
  FILE = 'file',
  STDIN = 'stdin',
  STRING = 'string',
}

/**
 * Options for the main command
 */
export interface MainCommandOptions {
  output?: string;
  format: OutputFormat;
  browser?: boolean;
  style?: string;
  noStyle?: boolean;
  timeout: number;
  userAgent?: string;
  verbose?: boolean;
}

/**
 * Metadata about processed content
 */
export interface ContentMetadata extends Partial<DefuddleResponse> {
  readingTime?: number;
  contentImages?: string[];
}

/**
 * Processed content with metadata
 */
export interface ProcessedContent {
  content: string;
  metadata: ContentMetadata;
  originalHtml?: string;
}
