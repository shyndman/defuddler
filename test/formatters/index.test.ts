import { describe, it, expect, vi } from 'vitest';
import { formatOutput } from '../../src/core/formatters/index.js';
import { formatAsText } from '../../src/core/formatters/text.js';
import { formatAsHtml } from '../../src/core/formatters/html.js';
import { formatAsMarkdown } from '../../src/core/formatters/markdown.js';
import { formatAsJson } from '../../src/core/formatters/json.js';
import { ContentMetadata } from '../../src/types/index.js';
import { Logger } from 'winston';

// Mock the individual formatters
vi.mock('../../src/core/formatters/text.js', () => ({
  formatAsText: vi.fn().mockReturnValue('MOCKED_TEXT_OUTPUT'),
}));

vi.mock('../../src/core/formatters/html.js', () => ({
  formatAsHtml: vi.fn().mockReturnValue('MOCKED_HTML_OUTPUT'),
}));

vi.mock('../../src/core/formatters/markdown.js', () => ({
  formatAsMarkdown: vi.fn().mockReturnValue('MOCKED_MARKDOWN_OUTPUT'),
}));

vi.mock('../../src/core/formatters/json.js', () => ({
  formatAsJson: vi.fn().mockReturnValue('MOCKED_JSON_OUTPUT'),
}));

describe('Format Output', () => {
  const content = '<p>Test content</p>';
  const metadata: ContentMetadata = {
    title: 'Test Title',
  };
  const mockLogger = {
    debug: vi.fn(),
  } as unknown as Logger;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call formatAsText for text format', () => {
    // Act
    const result = formatOutput(content, metadata, 'text', false, mockLogger);

    // Assert
    expect(formatAsText).toHaveBeenCalledWith(content, metadata, false);
    expect(result).toBe('MOCKED_TEXT_OUTPUT');
    expect(mockLogger.debug).toHaveBeenCalledWith('Formatting output as text');
  });

  it('should call formatAsHtml for html format', () => {
    // Act
    const result = formatOutput(content, metadata, 'html', false, mockLogger);

    // Assert
    expect(formatAsHtml).toHaveBeenCalledWith(content, metadata, false);
    expect(result).toBe('MOCKED_HTML_OUTPUT');
    expect(mockLogger.debug).toHaveBeenCalledWith('Formatting output as html');
  });

  it('should call formatAsMarkdown for markdown format', () => {
    // Act
    const result = formatOutput(content, metadata, 'markdown', true, mockLogger);

    // Assert
    expect(formatAsMarkdown).toHaveBeenCalledWith(content, metadata, true, undefined);
    expect(result).toBe('MOCKED_MARKDOWN_OUTPUT');
    expect(mockLogger.debug).toHaveBeenCalledWith('Formatting output as markdown');
  });

  it('should call formatAsMarkdown with useFrontmatter when specified', () => {
    // Act
    const result = formatOutput(content, metadata, 'markdown', true, mockLogger, true);

    // Assert
    expect(formatAsMarkdown).toHaveBeenCalledWith(content, metadata, true, true);
    expect(result).toBe('MOCKED_MARKDOWN_OUTPUT');
    expect(mockLogger.debug).toHaveBeenCalledWith('Formatting output as markdown');
  });

  it('should call formatAsJson for json format', () => {
    // Act
    const result = formatOutput(content, metadata, 'json', false, mockLogger);

    // Assert
    expect(formatAsJson).toHaveBeenCalledWith(content, metadata, false);
    expect(result).toBe('MOCKED_JSON_OUTPUT');
    expect(mockLogger.debug).toHaveBeenCalledWith('Formatting output as json');
  });

  it('should default to text format for unknown formats', () => {
    // Act
    const result = formatOutput(content, metadata, 'unknown' as any, false, mockLogger);

    // Assert
    expect(formatAsText).toHaveBeenCalledWith(content, metadata, false);
    expect(result).toBe('MOCKED_TEXT_OUTPUT');
    expect(mockLogger.debug).toHaveBeenCalledWith('Formatting output as unknown');
  });

  it('should work without a logger', () => {
    // Act
    const result = formatOutput(content, metadata, 'markdown', true);

    // Assert
    expect(formatAsMarkdown).toHaveBeenCalledWith(content, metadata, true, undefined);
    expect(result).toBe('MOCKED_MARKDOWN_OUTPUT');
  });
});
