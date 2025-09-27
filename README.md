# Qharbox

**A modular engine for creating vector-based annotations directly on blocks of text within Markdown.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Qharbox allows you to draw lines, highlight sections, and attach SVG primitives to your prose or code snippets without leaving your favorite Markdown editor. It is a tool designed for creating deeply integrated, text-focused diagrams with a fast, intuitive, and tool-free user interface.

The project is built on two core philosophies: a unique multi-modal UI for interaction and a text-based anchor system for portability.

## Core Philosophy 1: Multi-Modal UI

Qharbox rejects the traditional "toolbox" approach of switching between separate tools (like a "line tool," "select tool," "text tool"). Instead, interaction is multi-modal and based on intuitive mouse actions:

* **Left-Click is Always Draw:** Clicking and dragging with the left mouse button always creates a new primitive, such as a line or a rectangle. There is no need to select a "draw" mode.
* **Right-Click is Always Select:** A single right-click always selects a graphical object or text. Right-clicking and dragging creates a selection box to select multiple objects and text simultaneously.
* **Flattened Node & Layer Management:** Editing nodes, resizing shapes, and managing layers is done directly on the canvas with a simple, flat context menu system, eliminating fiddly panels and inspectors.
* **Slash Command Palettes:** Pressing `/` opens a temporary command palette. This palette allows you to insert new primitives, but more importantly, it's populated with previously used shapes. This allows you to quickly re-instance complex objects and supports a system of inheritance to reduce SVG clutter.

This design keeps the user in a creative flow state, removing the friction of constantly switching between modes.

## Core Philosophy 2: Text-Based Anchoring & Degradation

All graphical annotations are anchored logically to the text itself, using a simple `line` and `character` number coordinate system.

A powerful result of this philosophy is **Graceful Degradation**. Because the source data is just two separate text blocks, your Qharbox diagrams remain perfectly useful in standard Markdown viewers. The annotations simply "collapse" into a separate code block, leaving the source text completely undisturbed and readable.

## How It Works: The Two-Block System

Qharbox uses a pair of fenced code blocks. All text to be displayed must exist in the first block; the second block contains only non-text SVG primitives.

1.  **The Text Block (`qx-text`):** The source text that you wish to annotate. This is the **only** place text content should live.
2.  **The Markup Block (`qx-markups`):** An SVG block containing only shape data (`<line>`, `<rect>`, etc.) and the character-based coordinates for alignment.

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
<svg xmlns="http://www.w3.org/2000/svg">
  <line data-anchor-line="2" data-anchor-char="21" x2="100" y2="-20" stroke="dodgerblue" stroke-width="2"/>
  <rect data-anchor-line="4" data-anchor-char="2" width="120" height="20" fill="rgba(255, 165, 0, 0.3)" stroke="orange" stroke-width="1.5" />
</svg>
​```
```

In a Qharbox-enabled viewer, this would render the code with a blue line pointing to the nullish coalescing operator and an orange box highlighting the `process(count);` line.

---

## Technical Specification

### `qx-text` Block

* **Language Identifier:** `qx-text`.
* **Content:** Any plain text, prose, or code. **This is the only block where text intended for display should be placed.**

### `qx-markups` Block

* **Language Identifier:** `qx-markups`.
* **Format:** A single, self-contained `<svg>` XML element containing **only non-text primitives** (e.g., `<line>`, `<rect>`, `<circle>`, `<path>`).
* **Custom Anchor Attributes:** SVG elements that need to be aligned to the text must use the following data attributes.
    * `data-anchor-line` (Required): The line number within the text block (1-indexed).
    * `data-anchor-char` (Required): The character number on that line (1-indexed).

---

## Rendering Logic (For Integrators)

1.  Identify a `qx-text` block and render its content into a container (e.g., a `<pre><code>` block).
2.  Find the next sibling `qx-markups` block.
3.  For each element in the SVG, calculate the precise (x, y) pixel coordinates of its `data-anchor-line` and `data-anchor-char` within the rendered text container.
4.  Create a root `<div>` with relative positioning.
5.  Place the rendered text inside.
6.  Inject the `<svg>` content into a layer on top of the text, updating its elements' positions based on the calculated coordinates.

## Project Foundation and Architecture

The most effective way to build the Qharbox editor is to use a modern UI framework, with **Svelte** being the primary candidate due to its strong fit with the Logseq plugin ecosystem. This approach provides a modular, state-driven "sandbox" for the entire component.

The project will be built by wrapping a powerful, extensible text editor engine. **CodeMirror 6** was chosen as the ideal foundation because it is not a monolithic editor but a modular toolkit. This allows for deep customization.

---
## Rendering and UI Implementation

The architecture will consist of several key components working together within a Svelte wrapper:

1.  **Core Text Engine:** CodeMirror 6 will handle the rendering of the text from the `qx-text` block.
2.  **SVG Overlay:** A custom CodeMirror 6 "layer" extension will be created to render the SVG elements from the `qx-markups` block. This layer will sit on top of the text canvas.
3.  **Coordinate System:** The renderer will operate under the assumption of a **monospace font**. This provides a major performance and simplicity advantage. On initialization, the renderer will measure a single character's width and a single line's height. All subsequent anchor calculations (`line`, `char`) will be simple multiplications based on these two stored values, avoiding complex DOM queries.
4.  **Bespoke UI Input:** The unique multi-modal UI (left-click-draw, right-click-select) will be implemented as a custom CodeMirror 6 **input handler extension**. This extension will intercept raw DOM events (`mousedown`, `contextmenu`, etc.) *before* CodeMirror's default handlers. By returning `true` after processing an event, the extension will prevent the editor's default behaviors (like moving the cursor), ensuring the bespoke UX works without disruption.

## Roadmap

* **Phase 1: Reference Implementation:** Develop a full-featured Logseq plugin that can parse, render, and enable the multi-modal UI for editing Qharbox blocks.
* **Phase 2: Editor Development:** Create a standalone web-based editor that provides the core Qharbox editing experience and exports the resulting two-block Markdown code.
* **Phase 3: Image Annotation:** Implement functionality to allow an image as an alternative canvas to a text block.

## License

This project is licensed under the MIT License.
