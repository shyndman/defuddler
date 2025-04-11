# Defuddle CLI Reference

This document outlines the commands and options available in the Defuddle CLI.

## Main Command

Processes HTML content from a URL, file, or standard input.

**Usage:**

```bash
defuddle [input] [options]
```

**Arguments:**

*   `[input]`: URL, file path, or HTML content. If omitted, reads from standard input.

**Options:**

*   `-o, --output <path>`: Write output to a file instead of stdout.
*   `-f, --format <format>`: Output format (`text`, `html`, `json`, `markdown`). Default: `text`.
*   `-b, --browser`: Open result in default browser with styled view.
*   `-s, --style <path>`: Custom CSS file for browser view.
*   `--no-style`: Disable default styling in browser view.
*   `--no-images`: Remove all images from the output.
*   `--extract-code`: Output only the content of code blocks.
*   `--read-time`: Estimate reading time of the main content.
*   `--timeout <ms>`: Maximum time to wait for URL fetching. Default: `10000`.
*   `--user-agent <string>`: Custom user-agent string for URL fetching.

## `validate` Command

Validates HTML input without processing it.

**Usage:**

```bash
defuddle validate <input> [options]
```

**Arguments:**

*   `<input>`: URL, file path, or HTML content.

**Options:**

*   `--timeout <ms>`: Maximum time to wait for URL fetching. Default: `10000`.
*   `--user-agent <string>`: Custom user-agent string for URL fetching.

## `info` Command

Displays metadata about the HTML content without full processing.

**Usage:**

```bash
defuddle info <input> [options]
```

**Arguments:**

*   `<input>`: URL, file path, or HTML content.

**Options:**

*   `--timeout <ms>`: Maximum time to wait for URL fetching. Default: `10000`.
*   `--user-agent <string>`: Custom user-agent string for URL fetching.
*   `-o, --output <path>`: Write output to a file instead of stdout.
*   `-f, --format <format>`: Output format (`text`, `json`). Default: `text`.
*   `--list-images`: List all image URLs found in the main content.
*   `--read-time`: Estimate reading time of the main content.

## `completions` Command

Generates shell completion scripts.

**Usage:**

```bash
defuddle completions <shell>
```

**Arguments:**

*   `<shell>`: Shell type (`zsh`, `bash`, `fish`).
