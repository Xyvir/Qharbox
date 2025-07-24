## Qharbox (QHB) Format Specification

### Introduction

Qharbox (QHB) is an innovative document format designed to seamlessly integrate precise, scalable vector graphics with human-readable Markdown text. It leverages the power of Scalable Vector Graphics (SVG) for visual elements, GitHub Flavored Markdown (GFM) for structured text, a monospace character grid for predictable anchoring, and YAML for a typable, version-control-friendly source format.

The format's name, **Qharbox**, derives from "**Q**uantum **Char**acter **Box**." This highlights its foundational concept: the Character Box is the smallest, consistent, spatial unit of the monospace text grid. By treating this box as a "quantum" unit, Qharbox provides pixel-agnostic and highly precise positioning for graphics relative to the text's inherent grid.

-----

### Core Principles

These are the philosophical foundations that guide the design of the Qharbox format and its ecosystem.

  * **Resolution Independence**: All visual elements are vector-based (SVG), and all dimensions are expressed in Qharbox units (`qx`). This ensures that visual fidelity is maintained across all display resolutions and zoom levels.
  * **Human-Readability & Typability**: The underlying YAML format with in-line graphic definitions is designed to be easily read, written, and modified by humans in any plain-text editor.
  * **Structured Anchoring on a Monospace Grid**: Vector objects are precisely anchored to the text grid, ensuring that the spatial relationship between text and graphics is predictable and consistent across different rendering environments.
  * **User-First Design & Content Ownership**:
      * **Cloud-Independent**: The format and its reference editor are intentionally designed with no direct cloud integrations. This ensures users always own and control their content and can use their preferred third-party syncing tools (Git, Dropbox, etc.).
      * **No AI Integration**: The project intentionally omits AI-powered features. This maintains a focused scope and respects user privacy, acknowledging that superior, dedicated AI tools exist elsewhere.
  * **Full Architectural and UX Transparency: To provide ultimate control and awareness, our format and editor are intentionally human-readable, lightweight, and non-proprietary. No importing or exporting is required. This ensures you have a clear, transparent understanding of your formatting, content, and rendering, free from hidden complexities or vendor lock-in.
  * **Decentralized & Future-Ready**: The format is designed for longevity and collaboration. By giving each graphic object a **unique, stable ID** and using a timestamp-based reconciliation approach (Last Write Wins), the groundwork is laid for future adoption of more advanced merging strategies like CRDTs, enabling robust multi-author workflows.

-----

### Technical Specification

This section defines the technical structure of a `.qhb` file.

#### 1\. File Structure

A Qharbox document is a YAML file (typically with a `.qhb` extension) containing a frontmatter section and a main `content` block.

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
```

#### 2\. YAML Frontmatter

Standard YAML key-value pairs at the beginning of the file, delimited by `---`. This section holds document metadata.

  * **`rendering_defaults`** (map, optional): A map of rendering recommendations from the author. A Qharbox renderer should respect these defaults unless overridden by a higher-priority setting (e.g., application theme, user preferences).
      * **`font_family`** (string, optional): A recommended CSS `font-family` string for the monospace font.
      * **`font_size_px`** (number, optional): A recommended font size in pixels.

#### 3\. Content Block

The `content` key holds the main document body as a multi-line string (`|`). This block contains GFM text and Qharbox SVG extensions.

  * **Text (GitHub Flavored Markdown)**: Qharbox supports GFM for all textual content. For precise anchoring, the GFM text **must** be rendered using a monospace font. Standard Markdown links can be used to reference other files: `[link text](./path/to/file.qhb)`.

  * **Graphics (`{% svg %}` Block)**: Qharbox uses a custom block syntax to define or reference vector graphics.

      * **Syntax:**

        ```twig
        {# For inline graphics or parent definitions: #}
        {% svg id: [unique_id], char_anchor: [N], ... %}
        <yaml_svg_graphic_definitions>
        {% endsvg %}

        {# For external graphics or children objects: #}
        {% svg id: [unique_id], char_anchor: [N], src: "[relative_path]"/[parent_id], ... %}
     
        ```

      * **Attributes:**

          * **`id`** (string, required): A unique identifier for the SVG object, essential for persistence and future collaboration features.
          * **`anchor`** (integer, optional): The 0-indexed character position on the logical line of GFM text that precedes the block. This determines the anchor point.
                               If ommited the object will not be rendered and assumed to be a parent definition for later children to reference.
          * **`src`** (string, optional): A relative path to an external `.svg` file, or the 'id' of a parent object. A child will inherent all properties of the parent, unless overwritten.
          * **`char_qx`**, **`char_qy`**, **`svg_qx`**, **`svg_qy`**: Attributes for precisely positioning the graphic relative to its anchor. Max range is -0.5 to 0.5

      * **Inline Definitions (`<yaml_svg_graphic_definitions>`):**
        A list of YAML objects defining SVG primitives. 

      * **Raster Image Handling:**
        Direct embedding of raster images (e.g., PNG, JPEG) is an **intentional omission** to maintain the format's resolution-independent ethos. The recommended workflow is to convert a raster image into an SVG (e.g., via Inkscape) and embed the resulting SVG file.


-----

### Rendering Specification

This section defines the rules a Qharbox renderer must follow for consistent visual output.

#### 1\. Monospace Grid Calculation

The renderer must first dynamically calculate the precise pixel dimensions of a single character box in the rendered monospace font.

  * **`ch_pixel_width`**: The width of a single character.
  * **`line_height_pixel_height`**: The height of a single line of text.

#### 2\. Anchor Point Calculation (Text Grid Side)

For each `{% svg %}` block, the renderer calculates the target pixel coordinate on the text grid based on the `char_index` and `offset_*_qx` attributes.

1.  Find the center of the anchor character's block: `(Character_Block_Center_X, Character_Block_Center_Y)`.
2.  Apply the offsets to find the final anchor point:
      * `Target_X = Character_Block_Center_X + (offset_x_qx * ch_pixel_width)`
      * `Target_Y = Character_Block_Center_Y + (offset_y_qx * line_height_pixel_height)`

#### 3\. SVG Object Transformation (Graphic Side)

The renderer must transform the SVG content to align with the text grid anchor.

1.  **Fetch or Generate SVG**: Load the SVG from the `src` path or generate it from the inline YAML definitions.
2.  **Calculate Bounding Box**: Determine the SVG's bounding box (`min_qx_x`, `min_qx_y`, `width_qx`, `height_qx`) in `qx` units.
3.  **Calculate Internal Anchor**: Find the anchor point within the SVG's own coordinate system using the `svg_anchor_*_qx` attributes.
4.  **Position the SVG**: Create a root `<svg>` element, set its `viewBox` and pixel dimensions, and position it absolutely on the page so that its internal anchor point aligns perfectly with the `(Target_X, Target_Y)` coordinates.

#### 4\. Z-Indexing & Stacking Order

  * **Format Rule**: All SVG elements render on top of the GFM text layer. The stacking order of overlapping SVG objects is determined by their sequence in the source document; later SVGs appear on top of earlier ones.
  * **Editor Behavior**: In a WYSIWYG editor, the last modified object will typically be moved to the end of the document's graphics list, thus appearing on top of the stack.

-----

### Reference Implementation Plan

This outlines the development plan for creating a suite of tools for the QHB format.

#### Step 1: Format Specification (Completed)

Define the `.qhb` format, attributes, and rendering rules in this specification.

#### Step 2: Modular JavaScript Renderer

Create a modular, in-browser renderer.

  * **QHB Parser**: A component to read a `.qhb` string and separate it into frontmatter, a Markdown string, and a list of SVG objects.
  * **Markdown Renderer**: A component to convert the Markdown string into basic HTML.
  * **SVG Renderer**: The core component that implements the **Rendering Specification** to calculate positions and inject SVG elements into the DOM.
  * **Remote File Ingestion**: The renderer will support loading .qhb files from a remote URL. This will be handled via a URL query string (e.g., .../?source=ENCODED_URL). On page load, the application will check for this parameter, decode the URL, fetch the file's content using the fetch() API, and then pass the raw content to the QHB Parser.
  * **Companion Extension (Python)**: An MkDocs plugin that uses the JavaScript renderer to display `.qhb` files within a generated MkDocs site.

#### Step 3: VSCode Extension

Develop a VSCode extension to provide syntax highlighting, a real-time preview panel, and linting for `.qhb` files.

#### Step 4: In-Browser WYSIWYG Editor

Build a graphical editor from composable JavaScript modules.

  * **UI & Layout**:
      * A file navigator for "notebook mode."
      * A fixed-width, wrapping text area to prioritize readability.
  * **Core Features & Interaction Model**:
      * **Pen-First Interaction 🖊️**: The editor will use a drawing-focused interface to feel fast and intuitive.
          * **Primary Input (Left-Click / 1-Finger Tap)**: Always initiates drawing actions, like creating freehand SVG paths.
          * **Secondary Input (Right-Click / 2-Finger Tap)**: Used for all selection and manipulation. This includes placing the text cursor, selecting existing SVG objects, and initiating a block selection.
      * **Eraser-less Deletion 🗑️**: To reduce interface clutter, there is no dedicated eraser tool.
          * On **desktop**, selected objects are deleted using the `Delete` key. `Undo` (`Ctrl+Z`) can be used for recovery.
          * On **mobile**, a small trashcan icon appears when an object is selected, allowing the object to be dragged to it for deletion.
      * **Slash Command & Fuzzy Search**: Use `/` as the primary interface for commands and instant document search.
      * **Block-Based Text Selection**: Using a secondary-click (or two-finger) drag, users can select rectangular `m x n` blocks of characters for intuitive columnar editing.
      * **Dual Locking System**: Provide an **Editing Lock** (`Ctrl+L`) to prevent accidental modification while allowing reflow, and a **Positional Lock** (`Ctrl+Shift+L`) to fix an object's position relative to the page.
      * **Automatic & Seamless Persistence**: All changes are automatically saved to local storage (e.g., IndexedDB), with no manual "save" action required from the user.
      * **Toggle Snapping Modes**: Snap to center of qx, snap to edges of qx, no snapping (Freeform)

#### Step 5: Browser Extension Packaging (Deployment)

Package the entire editor application (HTML, CSS, JS) as a self-contained Web Browser Extension (Manifest V3). This provides a desktop-like, offline-first experience by leveraging the browser's File System Access API and IndexedDB, without the overhead of a runtime like Electron.

-----

### Future Considerations & Stretch Goals

  * **QHB File Transclusion**: Develop a syntax (e.g., `{{ include ./path/to/another.qhb }}`) to embed one QHB file within another.
  * **Advanced Collaboration**: Implement a CRDT-based model for true real-time, multi-author collaboration.
  * **Persistent Undo History**: Extend the editor's data store to save a granular operation history across sessions.
  * **Katex Support**
  * **Pandoc Extension**: Create a Pandoc filter to convert QHB files to other formats like PDF and LaTeX.
  * **Mermaid.js Exporter**: Develop an extension for Mermaid.js that allows diagrams to be exported directly to the Qharbox format.
