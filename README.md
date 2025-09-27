# Qharbox

**A modular engine for creating interactive, annotated diagrams directly within Markdown.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Qharbox allows you to create rich, graphical callouts and annotations on images without leaving your favorite Markdown editor. It's designed for technical documentation, tutorials, and complex note-taking where a static image just isn't enough.

The core philosophy is **Graceful Degradation**: your Qharbox diagrams will remain readable and understandable even in standard Markdown viewers that don't have the Qharbox renderer installed.

## The Problem

Standard images in Markdown are static. While tools like Mermaid or PlantUML are great for generating structured charts, they don't allow for freeform annotation of existing images. Qharbox fills this gap, enabling you to add lines, text, and interactive elements to any image in a way that is both powerful and portable.

## Core Concepts: The Two-Block System

To achieve graceful degradation, Qharbox uses a pair of fenced code blocks. This ensures the raw data is always visible and that standard Markdown parsers won't break. A custom Qharbox renderer will intelligently combine these two blocks into one interactive component.

1.  **The Meta Block (`qharbox-meta`):** A human-readable block containing configuration and essential information, written in YAML.
2.  **The SVG Block (`qharbox-svg`):** Contains all the raw vector data for the annotations, including lines, text, and anchor points.

---

### Example Usage

Here is what a complete Qharbox component looks like in raw Markdown.

```markdown
​```qharbox-meta
version: 1.0
image_src: ./images/circuit-diagram.png
width: 800
height: 600
title: "Analysis of the Op-Amp Inverting Amplifier"
​```

​```qharbox-svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <circle id="anchor-1" data-anchor-id="1" cx="150" cy="250" r="3" fill="none" />
  <circle id="anchor-2" data-anchor-id="2" cx="400" cy="300" r="3" fill="none" />
  
  <line data-anchor-ref="1" x1="150" y1="250" x2="200" y2="150" stroke="crimson" stroke-width="2"/>
  
  <text data-anchor-ref="1" x="205" y="145" fill="crimson" font-size="14" font-family="sans-serif">
    This is the feedback resistor (Rƒ). Its value determines the gain.
  </text>
  
  <line data-anchor-ref="2" x1="400" y1="300" x2="500" y2="350" stroke="crimson" stroke-width="2"/>
  <text data-anchor-ref="2" x="505" y="355" fill="crimson" font-size="14" font-family="sans-serif">
    The non-inverting input is tied to ground.
  </text>
</svg>
​```
```

In a standard viewer, this shows two distinct, readable code blocks. In a Qharbox-enabled viewer (like a Logseq plugin or a custom MarkText fork), this would render as a single interactive diagram.



---

## Technical Specification

### `qharbox-meta` Block

This block defines the configuration for the Qharbox instance.

* **Language Identifier:** Must be `qharbox-meta`.
* **Format:** YAML.
* **Fields:**
    * `version` (Required): The version of the Qharbox spec this block adheres to. Starts at `1.0`.
    * `image_src` (Required): The relative or absolute URL to the base image to be annotated.
    * `width` (Required): The native width of the image in pixels.
    * `height` (Required): The native height of the image in pixels.
    * `title` (Optional): A title for the diagram, which can be used for accessibility or as a caption.

### `qharbox-svg` Block

This block contains the vector data for all annotations. It must immediately follow its corresponding `qharbox-meta` block.

* **Language Identifier:** Must be `qharbox-svg`.
* **Format:** A single, self-contained `<svg>` XML element.
* The `viewBox` attribute of the `<svg>` tag should match the `width` and `height` from the meta block (e.g., `viewBox="0 0 800 600"`).
* **Custom Attributes for Interactivity:**
    * `data-anchor-id`: Used on an element (like a `<circle>`) to define a logical anchor point. The value should be a unique identifier within the SVG.
    * `data-anchor-ref`: Used on annotation elements (`<line>`, `<text>`, etc.) to associate them with a specific anchor defined by `data-anchor-id`.

---

## Rendering Logic (For Integrators)

A custom renderer should perform the following steps:

1.  Identify a `qharbox-meta` code block.
2.  Parse its YAML content to get the configuration.
3.  Find the next sibling block and verify it is a `qharbox-svg` block.
4.  Create a root container `<div>` with relative positioning.
5.  Inject an `<img>` element into the container with its `src` set to `image_src`.
6.  Inject the `<svg>` content from the SVG block into the container. This SVG should be layered on top of the image using absolute positioning.
7.  Attach JavaScript event listeners to the SVG elements to enable interactivity (e.g., dragging anchors, editing text).

## Roadmap

* **Phase 1: Reference Implementation:** Develop a full-featured Logseq plugin that can parse and render Qharbox blocks.
* **Phase 2: Editor Development:** Create a standalone web-based editor that allows users to create Qharbox diagrams with a GUI and export the resulting two-block Markdown code.
* **Phase 3: Broader Integration:** Explore implementations for other extensible platforms, such as a proof-of-concept MarkText fork or an Obsidian plugin.

## License

This project is licensed under the MIT License.
