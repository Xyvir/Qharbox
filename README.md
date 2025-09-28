# Qharbox

**A modular engine for creating vector-based annotations directly on blocks of text within Markdown.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Qharbox allows you to draw lines, highlight sections, and attach SVG primitives to your prose or code snippets without leaving your favorite Markdown editor. It is a tool designed for creating deeply integrated, text-focused diagrams with a fast, intuitive, and tool-free user interface.

The project is built on two core philosophies: a unique multi-modal UI for interaction and a flexible, text-based anchor system for portability.

## Core Philosophy 1: Multi-Modal UI

Qharbox rejects the traditional "toolbox" approach of switching between separate tools. Instead, interaction is multi-modal and based on intuitive mouse actions:

* **Left-Click is Always Draw:** Clicking and dragging with the left mouse button always creates a new pen-stroke (with shape detection and intelligent snapping).
* **Right-Click is Always Select:** A single right-click always selects an object or text. Right-clicking and dragging creates a selection box.
* **Implicit Node & Layer Management:** Qharbox has light markup in mind. Z-position is handled in-editor by "last-selected-on-top," while the SVG block's top-to-bottom order provides manual control.
* **Slash Command Palettes:** Pressing `/` opens a temporary command palette to quickly create, insert, or re-instance complex shapes.
* **Undo is Erase:** No dedicated erase function; either undo or delete the underlying anchor to remove markups.

This design keeps the user in a creative flow state, removing the friction of constantly switching between modes.

---
## Core Philosophy 2: Text-Based Anchoring & Graceful Degradation

All graphical markups are attached to the document via a flexible anchor system. An anchor is defined by two parts:
1.  A **text anchor** (`anchor-line`, `anchor-char`) that specifies a point on the text grid.
2.  A **shape anchor** (`anchor-x`, `anchor-y`) that specifies which point on the markup itself connects to the text anchor.

A powerful result of this philosophy is **Graceful Degradation**. Because the source data is just two separate text blocks, your Qharbox diagrams remain perfectly useful in standard Markdown viewers.

---
## How It Works: The Two-Block System

Qharbox uses a pair of fenced code blocks. The user interacts with a rendered, graphical component, while the underlying markup is stored as plain text.

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
* **Content:** Any plain text, prose, or code.

### `qx-markups` Block

* **Language Identifier:** `qx-markups`.
* **Format:** A single, self-contained `<svg>` XML element.
* **Anchor Attributes (on a wrapper `<g>` tag):**
    * `anchor-line` (Required): The line number within the text block (1-indexed).
    * `anchor-char` (Required): The character number on that line (1-indexed).
    * `anchor-x` (Optional, Default: `0`): The x-coordinate of the anchor point **within the shape's local coordinate system**.
    * `anchor-y` (Optional, Default: `0`): The y-coordinate of the anchor point **within the shape's local coordinate system**.
* **Instancing and Inheritance:**
    * Reusable shapes should be defined within a `<defs>` block. Each defined shape must have a unique `id`.
    * To instance a shape, use the `<use>` element, referencing the `id` with `href="#shape-id"`.

---
## Implementation Strategy

### Project Foundation and Architecture

The Qharbox editor will be built using a modern UI framework (**Svelte** is the primary candidate) wrapped around a powerful, extensible text editor engine (**CodeMirror 6**). This provides a modular, state-driven "sandbox" for the entire component.

### Rendering and UI Implementation

1.  **Core Text Engine:** CodeMirror 6 will render the text from the `qx-text` block.
2.  **SVG Overlay:** A custom CodeMirror 6 "layer" extension will render the SVG elements from the `qx-markups` block.
3.  **Coordinate System:** The renderer operates on a fixed-grid system based on a **monospace font**. On initialization, it measures a single character's width and height, and all subsequent anchor calculations are simple multiplications.
4.  **Bespoke UI Input:** A custom CodeMirror 6 **input handler extension** will intercept raw DOM events to implement the multi-modal UI, preventing the editor's default behaviors.

### Editor Experience and Font Enforcement

To ensure a seamless experience, the Qharbox renderer should be designed with two key behaviors:

1.  **Font Enforcement:** The renderer will apply its own CSS to the `qx-text` block to enforce a monospace font. On initialization, it can also check if external user styles are overriding this with a variable-width font. If a conflict is detected, the renderer should display a clear, non-intrusive error message (e.g., "Qharbox rendering disabled: monospace font required") to the user.
2.  **Collapsing Markup Block:** To maintain a clean interface, the `qx-markups` block should be **collapsed by default**. The user interacts with the visual overlay. The underlying markup is hidden unless a user explicitly clicks an icon (e.g., `</>`) to expand it for manual editing. The block should auto-collapse once the user clicks away from it.

---
## Rendering Logic (For Integrators)

1.  Identify a `qx-text` block and apply monospace font styling.
2.  Find the next sibling `qx-markups` block.
3.  For each group `<g>` that has anchor attributes:
    a. Calculate the absolute pixel position of the **text anchor** from `anchor-line` and `anchor-char`.
    b. Read the **shape anchor** offset from `anchor-x` and `anchor-y`.
    c. Calculate the final transform: `translateX = textAnchorX - shapeAnchorX`, `translateY = textAnchorY - shapeAnchorY`.
    d. Apply this as an SVG transform to the group.
4.  Layer the fully transformed SVG on top of the rendered text.

---
## Roadmap

* **Phase 1: Reference Implementation:** Develop a full-featured Logseq plugin that can parse, render, and enable the multi-modal UI.
* **Phase 2: Editor Development:** Create a standalone web-based editor that provides the core Qharbox editing experience and exports the resulting Markdown code.
* **Phase 3: Image & PDF Annotation:** Implement functionality to allow an image or PDF page as an alternative canvas.

## License

This project is licensed under the MIT License.
