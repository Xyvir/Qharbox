<script lang="ts">
  import { onMount } from 'svelte';
  import QharboxEditor from './lib/QharboxEditor.svelte';
  import { qharboxData, ingestMarkdown } from './lib/store';

  onMount(async () => {
    const response = await fetch('/test.md');
    const markdown = await response.text();
    ingestMarkdown(markdown);
  });
</script>

<main>
  <h1>Qharbox</h1>
  <div class="editor-container">
    {#if $qharboxData.qxText}
      <QharboxEditor qxText={$qharboxData.qxText} qxMarkups={$qharboxData.qxMarkups} />
    {:else}
      <p>Loading test.md...</p>
    {/if}
  </div>
</main>

<style>
  main {
    padding: 1em;
  }

  .editor-container {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 1em;
  }
</style>
