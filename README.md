# Qharbox

**A modular engine for creating vector-based annotations directly on blocks of text within Markdown.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Qharbox allows you to draw lines, add callouts, and attach SVG primitives to your prose, code snippets, or any block of text without leaving your favorite Markdown editor. It is a tool for creating deeply integrated, text-focused diagrams and analyses.

The project is built on a unique core philosophy that enables powerful features within the limitations of standard text-based formats.

## The Core Philosophy: The Quantum-Character Box

The foundational principle of Qharbox is the **Quantum-Character Box**. This concept dictates that all graphical alignment is abstracted in terms of a single-dimensional coordinate system that maps directly to the characters in the text being annotated. An anchor point isn't an (x, y) pixel coordinate, but rather a logical address, such as "line 5, character 12."

This approach treats the annotation data as being in a "quantum" state:

1.  **As Raw Text:** In its native form, the data consists of two simple text blocks: the content you are annotating, and the annotation instructions. It is portable, human-readable, and version-controllable.
2.  **As a Rendered Graphic:** When observed by a Qharbox-compatible renderer, the 1D character-based coordinates are "resolved" into a 2D SVG overlay, creating a rich, interactive diagram precisely aligned with the source text.

By abstracting complex 2D drawings into a simple, text-relative format, Qharbox ensures the source of truth is always just text.

### A Key Benefit: Graceful Degradation

A direct and powerful result of this philosophy is **Graceful Degradation**. Because the underlying data is just structured text, your Qharbox diagrams remain perfectly useful even in standard Markdown viewers. The annotations simply "collapse" into a separate code block, leaving the source text completely undisturbed and readable.

## How It Works: The Two-Block System

To implement this in Markdown, Qharbox uses a pair of fenced code blocks:

1.  **The Text Block (`qharbox-text`):** The source text that you wish to annotate.
2.  **The Annotation Block (`qharbox-annotations`):** An SVG block containing all the vector data (lines, text, etc.) and the character-based coordinates for alignment.

---

### Example Usage

Here is what a complete Qharbox component looks like in raw Markdown.

```markdown
​```qharbox-text
function initialize(value) {
  let count = value ?? 0;
  // This is where the magic happens.
  process(count);
}
​```

​```qharbox-annotations
<svg xmlns="http://www.w3.org/2000/svg">
  <line data-anchor-line="2" data-anchor-char="21" x2="100" y2="-20" stroke="dodgerblue" stroke-width="2"/>
  <text x="105" y="-15" fill="dodgerblue" font-size="14" font-family="sans-serif">
    The nullish coalescing operator (??) provides a default value.
  </text>
  
  <rect data-anchor-line="4" data-anchor-char="2" width="120" height="20" fill="rgba(255, 165, 0, 0.3)" stroke="orange" stroke-width="1.5" />
</svg>
​```
```

In a standard viewer, this shows two distinct code blocks. In a Qharbox-enabled viewer, this would render the code with the blue callout line and the orange highlight box drawn on top of it.



---

## Technical Specification

### `qharbox-text` Block

This block contains the source text to be annotated.

* **Language Identifier:** Must be `qharbox-text`.
* **Content:** Any plain text, prose, or code.

### `qharbox-annotations` Block

This block contains the vector data for all annotations. It must immediately follow its corresponding `qharbox-text` block.

* **Language Identifier:** Must be `qharbox-annotations`.
* **Format:** A single, self-contained `<svg>` XML element.
* **Custom Anchor Attributes:** SVG elements that need to be aligned to the text must use the following data attributes.
    * `data-anchor-line` (Required): The line number within the text block (1-indexed).
    * `data-anchor-char` (Required): The character number on that line (1-indexed).

---

## Rendering Logic (For Integrators)

A custom renderer must perform the following steps:

1.  Identify a `qharbox-text` block.
2.  Render this text into a container (e.g., a `<pre><code>` block), preserving whitespace.
3.  Find the next sibling block and verify it is `qharbox-annotations`.
4.  For each element with anchor attributes in the SVG, calculate the precise (x, y) pixel coordinates of the specified character within the rendered text container. This is the most complex step.
5.  Create a root container `<div>` with relative positioning.
6.  Place the rendered text inside.
7.  Inject the `<svg>` content into the container, layered on top of the text using absolute positioning, and update its elements' positions based on the calculated coordinates.

## Roadmap

* **Phase 1: Reference Implementation:** Develop a full-featured Logseq plugin that can parse and render Qharbox blocks.
* **Phase 2: Editor Development:** Create a standalone web-based editor that allows users to create Qharbox diagrams with a GUI and export the resulting two-block Markdown code.
* **Phase 3: Image Annotation:** Implement the originally planned feature to allow an image background as an alternative canvas to a text block.

## License

This project is licensed under the MIT License.
