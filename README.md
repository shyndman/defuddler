# Defuddler

A command-line interface for extracting the main content from web pages and articles, powered by the [defuddle](https://github.com/kepano/defuddle) library.

*"In the beginning, there was noise, and the Great Parser brought forth clarity."*

## Installation

```bash
# Global installation
npm install -g @shyndman/defuddler

# Or with pnpm
pnpm add -g @shyndman/defuddler

# Or run without installing using npx
npx @shyndman/defuddler
```

## Usage

```bash
defud [options] <input>
```

### Input Methods

- URL: `defud https://example.com/article`
- File: `defud ./path/to/file.html`
- Standard Input: `cat file.html | defud`

### Examples

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

# Process URL, remove images, and save as HTML
defud --no-images -f html -o no-images.html https://example.com/article

# Get estimated read time and list images from a URL
defud info --read-time --list-images https://example.com/article

# Generate zsh completions
defud completions zsh > ~/.zsh/completions/_defud
```

## Options

### Global Options
- `--verbose, -v`: Enable verbose logging
- `--help, -h`: Display help information
- `--version`: Display version information

### Input Options
- `--timeout <ms>`: Maximum time to wait for URL fetching (default: 10000)
- `--user-agent <string>`: Custom user-agent string for URL fetching

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
- `--no-images`: Remove all images from the output
- `--extract-code`: Output only the content of code blocks
- `--read-time`: Estimate reading time of the main content

## Subcommands

### Completions
```bash
defud completions <shell>
```
Generate shell completions for:
- `zsh`
- `bash`
- `fish`

### Validate
```bash
defud validate <input>
```
Validate HTML input without processing

### Info
```bash
defud info <input> [options]
```
Display metadata about the content without full processing

**Info Options:**
- `--list-images`: List all image URLs found in the main content.
- `--read-time`: Estimate reading time of the main content.

## License

MIT
