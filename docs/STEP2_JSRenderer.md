### \#\# Recommended File Structure (Viewer Mode)

```
/qharbox-renderer
├── /src
│   ├── /core                # Core data models
│   │   └── QharboxDocument.js   # Can also contain GfmBlock and SvgObject
│   │
│   ├── /io                  # Input/Output
│   │   ├── Ingestor.js
│   │   └── Serializer.js
│   │
│   ├── /rendering           # Visual output logic
│   │   ├── GfmRenderer.js       # (Initially a wrapper for a 3rd party lib)
│   │   └── SvgRenderer.js
│   │
│   └── app.js                 # The Orchestrator
│
└── index.html               # Test harness
```

-----

### \#\# Step 2 TODO List: Modular JavaScript Renderer (Viewer Mode)

#### Part 1: Core Data Structures (`src/core/`)

  * [ ] **Define Raw Data Classes**: Create the plain JavaScript classes or objects that will hold the parsed document data.
      * **`QharboxDocument`**: The top-level container with properties for `.frontmatter`, `.definitions` (to hold `svgdef` data), and `.content`.
      * **`GfmBlock`**: A simple object to hold a string of Markdown text.
      * **`SvgObject`**: An object to hold the data from a placed `{% svg %}` block, including its `id`, positioning attributes, and a `.use` property for instancing.

-----

#### Part 2: The Ingestor & Serializer (`src/io/`)

  * [ ] **Build the `Ingestor`**: This module will read a raw `.qhb` string.

      * Its `parse()` method must distinguish between `{% svgdef %}` blocks (which populate the `.definitions` map) and placed content.
      * It must correctly split the GFM content on both `{% svg %}` blocks and lines that start with ` #  `.
      * For Viewer Mode, it will populate the `QharboxDocument.content` array with the **raw `GfmBlock` and `SvgObject` instances**.

  * [ ] **Build the `Serializer`**: This module writes the in-memory `QharboxDocument` back to a string.

      * Its `serialize()` method will need to write out the `definitions` as `{% svgdef %}` blocks, followed by the formatted content.

-----

#### Part 3: The Renderers (`src/rendering/`)

  * [ ] **Integrate a Third-Party GFM Library**: For the initial version, use a robust, existing library like `marked.js` to handle the Markdown-to-HTML conversion. The `GfmRenderer.js` file will initially just be a simple wrapper around this library.

      * *Note: A bespoke GFM renderer tailored for QHB can be developed later to replace this.*

  * [ ] **Build the Custom `SvgRenderer`**: This is the core custom rendering logic and the primary focus.

      * It must be able to dynamically calculate the pixel dimensions of a character box from the DOM.
      * It needs to calculate the absolute pixel position for each `SvgObject` based on its anchor.
      * It must handle instancing by checking the `.use` property on an `SvgObject` and looking up the corresponding visual data from the `QharboxDocument.definitions` map.

-----

#### Part 4: The Orchestrator (`src/app.js`)

  * [ ] **Implement the Viewer Orchestrator**: This top-level script brings everything together for read-only display.
      * It will initialize the `Ingestor` and `Renderers`.
      * It will manage the main process: fetching the `.qhb` file content, passing it to the `Ingestor` to get a `QharboxDocument`, and then passing that document to the `Renderers` to display it.

-----

### \#\# Future Considerations (For Step 4)

  * **Transient Editor Mode**: Will involve adding the `editor/mutations.js` module (`splitBlock`, `mergeBlocks`) to allow structural edits on the raw data objects.
  * **Persistent Editor Mode**: This will be the full implementation, introducing the `StatefulComponent` wrappers, the `editor/history.js` module for undo/redo, the `DocumentSnapshot` for auto-save, and the logic to save history to a companion `.qhb.h` file.
