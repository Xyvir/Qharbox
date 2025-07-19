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

Direct embedding of raster images (e.g., PNG, JPEG) is an **intentional omission** to maintain the format's text-based, resolution-independent ethos. The recommended workaround is to convert raster image to a simple SVG image using a tool like Inkscape or similair, and then embed the new SVG image.

-----

### 4. Rendering Rules

The Qharbox renderer must adhere to these rules for consistent visual output.

#### 4.1 Monospace Grid Calculation
The renderer must first dynamically calculate the precise pixel dimensions of:
* **`ch_pixel_width`**: The width of a single character in the rendered monospace font.
* **`line_height_pixel_height`**: The height of a single line of text in the rendered monospace font.

#### 4.2 Anchor Point Calculation (Text Grid Side)
For each `{% svg %}` block, the renderer must find the target pixel coordinate on the text grid.

1.  **Identify Anchor Character's Center (Pixel X, Y)**:
    * Get the `getBoundingClientRect()` of the HTML element for the line of text preceding the SVG block.
    * `Character_Block_Start_X = anchorLineRect.left + (char_index * ch_pixel_width)`
    * `Character_Block_Center_X = Character_Block_Start_X + (ch_pixel_width / 2)`
    * `Character_Block_Center_Y = anchorLineRect.top + (line_height_pixel_height / 2)`
2.  **Calculate Final Text Grid Anchor Point (Target_X, Target_Y)**:
    * `Target_X = Character_Block_Center_X + (offset_x_qx * ch_pixel_width)`
    * `Target_Y = Character_Block_Center_Y + (offset_y_qx * line_height_pixel_height)`

#### 4.3 SVG Object Transformation (Graphic Side)
The renderer must transform the SVG content to align with the text grid anchor.

1.  **Fetch or Generate SVG Content**: If a `src` attribute is present, fetch the external SVG file. Otherwise, generate the SVG XML from the inline YAML definitions.
2.  **Calculate SVG Bounding Box**: The renderer must determine the overall bounding box of the SVG content (`min_qx_x`, `min_qx_y`, `width_qx`, `height_qx`) in `qx` units. This will likely involve temporarily rendering the content in a detached element and using the `getBBox()` method.
3.  **Calculate SVG Internal Anchor Point**: Find the anchor's coordinates (`SVG_Internal_Anchor_X`, `SVG_Internal_Anchor_Y`) within the SVG's own `qx` coordinate system.
    * `SVG_Internal_Anchor_X = (min_qx_x + width_qx / 2) + (svg_anchor_x_qx * width_qx)`
    * `SVG_Internal_Anchor_Y = (min_qx_y + height_qx / 2) + (svg_anchor_y_qx * height_qx)`
4.  **Generate and Position Root `<svg>` Element**:
    * Create a parent `<svg>` element.
    * Set its `viewBox` attribute to match the calculated bounding box: `viewBox="min_qx_x min_qx_y width_qx height_qx"`.
    * Set its pixel `width` and `height` based on the grid dimensions:
        * `width = width_qx * ch_pixel_width`
        * `height = height_qx * line_height_pixel_height`
    * Position it absolutely by calculating the `top` and `left` CSS properties required to place the `SVG_Internal_Anchor_Point` precisely at the `Target` coordinates:
        * `Final_SVG_Left = Target_X - (SVG_Internal_Anchor_X * ch_pixel_width)`
        * `Final_SVG_Top = Target_Y - (SVG_Internal_Anchor_Y * line_height_pixel_height)`

#### 4.4 Z-Indexing & Stacking Order
* All SVG elements render on top of the GFM text (`z-index` of SVG layer is higher).
* The stacking order of overlapping SVG objects is determined by their sequence in the source document; later SVGs appear on top of earlier ones.
* In the editor, generally the last modified object will be automatically moved to the top of the stack.

-----

### 5\. Development Plan

#### 5.1 Step 1: Format Specification (Completed)

Define the `.qhb` format, attributes, and rendering rules in this specification.

#### 5.2 Step 2: In-Browser Modular JavaScript Renderer

1.  **The QHB Parser (Orchestrator)**

      * **Input**: The raw text content of a `.qhb` file.
      * **Job**: This is the top-level component. It doesn't render anything. Its only job is to read the raw string and separate it into logical pieces:
          * The YAML frontmatter data.
          * The raw Markdown string from the `content:` block.
          * A list of all SVG objects, including their attributes (`id`, `char_index`, `src`, etc.) and any inline YAML definitions.
      * **Output**: It passes the Markdown string to the Markdown Renderer and the list of SVG objects to the SVG Renderer.

2.  **The Markdown Renderer**

      * **Input**: The raw Markdown string.
      * **Job**: This component is responsible for turning the Markdown text into basic HTML elements (like `<p>`, `<h1>`, `<code>`, etc.). Its primary purpose is to get the text onto the page so that the SVG Renderer can then measure character positions.

3.  **The SVG Renderer**

      * **Input**: The list of SVG objects provided by the Parser.
      * **Job**: This is the most complex component. It performs all the calculations described in **Section 4: Rendering Rules**. For each SVG object, it finds its anchor character in the rendered HTML, calculates the precise pixel position, and injects the final, correctly-sized and positioned `<svg>` element into the DOM.

-----

##### Renderer Data Flow

```
Raw .qhb file string
       │
       ▼
┌────────────────────┐
│ 1. QHB Parser      │
└────────────────────┘
       ├───────────────┬──────────────┐
       │               │              │
       ▼               ▼              ▼
┌──────────────┐  ┌────────────┐   ┌────────────┐
│ Frontmatter  │  │ Markdown   │   │ SVG Object │
│ Data         │  │ String     │   │ List       │
└──────────────┘  └────────────┘   └────────────┘
       │ (optional)    │              │
       │               │              │
       └· · · · · ·· ·>│              │
                       ▼              ▼
               ┌──────────────┐  ┌────────────┐
               │ 2. Markdown  │  │ 3. SVG     │
               │    Renderer  │  │    Renderer│
               └──────────────┘  └────────────┘
                       │              │
                       ▼              ▼
               ┌─────────────────────────────┐
               │ Final Rendered Page         │
               │ (HTML from Markdown +       │
               │  SVG elements overlaid)     │
               └─────────────────────────────┘
```


* **2b. MkDocs Companion Extension (Python)**: An MkDocs plugin to preprocess `.qhb` files, enabling them to be rendered within a generated MkDocs site using the JavaScript renderer.

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
      * **Dual Locking System**: To provide granular control, the editor will support two distinct types of object locks, likely toggled via a context menu or hotkeys:
        * **Editing Lock** (`Ctrl+L`): This primary lock prevents accidental dragging, resizing, or editing of an object's properties. The object remains "glued" to its character anchor and continues to reflow perfectly as the surrounding text is edited.
        * **Positional Lock** (`Ctrl+Shift+L`): This advanced lock fixes the object's position relative to the page canvas itself, making it immune to text reflow. This is useful for elements like logos or fixed background diagrams. When applied, the object's position is calculated once and then remains static until unlocked.
You are absolutely right. My apologies, in the process of making the other edits, I mistakenly removed the section about the browser extension. That's a key part of the deployment plan.

##### Browser Extension Packaging (Deployment Goal)

* **Goal**: Provide an easy-to-install, self-contained application that leverages the user's existing browser environment for local-first use.
* **Mechanism**: After developing the modular JavaScript components and compiling them via a bundler (e.g., Webpack, Rollup), the entire application (HTML, CSS, JS) will be packaged as a **Web Browser Extension** (e.g., Manifest V3 for Chrome/Firefox).
* **Deployment**:
    * The extension will typically include a "popup" or "action" (when you click the extension icon) that opens a dedicated, self-contained full-page tab (`chrome.tabs.create` to an `index.html` file within the extension). This full-page tab *is* the Qharbox editor.
    * This packaging allows for full offline functionality and access to powerful browser APIs (like File System Access and IndexedDB) with minimal overhead, directly utilizing the user's installed browser. It provides a "desktop-like" application experience without the need for a heavy runtime like Electron.
    * Static live versions of the editor can still be hosted separately on web servers (e.g., GitHub Pages) for online access, serving the same core JavaScript components.

-----

### 6\. Future Considerations & Stretch Goals

  * **QHB File Transclusion**: Develop a custom syntax (e.g., `{{ include ./path/to/another.qhb }}`) to allow for the true embedding and rendering of one Qharbox file within another.
  * **Persistent Undo History**: Extend the IndexedDB store to save a granular operation history across sessions.
  * **Enhanced QFV (Qharbox-Flavored Vectors) Primitives**: Introduce higher-level primitives that compile to complex SVG (e.g., smart connectors).
  * **Mermaid.js Exporter**: Develop an extension for Mermaid.js that allows diagrams to be exported to the Qharbox format.
  * **Pandoc Extension**: A Pandoc filter to convert QHB files to other formats (PDF, LaTeX, etc.).
