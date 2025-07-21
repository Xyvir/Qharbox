### \#\# Recommended File Structure

```
/qharbox-renderer
├── /src
│   ├── /core                # Core data models and state wrappers
│   │   ├── DocumentSnapshot.js
│   │   ├── QharboxDocument.js
│   │   ├── StatefulComponent.js
│   │   └── ...                # (GfmBlock, SvgObject, etc.)
│   │
│   ├── /editor              # Functions for document manipulation & history
│   │   ├── mutations.js         # (splitBlock, mergeBlocks)
│   │   └── history.js           # (handleUndo, handleRedo, handleNewChange)
│   │
│   ├── /io                  # Input/Output - Parsing and Saving
│   │   ├── Ingestor.js
│   │   └── Serializer.js
│   │
│   ├── /rendering           # Visual output logic
│   │   ├── GfmRenderer.js
│   │   └── SvgRenderer.js
│   │
│   └── app.js                 # The Orchestrator - Main application logic
│
└── index.html               # Test harness to run the application
```

-----

### \#\# Final Project TODO List

#### Part 1: Core Data Structures & State (`src/core/`)

  * [ ] **`DocumentSnapshot.js`**: Defines the top-level state wrapper for versioning and recovery.

      * **`.document`**: An instance of the `QharboxDocument` class.
      * **`.metadata`**: An object containing data about the snapshot, e.g., `{ timestamp: '2025-07-20T19:07:00.000Z', type: 'auto-save' }`.

  * [ ] **`QharboxDocument.js`**: Defines the class representing the raw document content.

      * **`.frontmatter`**: An object for the key-value pairs from the YAML frontmatter.
      * **`.definitions`**: A `Map` where keys are definition IDs (e.g., `'my_arrow'`) and values are the parsed SVG shape data from `{% svgdef %}` blocks.
      * **`.content`**: An array holding the ordered sequence of `StatefulComponent` instances.

  * [ ] **`StatefulComponent.js`**: Defines the "monad" wrapper for every individual piece of content.

      * **`.value`**: A reference to an instance of `GfmBlock` or `SvgObject`.
      * **`.history`**: An array of `HistoryEntry` objects for the component's private, internal history.
      * **`.purgeHistory()`**: A method that sets the `.status` of all its history entries to `'inactive'`.

  * [ ] **Component Data Classes (`GfmBlock.js`, `SvgObject.js`):**

      * **`GfmBlock`**: Implements the private `#internalState` (string or array) and the public `get value()` to handle non-destructive merging.
      * **`SvgObject`**: Holds data from an `{% svg %}` block, including the `use: string | null` property for instancing.

  * [ ] **`HistoryEntry.js` (Object Structure):** Defines the structure for a single undo/redo-able change.

      * **`.state`**: A snapshot of a component's raw value.
      * **`.timestamp`**: A `Date` object or ISO string of when the change occurred.
      * **`.status`**: `'active'` or `'inactive'`.
      * **`.previousChange`**: The reference to the globally previous `HistoryEntry`, forming the undo chain.

#### Part 2: The Ingestor & Serializer (`src/io/`)

  * [ ] **`Ingestor.js`**: Reads a `.qhb` string and builds the initial `DocumentSnapshot`.

      * Its `parse()` method will create a `QharboxDocument`, populate it by parsing `svgdef` blocks and splitting GFM content on headers/SVGs, and then wrap the final document in a `DocumentSnapshot`.

  * [ ] **`Serializer.js`**: Writes an in-memory `DocumentSnapshot` back to a `.qhb` string.

      * Its `serialize()` method will unwrap the `.document` from the snapshot and correctly format the `.definitions` and `.content` into plaintext.

#### Part 3: Editor & History Logic (`src/editor/`)

  * [ ] **`mutations.js`**: Implements functions that change the document structure.

      * **`splitBlock()`** and **`mergeBlocks()`** for `GfmBlock` objects.
      * Logic to update all instances when an **`svgdef`** is edited.

  * [ ] **`history.js`**: Implements the global undo/redo logic.

      * **`handleNewChange()`**: Includes archiving the `redoBuffer`.
      * **`handleUndo()`** and **`handleRedo()`**.

#### Part 4: The Renderers (`src/rendering/`)

  * [ ] **`GfmRenderer.js` & `SvgRenderer.js`**:
      * The `SvgRenderer` must handle the `.use` property on `SvgObject`s.
      * Include placeholder `update()` methods for future partial-rendering optimizations.

#### Part 5: The Orchestrator (`src/app.js`)

  * [ ] **Implement the Orchestrator:** This is the main controller tying everything together.
      * **Initialize** all modules.
      * **Hold Global State**: Manage `historyHead`, `redoBuffer`, and the "current" working `DocumentSnapshot`.
      * **Manage Snapshots**: Maintain a list of historical snapshots. Implement a `createSnapshot()` utility and call it periodically for auto-saving.
      * **Wire UI Events**: Connect user actions to the appropriate functions from `editor/history.js` and `editor/mutations.js`.
      * **Manage Process Flow**: Control the main application loop of loading data, parsing, and rendering.
