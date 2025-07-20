### ## Part 1: Core Data Structures & State

This is the foundation of your application, defining how data and its history are stored in memory.

* [ ] **`StatefulComponent` Class (The "Monad"):**
    * This is the wrapper for every piece of content.
    * **`.value`**: The raw `GfmBlock` or `SvgObject`.
    * **`.history`**: An array of `HistoryEntry` objects, representing the component's private, internal history. This is where inactive branches will be archived.
    * **`.isDirty`**: A boolean flag for efficient re-rendering in the editor.

* [ ] **`HistoryEntry` Object Structure:**
    * This defines a single point in time for a component.
    * **`.state`**: A snapshot of the component's `value`.
    * **`.timestamp`**: The time of the change (`2025-07-20T...`).
    * **`.status`**: A string, either `'active'` or `'inactive'` (for archived redo branches).
    * **`.previousChange`**: A direct reference to the globally previous `HistoryEntry` object, forming the decentralized undo chain.

* [ ] **Raw Data Classes:**
    * `GfmBlock`: A simple class to hold a string of Markdown text.
    * `SvgObject`: A class to hold the parsed data from an `{% svg %}` block (id, attributes, inline definitions).

* [ ] **`QharboxDocument` Class:**
    * The top-level container.
    * **`.frontmatter`**: An object for the YAML frontmatter.
    * **`.content`**: An array of `StatefulComponent` instances.

***
### ## Part 2: The Ingestor (Parser)

This module's job is to read a `.qhb` file and create the in-memory `QharboxDocument`.

* [ ] **Create the `Ingestor` Class:**
    * **`parse(qhbString)` method:**
        * It will scan the document's content, creating new objects whenever it encounters either a **`{% svg %}` block** or a **line starting with `# `**.
        * For each delimited chunk, it will create a `GfmBlock` or `SvgObject`.
        * It will wrap each of these raw data objects in a `StatefulComponent` before adding it to the `QharboxDocument.content` array.

***
### ## Part 3: Global History Management

This is the application-level logic that powers the main undo/redo feature.

* [ ] **Establish Global State Variables:**
    * `let historyHead = null;` // A pointer to the most recent `HistoryEntry`
    * `let redoBuffer = [];`    // An array to hold undone `HistoryEntry` objects

* [ ] **Implement Core History Functions:**
    * **`handleNewChange(changeEntry)`**:
        * Sets the `.previousChange` of the new entry to the current `historyHead`.
        * Updates `historyHead` to point to the `changeEntry`.
        * **Archives** the `redoBuffer` entries back to their source components with an `'inactive'` status, then clears the buffer.
    * **`handleUndo()`**:
        * Takes the entry from `historyHead`.
        * Pushes it onto the `redoBuffer`.
        * Reverts the state of the associated component.
        * Moves `historyHead` to `historyHead.previousChange`.
    * **`handleRedo()`**:
        * Pops an entry from `redoBuffer`.
        * Applies its state to the associated component.
        * Re-links it to the undo chain and updates `historyHead`.

***
### ## Part 4: Renderers & Serializer

These modules handle drawing the document to the screen and writing it back to a file.

* [ ] **Create Renderer Classes (`GfmRenderer`, `SvgRenderer`):**
    * **`render(document, targetElement)`**: Performs the initial full draw of all content.
    * **`update(document, targetElement)` (Future-Proofing)**: A placeholder method that will eventually use the `.isDirty` flag on `StatefulComponent`s to perform efficient partial re-renders.

* [ ] **Create the `Serializer` Class:**
    * **`serialize(qharboxDocument)`**:
        * Iterates through the `QharboxDocument.content` array.
        * For each `StatefulComponent`, it unwraps the `.value` to get the raw data.
        * Formats the raw data back into a valid `.qhb` plaintext string.
