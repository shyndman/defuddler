# ✨📃 Defuddler

[![CI](https://github.com/shyndman/defuddler/actions/workflows/ci.yml/badge.svg)](https://github.com/shyndman/defuddler/actions/workflows/ci.yml)

Defuddler cuts through the clutter of modern web pages to extract what matters most: **the content**. This CLI tool transforms noisy articles and web pages into clean, readable text in multiple formats.

<br>
<div align="center">
  <img src="assets/images/transformation_optimized.png" alt="Defuddler transformation example" width="600">
  <p><em>From cluttered web page to clean, readable content in seconds</em></p>
</div>
<br>

## 🙏 Special Thanks

This project wouldn't exist without [kepano/defuddle](https://github.com/kepano/defuddle), the incredible library that powers our content extraction. A huge thank you to [@kepano](https://github.com/kepano) for creating such an amazing tool!

## ✨ Features

- **Clean Content Extraction**: Strip away ads, navigation, footers, and other distractions
- **Multiple Output Formats**: Convert to text, HTML, JSON, or Markdown
- **Browser Preview**: Open results in your browser with stylish formatting
- **Customizable User Agents**: Simulate different browsers and crawlers
- **Image Handling**: Option to include or exclude images
- **Code Block Extraction**: Pull out just the code samples
- **Reading Time Estimation**: Know how long an article will take to read

## 💾 Installation

```bash
# Global installation
npm install -g @shyndman/defuddler

# Or with pnpm
pnpm add -g @shyndman/defuddler

# Or run without installing using npx
npx @shyndman/defuddler
```

## 💻 Usage

```bash
defud [options] <input>
```

### 📂 Input Methods

- URL: `defud https://example.com/article`
- File: `defud ./path/to/file.html`
- Standard Input: `cat file.html | defud`

### 💻 Examples

```bash
# 🌐 Extract content from a website
defud https://example.com/article

# 📝 Save as markdown for your notes
defud -f markdown -o notes.md https://example.com/article

# 🔍 View in your browser with nice formatting
defud -b https://example.com/article

# 💾 Process a local HTML file
defud -b ./saved-article.html

# 📈 Get just the JSON data
defud -f json https://example.com/article

# 📢 Verbose mode for debugging
defud -v https://example.com/article

# 🖼️ Strip out all images
defud --no-images -f html -o clean.html https://example.com/article

# ⏱ Get reading time and list of images
defud info --read-time --list-images https://example.com/article

# 🐍 Use a specific browser user-agent
defud --user-agent firefox-linux https://example.com/article

# 🚀 Set up shell completions
defud completions zsh > ~/.zsh/completions/_defud
```

## 🔧 Options

### 🌐 Global Options
- `--verbose, -v`: Enable verbose logging
- `--help, -h`: Display help information
- `--version`: Display version information

### 📥 Input Options
- `--timeout <ms>`: Maximum time to wait for URL fetching (default: 10000)
- `--user-agent <string>`: Custom user-agent string, browser-OS combination (e.g., `firefox-linux`), or crawler type (e.g., `crawler-googlebot`)

### 📤 Output Options
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

## 💬 Subcommands

### 👤 User Agents
```bash
defud user-agents
```
List available browser-OS combinations and crawler types for the `--user-agent` option

### 🔤 Completions
```bash
defud completions <shell>
```
Generate shell completions for:
- `zsh`
- `bash`
- `fish`


### 📄 Info
```bash
defud info <input> [options]
```
Display metadata about the content without full processing

**Info Options:**
- `--list-images`: List all image URLs found in the main content.
- `--read-time`: Estimate reading time of the main content.

## 🚀 Development

### Release Process

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and package publishing. The release process is triggered automatically when changes are pushed to the `main` branch.

For contributors:

1. Follow the [commit message convention](./COMMIT_CONVENTION.md) when making changes
2. Create pull requests against the `main` branch
3. Once merged, semantic-release will automatically:
   - Determine the next version based on commit messages
   - Update the CHANGELOG.md
   - Create a new GitHub release
   - Publish to npm

To run a release locally (for testing only):

```bash
pnpm run release
```

## 📜 License

MIT
