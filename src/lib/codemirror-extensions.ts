import { ViewPlugin, Decoration } from "@codemirror/view";
import type { DecorationSet, ViewUpdate, EditorView } from "@codemirror/view";

function getAnchorDecorations(qxMarkups: string, view: EditorView): DecorationSet {
    const decorations = [];
    try {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(qxMarkups, "image/svg+xml");
        const groups = svgDoc.querySelectorAll('g[anchor-line][anchor-char]');

        const lineMap = [];
        for (let i = 1; i <= view.state.doc.lines; i++) {
            if (view.state.doc.line(i).length > 0) {
                lineMap.push(i);
            }
        }

        groups.forEach(group => {
            const markupLine = parseInt(group.getAttribute('anchor-line'), 10);
            const char = parseInt(group.getAttribute('anchor-char'), 10);

            const codeMirrorLine = lineMap[markupLine - 1];

            if (!isNaN(codeMirrorLine) && !isNaN(char) && codeMirrorLine > 0 && codeMirrorLine <= view.state.doc.lines) {
                const lineInfo = view.state.doc.line(codeMirrorLine);
                const from = lineInfo.from + char - 1;
                const to = from + 1;

                if (from >= lineInfo.from && to <= lineInfo.to) {
                    decorations.push(
                        Decoration.mark({
                            class: "qharbox-anchor-char"
                        }).range(from, to)
                    );
                }
            }
        });
    } catch (e) {
        console.error("Error parsing SVG for anchor highlighting:", e);
    }

    return Decoration.set(decorations);
}

export const anchorHighlighting = (getQxMarkups: () => string) => {
    return ViewPlugin.fromClass(class {
        decorations: DecorationSet;

        constructor(view: EditorView) {
            this.decorations = getAnchorDecorations(getQxMarkups(), view);
        }

        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged) {
                this.decorations = getAnchorDecorations(getQxMarkups(), update.view);
            }
        }
    }, {
        decorations: v => v.decorations
    });
};