import { describe, it, expect } from 'vitest';
import { formatAsMarkdown } from '../../src/core/formatters/markdown.js';
import { ContentMetadata } from '../../src/types/index.js';
import { load as yamlLoad } from 'js-yaml';

describe('Markdown Formatter', () => {
  it('should format content with minimal metadata', () => {
    // Arrange
    const content = '<p>This is a test paragraph.</p>';
    const metadata: ContentMetadata = {
      title: 'Test Title',
    };
    const includeReadingTime = false;

    // Act
    const result = formatAsMarkdown(content, metadata, includeReadingTime);

    // Assert
    expect(result).toContain('# Test Title');
    expect(result).toContain('---');
    expect(result).toContain('This is a test paragraph.');
    expect(result).not.toContain('Reading time:');
    expect(result).not.toContain('<p>');
  });

  it('should format content with all metadata fields', () => {
    // Arrange
    const content = '<p>This is a test paragraph with <strong>formatting</strong>.</p>';
    const metadata: ContentMetadata = {
      title: 'Complete Test',
      site: 'https://example.com',
      author: 'Test Author',
      published: '2023-01-01',
      wordCount: 42,
      readingTime: 2,
    };
    const includeReadingTime = true;

    // Act
    const result = formatAsMarkdown(content, metadata, includeReadingTime);

    // Assert
    expect(result).toContain('# Complete Test');
    expect(result).toContain('Source: https://example.com');
    expect(result).toContain('Author: Test Author');
    expect(result).toContain('Published: 2023-01-01');
    expect(result).toContain('Word count: 42');
    expect(result).toContain('Reading time: 2 minutes');
    expect(result).toContain('---');
    expect(result).toContain('This is a test paragraph with **formatting**.');
    expect(result).not.toContain('<p>');
    expect(result).not.toContain('<strong>');
  });

  it('should handle reading time singular form correctly', () => {
    // Arrange
    const content = '<p>Short content.</p>';
    const metadata: ContentMetadata = {
      title: 'Short Article',
      readingTime: 1,
    };
    const includeReadingTime = true;

    // Act
    const result = formatAsMarkdown(content, metadata, includeReadingTime);

    // Assert
    expect(result).toContain('Reading time: 1 minute');
    expect(result).not.toContain('minutes');
    expect(result).toContain('Short content.');
    expect(result).not.toContain('<p>');
  });

  it('should not include reading time when not requested', () => {
    // Arrange
    const content = '<p>Content with reading time.</p>';
    const metadata: ContentMetadata = {
      title: 'Reading Time Test',
      readingTime: 3,
    };
    const includeReadingTime = false;

    // Act
    const result = formatAsMarkdown(content, metadata, includeReadingTime);

    // Assert
    expect(result).not.toContain('Reading time:');
    expect(result).toContain('Content with reading time.');
    expect(result).not.toContain('<p>');
  });

  it('should handle content with special characters', () => {
    // Arrange
    const content = '<p>Content with special characters: &lt;&gt;&amp;"\'</p>';
    const metadata: ContentMetadata = {
      title: 'Special Characters & Symbols',
    };
    const includeReadingTime = false;

    // Act
    const result = formatAsMarkdown(content, metadata, includeReadingTime);

    // Assert
    expect(result).toContain('# Special Characters & Symbols');
    expect(result).toContain('Content with special characters: <>&"\'');
    expect(result).not.toContain('&lt;');
    expect(result).not.toContain('&amp;');
    expect(result).not.toContain('<p>');
  });

  it('should work with empty content', () => {
    // Arrange
    const content = '';
    const metadata: ContentMetadata = {
      title: 'Empty Content',
    };
    const includeReadingTime = false;

    // Act
    const result = formatAsMarkdown(content, metadata, includeReadingTime);

    // Assert
    expect(result).toContain('# Empty Content');
    expect(result).toContain('---');
    // The content after the separator should be empty
    expect(result.split('---\n\n')[1]).toBe('');
  });

  it('should work without title', () => {
    // Arrange
    const content = '<p>Content without title.</p>';
    const metadata: ContentMetadata = {};
    const includeReadingTime = false;

    // Act
    const result = formatAsMarkdown(content, metadata, includeReadingTime);

    // Assert
    expect(result).not.toContain('#');
    expect(result).toContain('---');
    expect(result).toContain('Content without title.');
    expect(result).not.toContain('<p>');
  });

  it('should convert complex HTML to proper markdown', () => {
    // Arrange
    const content = `
      <h2>Section Title</h2>
      <p>This is a paragraph with <a href="https://example.com">a link</a> and some <em>emphasized</em> text.</p>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3 with <strong>bold</strong> text</li>
      </ul>
      <blockquote>
        <p>This is a blockquote with a nested <code>code snippet</code>.</p>
      </blockquote>
      <pre><code>function example() {
  return "This is a code block";
}</code></pre>
    `;
    const metadata: ContentMetadata = {
      title: 'Complex HTML Test',
    };
    const includeReadingTime = false;

    // Act
    const result = formatAsMarkdown(content, metadata, includeReadingTime);

    // Assert
    expect(result).toContain('# Complex HTML Test');
    expect(result).toContain('## Section Title');
    expect(result).toContain('[a link](https://example.com)');
    expect(result).toContain('*emphasized*');
    expect(result).toContain('*   Item 1');
    expect(result).toContain('*   Item 2');
    expect(result).toContain('*   Item 3 with **bold** text');
    expect(result).toContain('> This is a blockquote with a nested `code snippet`.');
    expect(result).toContain('```\nfunction example() {\n  return "This is a code block";\n}\n```');
    expect(result).not.toContain('<h2>');
    expect(result).not.toContain('<p>');
    expect(result).not.toContain('<ul>');
    expect(result).not.toContain('<li>');
    expect(result).not.toContain('<blockquote>');
    expect(result).not.toContain('<pre>');
    expect(result).not.toContain('<code>');
  });

  it('should generate YAML frontmatter when useFrontmatter is true', () => {
    // Arrange
    const content = '<p>This is a test paragraph with <strong>formatting</strong>.</p>';
    const metadata: ContentMetadata = {
      title: 'Frontmatter Test',
      site: 'https://example.com',
      author: 'Test Author',
      published: '2023-01-01',
      wordCount: 42,
      readingTime: 2,
    };
    const includeReadingTime = true;

    // Act
    const result = formatAsMarkdown(content, metadata, includeReadingTime, true);

    // Assert
    expect(result).toMatch(/^---\n[\s\S]+?---\n\n/);
    expect(result).toContain('title: Frontmatter Test');
    expect(result).toContain('source: https://example.com');
    expect(result).toContain('author: Test Author');
    expect(result).toContain('date: \'2023-01-01\'');
    expect(result).toContain('wordCount: 42');
    expect(result).toContain('readingTime: 2');
    expect(result).toContain('This is a test paragraph with **formatting**.');
    expect(result).not.toContain('# Frontmatter Test');
    expect(result).not.toContain('Source:');
    expect(result).not.toContain('Author:');
    expect(result).not.toContain('Published:');
    expect(result).not.toContain('Word count:');
    expect(result).not.toContain('Reading time:');
  });

  it('should handle empty metadata with frontmatter', () => {
    // Arrange
    const content = '<p>Content with empty metadata.</p>';
    const metadata: ContentMetadata = {};
    const includeReadingTime = false;

    // Act
    const result = formatAsMarkdown(content, metadata, includeReadingTime, true);

    // Assert
    expect(result).toMatch(/^---\n[\s\S]*?---\n\n/);
    expect(result).toContain('Content with empty metadata.');
    // The frontmatter section should be empty but the delimiters should still be there
    const frontmatterContent = result.match(/^---\n([\s\S]*?)---\n\n/)?.[1]?.trim();
    expect(frontmatterContent).toBe('');
  });

  it('should include only specified metadata in frontmatter', () => {
    // Arrange
    const content = '<p>Selective metadata test.</p>';
    const metadata: ContentMetadata = {
      title: 'Selective Metadata',
      author: 'Test Author',
      // No site, published, or wordCount
    };
    const includeReadingTime = false;

    // Act
    const result = formatAsMarkdown(content, metadata, includeReadingTime, true);

    // Assert
    expect(result).toMatch(/^---\n[\s\S]+?---\n\n/);
    expect(result).toContain('title: Selective Metadata');
    expect(result).toContain('author: Test Author');
    expect(result).not.toContain('source:');
    expect(result).not.toContain('date:');
    expect(result).not.toContain('wordCount:');
    expect(result).not.toContain('readingTime:');
  });
});
