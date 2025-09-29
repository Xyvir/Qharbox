<script lang="ts">
  import { onMount } from 'svelte';
  import { EditorView, ViewPlugin } from '@codemirror/view';
  import { basicSetup } from 'codemirror';
  import { EditorState } from '@codemirror/state';
  import { SVG } from '@svgdotjs/svg.js';
  import { anchorHighlighting } from './codemirror-extensions';

  export let qxText: string;
  export let qxMarkups: string;

  let textEditorEl, markupsEditorEl, svgHostEl;
  let textView, markupsView;
  let svgCanvas;

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
            rightClickToMoveCursor
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

    const groups = svgDoc.querySelectorAll('g[anchor-line][anchor-char]');

    // Create a map from non-empty line numbers to CodeMirror line numbers
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

  $: if (qxMarkups && textView) renderSvg();

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