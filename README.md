# Qharbox

**A modular engine for creating vector-based annotations directly on blocks of text within Markdown.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Qharbox allows you to draw lines, highlight sections, and attach SVG primitives to your prose or code snippets without leaving your favorite Markdown editor. It is a tool designed for creating deeply integrated, text-focused diagrams with a fast, intuitive, and tool-free user interface.

The project is built on two core philosophies: a unique multi-modal UI for interaction and a flexible, text-based anchor system for portability.

## Core Philosophy 1: Multi-Modal UI

Qharbox rejects the traditional "toolbox" approach of switching between separate tools. Instead, interaction is multi-modal and based on intuitive mouse actions:

* **Left-Click is Always Draw:** Clicking and dragging with the left mouse button always creates a new primitive.
* **Right-Click is Always Select:** A single right-click always selects an object or text. Right-clicking and dragging creates a selection box.
* **Flattened Node & Layer Management:** Editing is done directly on the canvas with a simple, flat context menu system, eliminating fiddly panels.
* **Slash Command Palettes:** Pressing `/` opens a temporary command palette to quickly insert or re-instance complex shapes, supporting a system of inheritance to reduce SVG clutter.

This design keeps the user in a creative flow state, removing the friction of constantly switching between modes.

## Core Philosophy 2: Text-Based Anchoring & Degradation

All graphical markups are attached to the document via a flexible anchor system. An anchor is defined by two parts:
1.  A **text anchor** (`line`, `char`) that specifies a point on the text grid.
2.  A **shape anchor** (`anchor-x`, `anchor-y`) that specifies which point on the markup itself connects to the text anchor.

A powerful result of this philosophy is **Graceful Degradation**. Because the source data is just two separate text blocks, your Qharbox diagrams remain perfectly useful in standard Markdown viewers. The markups simply "collapse" into a separate code block, leaving the source text completely undisturbed.

## How It Works: The Two-Block System

Qharbox uses a pair of fenced code blocks. All text to be displayed must exist in the first block; the second block contains only non-text SVG primitives.

1.  **The Text Block (`qx-text`):** The source text that you wish to annotate.
2.  **The Markup Block (`qx-markups`):** An SVG block containing shape data and the anchor coordinates.

---

### Example Usage

```markdown
​```qx-text
function initialize(value) {
  let count = value ?? 0;
  // This is where the magic happens.
  process(count);
}
​```

​```qx-markups
<svg xmlns="http://www.w.w3.org/2000/svg">
  <g data-anchor-line="2" data-anchor-char="21"
     data-anchor-x="0" data-anchor-y="0">
    <line x1="0" y1="0" x2="100" y2="-20" stroke="dodgerblue" stroke-width="2"/>
  </g>
  
  <g data-anchor-line="4" data-anchor-char="2"
     data-anchor-x="60" data-anchor-y="10">
    <rect x="0" y="0" width="120" height="20" fill="rgba(255, 165, 0, 0.3)" stroke="orange" stroke-width="1.5" />
  </g>
</svg>
​```
```
---

## Technical Specification

### `qx-text` Block

* **Language Identifier:** `qx-text`.
* **Content:** Any plain text, prose, or code. This is the **only** block where text intended for display should be placed.

### `qx-markups` Block

* **Language Identifier:** `qx-markups`.
* **Format:** A single, self-contained `<svg>` XML element containing **only non-text primitives** (e.g., `<line>`, `<rect>`), typically wrapped in a group `<g>` tag.
* **Custom Anchor Attributes (on the `<g>` tag):**
    * `data-anchor-line` (Required): The line number within the text block (1-indexed) where the shape is anchored.
    * `data-anchor-char` (Required): The character number on that line (1-indexed).
    * `data-anchor-x` (Optional, Default: `0`): The x-coordinate of the anchor point **within the shape's local coordinate system**.
    * `data-anchor-y` (Optional, Default: `0`): The y-coordinate of the anchor point **within the shape's local coordinate system**.

---

## Rendering Logic (For Integrators)

1.  Identify a `qx-text` block and render its content.
2.  Find the next sibling `qx-markups` block.
3.  For each group `<g>` in the SVG:
    a. Calculate the absolute pixel position of the **text anchor** (`textAnchorX`, `textAnchorY`) from `data-anchor-line` and `data-anchor-char`.
    b. Read the **shape anchor** offset (`shapeAnchorX`, `shapeAnchorY`) from `data-anchor-x` and `data-anchor-y`.
    c. Calculate the final transform: `translateX = textAnchorX - shapeAnchorX` and `translateY = textAnchorY - shapeAnchorY`.
    d. Apply this as an SVG transform: `<g transform="translate(translateX, translateY)">...`.
4.  Layer the fully transformed SVG on top of the rendered text.

## Roadmap

* **Phase 1: Reference Implementation:** Develop a full-featured Logseq plugin that can parse, render, and enable the multi-modal UI for editing Qharbox blocks.
* **Phase 2: Editor Development:** Create a standalone web-based editor that provides the core Qharbox editing experience and exports the resulting two-block Markdown code.
* **Phase 3: Image Annotation:** Implement functionality to allow an image as an alternative canvas to a text block.

## License

This project is licensed under the MIT License.
