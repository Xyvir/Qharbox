# Qharbox

**A modular engine for creating vector-based annotations directly on blocks of text within Markdown.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Qharbox allows you to draw lines, highlight sections, and attach SVG primitives to your prose or code snippets without leaving your favorite Markdown editor. It is a tool designed for creating deeply integrated, text-focused diagrams with a fast, intuitive, and tool-free user interface.

The project is built on two core philosophies: a unique multi-modal UI for interaction and a flexible, text-based anchor system for portability.

## Core Philosophy 1: Multi-Modal UI

Qharbox rejects the traditional "toolbox" approach of switching between separate tools. Instead, interaction is multi-modal and based on intuitive mouse actions:

* **Left-Click is Always Draw (with Shape Recognition):** Clicking and dragging with the left mouse button always draws a freeform path. The system has a "weak" shape detection algorithm; if your stroke closely resembles a rectangle, ellipse, or straight line, it will be automatically converted to the corresponding clean SVG primitive upon release.

* **Right-Click is Always Select & Transform:** A single right-click always selects an object or text. When a shape is selected, classic transformation handles appear, allowing it to be moved, resized, and **rotated**. The system intentionally avoids complex tool modes (like skewing) to maintain simplicity. Right-clicking and dragging creates a selection box.

* **Simple GUI, Deep Customization:** The Qharbox UI is intentionally minimalist. It exposes only the most essential controls, like a simple toggle for opaque/transparent fills. Advanced customizations—such as specific line thicknesses, precise opacity levels, or custom hex color codes—are handled by directly editing the attributes in the `qx-markups` code block.

* **Implicit Node & Layer Management:** Qharbox has light markup in mind. Z-position is handled in-editor by "last-selected-on-top," while the SVG block's top-to-bottom order provides manual control.

* **Slash Command Palettes for Insertion:** Pressing `/` opens a temporary command palette to quickly insert or re-instance complex shapes. Selecting a shape activates a "ghost" preview that follows the cursor, allowing the user to position it before clicking to insert. Right click allows repeat-insert, left click returns to standard interface.

* **Undo is Erase:** There is no dedicated erase function. To remove markups, the user can either use the standard undo command (`Ctrl/Cmd + Z`) or delete the underlying text anchor.

This design keeps the user in a creative flow state, removing the friction of constantly switching between modes or fiddling with unimportant minutia.

---
## Core Philosophy 2: Text-Based Anchoring & Graceful Degradation

All graphical markups are attached to the document via a flexible anchor system. An anchor is defined by two parts:
1.  A **text anchor** (`anchor-line`, `anchor-char`) that specifies a point on the text grid.
2.  A **shape anchor** (`anchor-x`, `anchor-y`) that specifies which point on the markup itself connects to the text anchor.

A powerful result of this philosophy is **Graceful Degradation**. Because the source data is just two separate text blocks, your Qharbox diagrams remain perfectly useful in standard Markdown viewers. The markups simply "collapse" into a separate code block, leaving the source text completely undisturbed.

---
## How It Works: The Two-Block System

Qharbox uses a pair of fenced code blocks. The user interacts with a rendered, graphical component, while the underlying markup is stored as plain text.

1.  **The Text Block (`qx-text`):** The source text that you wish to annotate.
2.  **The Markup Block (`qx-markups`):** An SVG block containing shape data and the anchor coordinates.

---
## Example Usage

    ​```qx-text
    function initialize(value) {
      let count = value ?? 0;
      // This is where the magic happens.
      process(count);
    }
    ​```
    
    ​```qx-markups
    <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
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

### Undo History: A Unified Snapshot System

To ensure a robust and simple undo/redo system, Qharbox uses a "Serialized State as History" approach. Instead of managing a complex tree of user actions, the editor's history is a simple stack of snapshots, with each snapshot capturing the complete state of **both the `qx-text` and `qx-markups` blocks**.

* **How it Works:** After every significant user action—whether it's typing in the text block or drawing a shape on the canvas—the editor captures the full text content of both blocks and saves it as a single snapshot. This snapshot is then pushed onto an undo stack.

* **Performing an Undo:** An "undo" action simply pops the last snapshot off the stack, re-parses both blocks, and rebuilds the entire component's state (both text and visuals).

* **Key Benefits:**
    * **Simplicity:** Eliminates the need to write separate undo logic for text editing and graphical editing. The only function needed is "load state from snapshot."
    * **Robustness:** It is virtually impossible for the editor to get into a broken or inconsistent state, as every undo action is a full reload of a previously valid snapshot.
    * **Unified History:** This approach **flattens the undo state of both text edits and drawing manipulations into a single, linear history**. A user can type some text, draw a line, type more text, and then undo each of those actions sequentially with `Ctrl+Z`, creating a seamless and predictable experience.

### Project Foundation and Architecture

The Qharbox editor will be built using a modern UI framework (**Svelte** is the primary candidate) wrapped around a powerful, extensible text editor engine (**CodeMirror 6**). This provides a modular, state-driven "sandbox" for the entire component.

### Rendering and UI Implementation

1.  **Core Text Engine:** CodeMirror 6 will render the text from the `qx-text` block.
2.  **SVG Overlay:** A custom CodeMirror 6 "layer" extension will render the SVG elements from the `qx-markups` block.
3.  **Coordinate System:** The renderer operates on a fixed-grid system based on a **monospace font**. On initialization, it measures a single character's width and height, and all subsequent anchor calculations are simple multiplications.
4.  **Bespoke UI Input:** A custom CodeMirror 6 **input handler extension** will intercept raw DOM events to implement the multi-modal UI, preventing the editor's default behaviors.

### Editor Experience and Font Enforcement

1.  **Font Enforcement:** The renderer will apply its own CSS to enforce a monospace font. If it detects a conflict from user styles, it should display a clear error message.
2.  **Collapsing Markup Block:** The `qx-markups` block should be **collapsed by default**. The markup is hidden unless a user explicitly clicks an icon (e.g., `</>`) to expand it for manual editing. The block should auto-collapse once the user clicks away.
3.  **Minimum Canvas Height:** The `qx-text` block should have a **minimum height** (e.g., 10 lines) to provide a usable drawing surface immediately. The block can still grow dynamically if more text is added.

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

* **Phase 1: Logseq Plugin (Rendering):** Develop a Logseq plugin that can correctly parse and render existing `qx-text` and `qx-markups` blocks into a static, view-only visual. This establishes the core rendering logic.
* **Phase 2: Logseq Plugin (Interactivity):** Enhance the plugin to enable the full multi-modal UI for creating, editing, and deleting markups directly on the canvas.
* **Phase 3: Standalone Editor:** Wrap the core Svelte application into a simple standalone web or desktop app. This provides a focused writing/editing environment outside of Logseq.
* **Phase 4: Image & PDF Annotation:** Implement functionality to allow an image or PDF page as an alternative canvas, or import an SVG as one Qharbox block per page.

## License

This project is licensed under the MIT License.
