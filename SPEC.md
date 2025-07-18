Of course. I've integrated these four new requirements into the project's core principles and the editor's development plan.

Here is the complete, updated specification.

-----

## Qharbox (QHB) Format Specification

### Introduction

Qharbox (QHB) is an innovative document format designed to seamlessly integrate precise, scalable vector graphics with human-readable Markdown text. It leverages the power of Scalable Vector Graphics (SVG) for visual elements, GitHub Flavored Markdown (GFM) for structured text, a monospace character grid for predictable anchoring, and YAML for a typable, version-control-friendly source format. QHB aims to provide a robust solution for technical documentation, diagrams, annotated notes, and any content requiring tight integration of text and visuals without sacrificing readability or editability in a plain-text environment.

The format's name, **Qharbox**, derives from "**Q**uantum **Char**acter **Box**." This highlights its core principle: the Character Box is the smallest, consistent, and foundational spatial unit of the monospace text grid. By treating this box as a "quantum" unit, Qharbox provides pixel-agnostic and highly precise positioning and sizing for graphics, always relative to the text's inherent grid.

#### Core Principles:

  * **Resolution Independence**: All visual elements are SVG, and all dimensions and positions are expressed in Qharbox units (`qx`), inherently linking them to the monospace text grid.
  * **Human-Readability & Typability**: The underlying YAML format with in-line graphic definitions is designed to be easily read and edited by humans.
  * **Structured Anchoring**: Vector objects are precisely anchored to a monospace text grid, ensuring predictable placement across different rendering environments.
  * **Simplified Z-Axis**: Graphics consistently render on top of text, with their stacking order determined solely by their position in the source document.
  * **Cloud-Independent by Design**: The format and its reference editor are intentionally designed with no direct cloud integrations. This **user-first principle** ensures you always own and control your content and can use your preferred third-party syncing tools (Git, Dropbox, etc.).
  * **No AI Integration**: The project intentionally omits AI-powered indexing, search, or assistance features. This maintains a focused scope on the core text/vector editing niche and respects user privacy and content ownership, acknowledging that superior, dedicated AI tools exist elsewhere.
  * **Automatic & Seamless Persistence**: All changes are automatically saved. There is no manual "save" action for the user.
  * **Future-Proof for Collaboration**: The design avoids file locking and uses timestamp-based reconciliation (**Last Write Wins**). The groundwork for true multi-author, offline-first collaboration (on local networks or via file-syncing services) is laid by giving each graphic object a **unique, stable ID**, paving the way for future adoption of more advanced merging strategies like CRDTs.

-----

### 1\. Core Format Structure (YAML)

A Qharbox document is a YAML file, typically with a `.qhb` extension, structured into a YAML frontmatter and a main content block.

```yaml
---
title: My Qharbox Document
author: Jane Doe
version: 1.0.0
created: 2025-07-18
rendering_defaults:
  font_family: "JetBrains Mono", "Consolas", monospace
  font_size_px: 14
---
content: |
  # Document Title
  Here is an inline SVG object anchored to the character (C) below.
  (C) {% svg id: concept_diagram_1, char_index: 4, offset_x_qx: 0, offset_y_qx: 0.5 %}
    - type: circle
      cx: 0
      cy: 0
      r: 2
      fill: "#87ceeb"
  {% endsvg %}

  Standalone graphic anchored to implicit whitespace on the line below:

  {% svg id: standalone_graphic_1, char_index: 0, offset_x_qx: 10, offset_y_qx: 0 %}
    - type: rect
      x: 0
      y: 0
      width: 8
      height: 4
      fill: lightgreen
  {% endsvg %}
```

#### 1.1 YAML Frontmatter

Standard YAML key-value pairs at the beginning of the file, delimited by `---`. This section is for document metadata.

  * **`rendering_defaults`** (map, optional): A map of optional rendering recommendations from the author. A Qharbox renderer should respect these defaults **unless** explicitly overridden by a higher-priority setting, such as external CSS, application theme settings, or direct user preferences.
      * **`font_family`** (string, optional): A comma-separated list of recommended monospace font family names.
      * **`font_size_px`** (integer or float, optional): A recommended font size in pixels.

#### 1.2 `content` Block

The `content` key holds the main document body as a multi-line string (`|`). This block contains GitHub Flavored Markdown and Qharbox SVG extensions.

-----

### 2\. GFM (GitHub Flavored Markdown)

Qharbox supports GFM for all textual content. For precise anchoring, the GFM text **must** be rendered using a monospace font with a uniform size for all formatting. Hyperlinks to other `.qhb` files can be achieved using standard Markdown link syntax: `[link text](./path/to/file.qhb)`.

-----

### 3\. SVG Extensions (The `{% svg %}` Block)

Qharbox uses a custom block syntax to define or reference vector graphics.

#### 3.1 Syntax

*For inline graphics:*
`{% svg id: [unique_id], char_index: [N], ... %}`
`<yaml_svg_graphic_definitions>`
`{% endsvg %}`

*For external graphics:*
`{% svg id: [unique_id], char_index: [N], src: "[relative_path]", ... %}`
`{% endsvg %}`

#### 3.2 Attributes

  * **`id`** (string, optional but highly recommended): A unique identifier for the SVG object.
  * **`char_index`** (integer, 0-indexed): The character position on the logical line of GFM preceding the block.
  * **`src`** (string, optional): A relative path to an external `.svg` file. If `src` is provided, any inline `<yaml_svg_graphic_definitions>` within the block are ignored.
  * **`offset_x_qx`**, **`offset_y_qx`**, **`svg_anchor_x_qx`**, **`svg_anchor_y_qx`**: These attributes function identically for both inline and external SVGs, allowing precise anchoring of the referenced graphic.

#### 3.3 `<yaml_svg_graphic_definitions>`

A list of YAML objects defining inline SVG primitives. This section is ignored if the `src` attribute is used.

#### 3.4 Raster Image Handling

Direct embedding of raster images (e.g., PNG, JPEG) is an **intentional omission**. The recommended workaround is to convert raster image to a simple SVG image using a tool like Inkscape or similair and then embed the new .SVG image.

-----

### 4\. Rendering Rules

The rendering process is updated to handle both inline and external SVGs.

1.  **Monospace Grid Calculation**: The renderer calculates `ch_pixel_width` and `line_height_pixel_height`.
2.  **Anchor Point Calculation**: The renderer calculates the `Target_X` and `Target_Y` on the text grid.
3.  **SVG Object Transformation**:
      * **Fetch/Generate SVG Content**: If a `src` attribute is present, the renderer fetches the content of the external SVG; otherwise, it generates SVG from the inline YAML.
      * **Calculate Bounding Box & Anchor**: The renderer calculates the SVG's bounding box and internal anchor point in `qx` units.
      * **Generate and Position Root `<svg>`**: The renderer creates the final, absolutely positioned `<svg>` element with the correct `viewBox`, `width`, `height`, `top`, and `left` properties.

-----

### 5\. Development Plan

#### 5.1 Step 1: Format Specification (Completed)

Define the `.qhb` format, attributes, and rendering rules in this specification.

#### 5.2 Step 2: In-Browser JavaScript Renderer

  * **2a. Zero-Dependency, Modular JavaScript Renderer**: The primary goal is to create a standalone renderer with **no external dependencies**, achieved by developing two bespoke, modular components:
      * **Bespoke QHB Parser**: A lightweight parser for YAML frontmatter and `{% svg %}` blocks. It will implement a minimal GFM subset needed for layout.
      * **Bespoke SVG Renderer**: A module that performs all layout and positioning calculations.
  * **2b. MkDocs Companion Extension (Python)**: An MkDocs plugin to preprocess `.qhb` files.

#### 5.3 Step 3: VSCode Extension

A VSCode extension for a rich editing experience, including syntax highlighting for `.qhb` files, a real-time preview panel, and linting.

#### 5.4 Step 4: In-Browser WYSIWYG Editor

A graphical editor built from composable JavaScript modules.

  * **5.4.1 Editor UI & Layout**:
      * **Left-Side File Navigator**: In "notebook mode" (when a directory is opened), the editor will feature a left-side panel that displays a tree view of all files and folders, similar to the Notion or VSCode interface.
      * **Fixed-Width, Wrapping Text**: The main editor pane will have a fixed maximum width with text-wrapping enabled by default. Horizontal scrolling for text content is intentionally avoided to maintain focus and readability.
  * **5.4.2 Interaction & Features**:
      * **Slash Command & Fuzzy Search**: The primary interface for formatting and inserting objects will be through slash commands (`/`). If a typed command does not match a built-in function, it will instantly become a **fuzzy search** query, highlighting all matching strings in the current document. Simple hotkeys will allow the user to jump between search results without leaving the command interface.
      * **Block-Based Text Selection**: The default mouse-driven text selection will select rectangular `m x n` blocks of characters. When moved, these blocks will be non-destructively "inserted" between existing characters or lines, enabling intuitive columnar editing. Traditional linear selection will remain available via standard keyboard shortcuts (`Shift + Arrow Keys`, etc.).
      * **Bi-directional Sync**: A core module to convert between QHB YAML and the editor's internal format.
      * **Pen Tool Module**: A "Draw Mode" to create freehand SVG paths with automatic anchoring.

-----

### 6\. Future Considerations & Stretch Goals

  * **QHB File Transclusion**: Develop a custom syntax (e.g., `{{ include ./path/to/another.qhb }}`) to allow for the true embedding and rendering of one Qharbox file within another.
  * **Persistent Undo History**: Extend the IndexedDB store to save a granular operation history across sessions.
  * **Enhanced QFV (Qharbox-Flavored Vectors) Primitives**: Introduce higher-level primitives that compile to complex SVG (e.g., smart connectors).
  * **Mermaid.js Exporter**: Develop an extension for Mermaid.js that allows diagrams to be exported to the Qharbox format.
  * **Pandoc Extension**: A Pandoc filter to convert QHB files to other formats (PDF, LaTeX, etc.).
