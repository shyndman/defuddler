# Defuddler Design Document

## Overview

A command-line interface wrapping the defuddle library (https://github.com/kepano/defuddle), which extracts the main content from web pages and articles. This CLI tool, written in TypeScript, provides a rich interface for content extraction with various input methods and output formats.

*"In the beginning, there was noise, and the Great Parser brought forth clarity."*

## Installation

```bash
npm install -g @shyndman/defuddler
```

## Command Structure

### Primary Command
```bash
defud [options] <input>
```

### Input Methods
- URL: `defud https://example.com/article`
- File: `defud ./path/to/file.html`
- Standard Input: `cat file.html | defud`

## Options

### Global Options
- `--verbose, -v`: Enable verbose logging for both the CLI wrapper and defuddle library
- `--help, -h`: Display help information
- `--version`: Display version information

### Input Options
- `--timeout <ms>`: Maximum time to wait for URL fetching (default: 10000)
- `--user-agent <string>`: Custom user-agent string, browser-OS combination (e.g., `firefox-linux`), or crawler type (e.g., `crawler-googlebot`)

### Output Options
- `--output, -o <path>`: Write output to a file instead of stdout
- `--format, -f <format>`: Output format (default: 'text')
  - `text`: Plain text output
  - `html`: HTML output
  - `json`: JSON output including metadata
  - `markdown`: Markdown output
- `--browser, -b`: Open result in default browser with styled view
- `--style, -s <path>`: Custom CSS file for browser view
- `--no-style`: Disable default styling in browser view
- `--no-images`: Remove all images from the output (main command)
- `--extract-code`: Output only the content of code blocks (main command)
- `--read-time`: Estimate reading time of the main content (main and info commands)

## Subcommands

### User Agents
```bash
defud user-agents
```
List available browser-OS combinations and crawler types for the `--user-agent` option

### Completions
```bash
defud completions <shell>
```
Generate shell completions for:
- `zsh`
- `bash`
- `fish`


### Info
```bash
defud info <input> [options]
```
Display metadata about the content without full processing

**Additional Options for Info:**
- `--list-images`: List all image URLs found in the main content.
- `--read-time`: Estimate reading time of the main content.

## Browser View Features

When using the `--browser` flag, the tool will:
1. Generate a temporary HTML file with extracted content
2. Apply default or custom styling
3. Open the default browser
4. Clean up temporary files on process exit

Default styling will include:
- Clean, readable typography
- Dark/light mode support
- Responsive design
- Proper handling of images and media
- Code block syntax highlighting

## Examples

```bash
# Process URL and output to terminal
defud https://example.com/article

# Process URL with verbose logging
defud -v https://example.com/article

# Process local file and open in browser
defud -b ./article.html

# Process URL and save as markdown
defud -f markdown -o output.md https://example.com/article

# Process stdin and output JSON
cat article.html | defud -f json

# Generate zsh completions
defud completions zsh > ~/.zsh/completions/_defud
```

## Error Handling

The CLI will provide clear error messages for:
- Invalid URLs
- Network timeouts
- Invalid HTML
- File system errors
- Invalid options
- Processing failures

## Dependencies

Core dependencies:
- defuddle
- @caporal/core (CLI framework)
- chalk (terminal colors)
- ora (spinners)
- open (browser opening)
- got (HTTP client)
- debug (logging)
- winston (logging)

Dev dependencies:
- TypeScript
- Jest
- ESLint
- Prettier

## Project Structure

```
src/
  ├── cli.ts           # Main CLI entry point
  ├── commands/        # Command implementations
  ├── processors/      # Content processing logic
  ├── formatters/      # Output formatters
  ├── browser/         # Browser view related code
  ├── utils/           # Utility functions
  └── types/           # TypeScript type definitions
```

## Future Considerations

1. Cache management for frequently accessed URLs
2. Plugin system for custom processors
3. Integration with reading list services
4. Batch processing capabilities
5. Content diff functionality
6. RSS feed processing
