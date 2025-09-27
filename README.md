# Qharbox

**A modular engine for creating interactive, annotated diagrams directly within Markdown.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Qharbox allows you to create rich, graphical callouts and annotations on images without leaving your favorite Markdown editor. It's designed for technical documentation, tutorials, and complex note-taking where a static image just isn't enough.

The project is built on a unique core philosophy that enables powerful features within the limitations of standard text-based formats.

## The Core Philosophy: The Quantum-Character Box

The foundational principle of Qharbox is the **Quantum-Character Box**. This concept dictates that all graphical alignment and annotation data is abstracted in terms of a single-dimensional coordinate system, as if every possible position on a 2D canvas could be mapped to a character in a string.

This approach treats the annotation data as being in a "quantum" state:

1.  **As Raw Text:** In its native form, the data is a simple, linear sequence of characters and coordinates. It is portable, human-readable, and can be stored in any plain text format.
2.  **As a Rendered Graphic:** When observed by a Qharbox-compatible renderer, this 1D data is "resolved" into a rich, 2D interactive diagram layered on top of its source image.

By abstracting complex 2D graphs into a simple 1D format, Qharbox ensures that the source of truth is always just text.

### A Key Benefit: Graceful Degradation

A direct and powerful result of the Quantum-Character Box philosophy is **Graceful Degradation**. Because the underlying data is just structured text, your Qharbox diagrams remain readable and understandable even in standard Markdown viewers that don't have the Qharbox renderer installed. The diagram simply "collapses" to its text state without losing any core information.

## How It Works: The Two-Block System

To implement this philosophy in Markdown, Qharbox uses a pair of fenced code blocks. A custom Qharbox renderer will intelligently combine these two blocks into one interactive component.

1.  **The Meta Block (`qharbox-meta`):** A human-readable block containing configuration, including the source image and its dimensions.
2.  **The SVG Block (`qharbox-svg`):** Contains all the 1D anchor data and annotation text, structured within a standard SVG format for rendering.

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

In a standard viewer, this shows two distinct, readable code blocks. In a Qharbox-enabled viewer, this renders as a single interactive diagram.



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
* The `viewBox` attribute of the `<svg>` tag should match the `width` and `height` from the meta block.
* **Custom Attributes for Interactivity:**
    * `data-anchor-id`: Used on an element to define a logical anchor point. The value should be a unique identifier. This represents a point in the 1D coordinate space.
    * `data-anchor-ref`: Used on annotation elements (`<line>`, `<text>`, etc.) to associate them with a specific anchor defined by `data-anchor-id`.

---

## Rendering Logic (For Integrators)

A custom renderer should perform the following steps:

1.  Identify a `qharbox-meta` code block and parse its YAML content.
2.  Find the next sibling block and verify it is a `qharbox-svg` block.
3.  Based on the Quantum-Character Box logic, resolve the 1D anchor data from the SVG into 2D (x, y) coordinates relative to the image dimensions.
4.  Create a root container `<div>` with relative positioning.
5.  Inject an `<img>` element into the container.
6.  Inject the `<svg>` content into the container, layered on top of the image.
7.  Attach JavaScript event listeners to the SVG elements to enable interactivity.

## Roadmap

* **Phase 1: Reference Implementation:** Develop a full-featured Logseq plugin that can parse and render Qharbox blocks.
* **Phase 2: Editor Development:** Create a standalone web-based editor that allows users to create Qharbox diagrams with a GUI and export the resulting two-block Markdown code.
* **Phase 3: Broader Integration:** Explore implementations for other extensible platforms, such as a proof-of-concept MarkText fork or an Obsidian plugin.

## License

This project is licensed under the MIT License.
