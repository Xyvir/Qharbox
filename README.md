# Qharbox
A docs-as-code format uniting Markdown with SVG objects precisely anchored to the underlying monospace character grid.

## What is Qharbox?

Qharbox is a plain-text document format for creating rich technical documents where scalable vector graphics (SVG) are treated as first-class citizens alongside GitHub Flavored Markdown (GFM). Using a human-readable YAML structure, graphics are precisely anchored to the underlying monospace text grid, allowing diagrams and annotations to reflow naturally with your text.

## Key Features

  * ✍️ **Human-Readable & Git-Friendly:** The entire document is plain-text YAML, making it perfect for version control.
  * 🎯 **Precise Grid Anchoring:** Vector graphics are positioned relative to individual characters, not pixels, for perfectly aligned, resolution-independent diagrams.
  * 🏡 **Local-First & Cloud-Independent:** Your files stay on your machine. Qharbox is built to work with your favorite sync tools (Git, Dropbox, etc.), not replace them.
  * 🔗 **Flexible SVG Support:** Define graphics or instances directly inside your document using simple YAML-flavored SVG, or even reference external `.svg` files.

## Project Status

This project is currently in the detailed specification phase. Qharbox file format tooling and reference implementations are under development.

## Full Specification

For a complete technical breakdown of the format, rendering rules, and development plan, please see the full design document:

[**View the Full Specification (`SPEC.md`)**](https://github.com/Xyvir/Qharbox/blob/main/docs/SPECS.md)

Built on Svelt, Tanstack virtual.
