import { writable } from 'svelte/store';

export interface QharboxData {
  qxText: string;
  qxMarkups: string;
}

export const qharboxData = writable<QharboxData>({
  qxText: '',
  qxMarkups: '',
});

export function ingestMarkdown(markdown: string) {
  const qxTextBlockRegex = /```qx-text\n([\s\S]*?)```/;
  const qxMarkupsBlockRegex = /```qx-markups\n([\s\S]*?)```/;

  const qxTextMatch = markdown.match(qxTextBlockRegex);
  const qxMarkupsMatch = markdown.match(qxMarkupsBlockRegex);

  const qxText = qxTextMatch ? qxTextMatch[1].trim() : '';
  const qxMarkups = qxMarkupsMatch ? qxMarkupsMatch[1].trim() : '';

  qharboxData.set({ qxText, qxMarkups });
}
