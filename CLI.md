# Defuddler CLI Reference

This document outlines the commands and options available in the Defuddler CLI.

## Main Command

Processes HTML content from a URL, file, or standard input.

**Usage:**

```bash
defud [input] [options]
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
*   `--user-agent <string>`: Custom user-agent string, browser-OS combination (e.g., `firefox-linux`), or crawler type (e.g., `crawler-googlebot`).


## `info` Command

Displays metadata about the HTML content without full processing.

**Usage:**

```bash
defud info <input> [options]
```

**Arguments:**

*   `<input>`: URL, file path, or HTML content.

**Options:**

*   `--timeout <ms>`: Maximum time to wait for URL fetching. Default: `10000`.
*   `--user-agent <string>`: Custom user-agent string, browser-OS combination (e.g., `firefox-linux`), or crawler type (e.g., `crawler-googlebot`).
*   `-o, --output <path>`: Write output to a file instead of stdout.
*   `-f, --format <format>`: Output format (`text`, `json`). Default: `text`.
*   `--list-images`: List all image URLs found in the main content.
*   `--read-time`: Estimate reading time of the main content.

## `user-agents` Command

Lists available browser-OS combinations and crawler types for the `--user-agent` option.

**Usage:**

```bash
defud user-agents
```

This command displays all available browser-OS combinations (e.g., `firefox-linux`, `chrome-macos`) and crawler types (e.g., `crawler-googlebot`) that can be used with the `--user-agent` option in other commands.

## `completions` Command

Generates shell completion scripts.

**Usage:**

```bash
defud completions <shell>
```

**Arguments:**

*   `<shell>`: Shell type (`zsh`, `bash`, `fish`).
