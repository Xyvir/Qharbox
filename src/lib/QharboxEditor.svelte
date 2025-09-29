<script lang="ts">
  import { onMount } from 'svelte';
  import { EditorView, ViewPlugin } from '@codemirror/view';
  import { basicSetup } from 'codemirror';
  import { EditorState, StateField, RangeSet, RangeValue } from '@codemirror/state';
  import { SVG } from '@svgdotjs/svg.js';
  import { anchorHighlighting } from './codemirror-extensions';
  import { updateQxMarkups } from './store';

  export let qxText: string;
  export let qxMarkups: string;

  let textEditorEl, markupsEditorEl, svgHostEl;
  let textView, markupsView;
  let svgCanvas;

  class AnchorValue extends RangeValue {
    id: string;
    constructor(id: string) {
      super();
      this.id = id;
    }
  }

  const anchorTrackingField = StateField.define<RangeSet<AnchorValue>>({
    create(state) {
      const ranges = [];
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(qxMarkups, "image/svg+xml");
      const groups = svgDoc.querySelectorAll('g[id][anchor-line][anchor-char]');

      const lineMap = [];
      for (let i = 1; i <= state.doc.lines; i++) {
        if (state.doc.line(i).length > 0) {
          lineMap.push(i);
        }
      }

      groups.forEach(group => {
        const id = group.getAttribute('id');
        const markupLine = parseInt(group.getAttribute('anchor-line'), 10);
        const char = parseInt(group.getAttribute('anchor-char'), 10);
        const codeMirrorLine = lineMap[markupLine - 1];

        if (id && !isNaN(codeMirrorLine) && !isNaN(char)) {
          const line = state.doc.line(codeMirrorLine);
          const pos = line.from + char - 1;
          if (pos >= line.from && pos <= line.to) {
            ranges.push(new AnchorValue(id).range(pos));
          }
        }
      });

      return RangeSet.of(ranges);
    },
    update(value, tr) {
      return value.map(tr.changes);
    }
  });

  const rightClickToMoveCursor = ViewPlugin.fromClass(class {
    constructor(view) {
      this.view = view;
      this.dom = view.dom;
      this.dom.addEventListener("mousedown", this.mousedown.bind(this));
      this.dom.addEventListener("contextmenu", e => e.preventDefault());
    }

    mousedown(event) {
      if (event.button === 2) { // right click
        const pos = this.view.posAtCoords({ x: event.clientX, y: event.clientY });
        if (pos !== null) {
          this.view.dispatch({ selection: { anchor: pos } });
        }
      }
      if (event.button === 0) { // left click
        event.preventDefault();
      }
    }

    destroy() {
      this.dom.removeEventListener("mousedown", this.mousedown.bind(this));
    }
  });

  onMount(() => {
    if (textEditorEl) {
      textView = new EditorView({
        state: EditorState.create({
          doc: qxText,
          extensions: [
            basicSetup,
            anchorHighlighting(() => qxMarkups),
            anchorTrackingField,
            rightClickToMoveCursor,
            EditorView.updateListener.of(update => {
              if (update.docChanged) {
                const newAnchorSet = update.state.field(anchorTrackingField);
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(qxMarkups, "image/svg+xml");
                let markupsChanged = false;

                const newPositions = new Map<string, { line: number, char: number }>();
                const lineMap = [];
                for (let i = 1; i <= update.state.doc.lines; i++) {
                  if (update.state.doc.line(i).length > 0) {
                    lineMap.push(i);
                  }
                }
                const reverseLineMap = new Map(lineMap.map((lineNum, index) => [lineNum, index + 1]));

                newAnchorSet.between(0, update.state.doc.length, (from, to, value) => {
                  const line = update.state.doc.lineAt(from);
                  const markupLine = reverseLineMap.get(line.number);
                  if (markupLine) {
                    const char = from - line.from + 1;
                    newPositions.set(value.id, { line: markupLine, char });
                  }
                });

                newPositions.forEach(({ line, char }, id) => {
                  const group = svgDoc.querySelector(`#${id}`);
                  if (group) {
                    const oldLine = group.getAttribute('anchor-line');
                    const oldChar = group.getAttribute('anchor-char');
                    if (oldLine !== line.toString() || oldChar !== char.toString()) {
                      group.setAttribute('anchor-line', line.toString());
                      group.setAttribute('anchor-char', char.toString());
                      markupsChanged = true;
                    }
                  }
                });

                if (markupsChanged) {
                  const serializer = new XMLSerializer();
                  const newMarkups = serializer.serializeToString(svgDoc);
                  updateQxMarkups(newMarkups);
                }
              }

              if (update.docChanged || update.geometryChanged) {
                renderSvg();
              }
            })
          ],
        }),
        parent: textEditorEl,
      });
    }

    if (markupsEditorEl) {
      markupsView = new EditorView({
        state: EditorState.create({
          doc: qxMarkups,
          extensions: [basicSetup],
        }),
        parent: markupsEditorEl,
      });
    }

    svgCanvas = SVG().addTo(svgHostEl).size('100%', '100%');
    renderSvg();
  });

  function renderSvg() {
    if (!svgCanvas || !textView || !textEditorEl) return;

    svgCanvas.clear();

    const editorRect = textEditorEl.getBoundingClientRect();

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(qxMarkups, "image/svg+xml");

    const defs = svgDoc.querySelector('defs');
    if (defs) {
      svgCanvas.defs().svg(defs.innerHTML);
    }

    const groups = svgDoc.querySelectorAll('g[id][anchor-line][anchor-char]');

    const lineMap = [];
    for (let i = 1; i <= textView.state.doc.lines; i++) {
      if (textView.state.doc.line(i).length > 0) {
        lineMap.push(i);
      }
    }

    groups.forEach(group => {
      const markupLine = parseInt(group.getAttribute('anchor-line'), 10);
      const char = parseInt(group.getAttribute('anchor-char'), 10);
      const anchorX = parseFloat(group.getAttribute('anchor-x') || '0');
      const anchorY = parseFloat(group.getAttribute('anchor-y') || '0');

      const codeMirrorLine = lineMap[markupLine - 1];
      if (codeMirrorLine === undefined) return;

      const line = textView.state.doc.line(codeMirrorLine);
      const pos = line.from + char - 1;
      const coords = textView.coordsAtPos(pos);

      if (coords) {
        const charWidth = coords.right - coords.left;
        const charHeight = coords.bottom - coords.top;
        const textAnchorX = coords.left - editorRect.left + (charWidth / 2) + 4;
        const textAnchorY = coords.top - editorRect.top + (charHeight / 2);

        const translateX = textAnchorX - anchorX;
        const translateY = textAnchorY - anchorY;

        const importedGroup = svgCanvas.group();
        const childNodes = Array.from(group.childNodes).filter(node => node.nodeName.toLowerCase() !== 'defs');
        childNodes.forEach(child => {
            importedGroup.svg(child.outerHTML);
        });
        importedGroup.transform({ translateX, translateY });
      }
    });
  }

  $: if (qxMarkups && textView) {
    // This reactive statement is tricky. When qxMarkups is updated from the listener,
    // it causes a re-render, which is good. However, we need to be careful about
    // how we trigger renderSvg(). The updateListener already calls it.
    // A direct call here might be redundant or cause issues.
    // For now, we rely on the update listener to handle re-rendering on doc changes.
    // But we still need to re-render if the markups are changed externally.
    renderSvg();
  }

</script>

<div class="qx-text-container" style="position: relative;">
  <div bind:this={textEditorEl}></div>
  <div bind:this={svgHostEl} style="position: absolute; top: 0; left: 0; pointer-events: none; width: 100%; height: 100%;"></div>
</div>

<div>
  <h3>qx-markups (collapsible later)</h3>
  <div bind:this={markupsEditorEl}></div>
</div>

<style>
  :global(.cm-editor) {
    height: auto;
  }
</style>