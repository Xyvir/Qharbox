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

---
## Core Philosophy 2: Text-Based Anchoring & Degradation

All graphical markups are attached to the document via a flexible anchor system. An anchor is defined by two parts:
1.  A **text anchor** (`anchor-line`, `anchor-char`) that specifies a point on the text grid.
2.  A **shape anchor** (`anchor-x`, `anchor-y`) that specifies which point on the markup itself connects to the text anchor.

A powerful result of this philosophy is **Graceful Degradation**. Because the source data is just two separate text blocks, your Qharbox diagrams remain perfectly useful in standard Markdown viewers. The markups simply "collapse" into a separate code block, leaving the source text completely undisturbed.

---
## How It Works: The Two-Block System

Qharbox uses a pair of fenced code blocks. All text to be displayed must exist in the first block; the second block contains only non-text SVG primitives.

1.  **The Text Block (`qx-text`):** The source text that you wish to annotate.
2.  **The Markup Block (`qx-markups`):** An SVG block containing shape data and the anchor coordinates.

---
## Example Usage

```markdown
​```qx-text
function initialize(value) {
  let count = value ?? 0;
  // This is where the magic happens.
  process(count);
}
​```

​```qx-markups
<svg xmlns="http://www.w3.org/2000/svg">
  <defs>
    <g id="reusable-arrow">
      <line x1="0" y1="0" x2="30" y2="0" stroke="currentColor" stroke-width="2"/>
      <path d="M 30 0 L 25 -5 L 25 5 Z" fill="currentColor"/>
    </g>
  </defs>

  <g anchor-line="4" anchor-char="2"
     anchor-x="60" anchor-y="10">
    <rect x="0" y="0" width="120" height="20" fill="rgba(255, 165, 0, 0.3)" stroke="orange" stroke-width="1.5" />
  </g>

  <g anchor-line="2" anchor-char="3"
     anchor-x="0" anchor-y="0">
    <use href="#reusable-arrow" fill="dodgerblue" transform="rotate(-45)" />
  </g>

  <g anchor-line="4" anchor-char="10"
     anchor-x="0" anchor-y="0">
    <use href="#reusable-arrow" fill="crimson" />
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
* **Format:** A single, self-contained `<svg>` XML element.
* **Anchor Attributes (on a wrapper `<g>` tag):**
    * `anchor-line` (Required): The line number within the text block (1-indexed).
    * `anchor-char` (Required): The character number on that line (1-indexed).
    * `anchor-x` (Optional, Default: `0`): The x-coordinate of the anchor point **within the shape's local coordinate system**.
    * `anchor-y` (Optional, Default: `0`): The y-coordinate of the anchor point **within the shape's local coordinate system**.
* **Instancing and Inheritance:**
    * Complex or reusable shapes should be defined within a `<defs>` block at the top of the SVG. Each defined shape must have a unique `id`.
    * To instance a defined shape, use the `<use>` element, referencing the `id` with `href="#shape-id"`. The `<use>` element can then be transformed (moved, scaled, rotated) independently.

---
## Implementation Strategy

### Project Foundation and Architecture

The most effective way to build the Qharbox editor is to use a modern UI framework, with **Svelte** being the primary candidate due to its strong fit with the Logseq plugin ecosystem. This approach provides a modular, state-driven "sandbox" for the entire component.

The project will be built by wrapping a powerful, extensible text editor engine. **CodeMirror 6** was chosen as the ideal foundation because it is not a monolithic editor but a modular toolkit. This allows for deep customization.

### Rendering and UI Implementation

The architecture will consist of several key components working together within a Svelte wrapper:

1.  **Core Text Engine:** CodeMirror 6 will handle the rendering of the text from the `qx-text` block.
2.  **SVG Overlay:** A custom CodeMirror 6 "layer" extension will be created to render the SVG elements from the `qx-markups` block. This layer will sit on top of the text canvas.
3.  **Coordinate System:** The renderer will operate under the assumption of a **monospace font**. This provides a major performance and simplicity advantage. On initialization, the renderer will measure a single character's width and a single line's height. All subsequent anchor calculations (`line`, `char`) will be simple multiplications based on these two stored values, avoiding complex DOM queries.
4.  **Bespoke UI Input:** The unique multi-modal UI (left-click-draw, right-click-select) will be implemented as a custom CodeMirror 6 **input handler extension**. This extension will intercept raw DOM events (`mousedown`, `contextmenu`, etc.) *before* CodeMirror's default handlers. By returning `true` after processing an event, the extension will prevent the editor's default behaviors (like moving the cursor), ensuring the bespoke UX works without disruption.

---
## Rendering Logic (For Integrators)

1.  Identify a `qx-text` block and render its content.
2.  Find the next sibling `qx-markups` block.
3.  For each group `<g>` that has anchor attributes:
    a. Calculate the absolute pixel position of the **text anchor** (`textAnchorX`, `textAnchorY`) from `anchor-line` and `anchor-char`.
    b. Read the **shape anchor** offset (`shapeAnchorX`, `shapeAnchorY`) from `anchor-x` and `anchor-y`.
    c. Calculate the final transform: `translateX = textAnchorX - shapeAnchorX` and `translateY = textAnchorY - shapeAnchorY`.
    d. Apply this as an SVG transform to the group: `<g transform="translate(translateX, translateY)">...`.
4.  Layer the fully transformed SVG on top of the rendered text.

---
## Roadmap

* **Phase 1: Reference Implementation:** Develop a full-featured Logseq plugin that can parse, render, and enable the multi-modal UI for editing Qharbox blocks.
* **Phase 2: Editor Development:** Create a standalone web-based editor that provides the core Qharbox editing experience and exports the resulting two-block Markdown code.
* **Phase 3: Image Annotation:** Implement functionality to allow an image as an alternative canvas to a text block.

## License

This project is licensed under the MIT License.
