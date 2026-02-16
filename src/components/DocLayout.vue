<template>
  <div
    class="doc-content prose dark:prose-invert max-w-none prose-neutral prose-headings:font-bold prose-h1:text-center prose-a:text-blue-500 hover:prose-a:text-blue-600 prose-a:no-underline prose-img:rounded-xl prose-pre:bg-muted/50 prose-pre:text-foreground prose-pre:border prose-pre:border-border prose-pre:rounded-xl"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
// This component wraps Markdown content
</script>

<style>
@reference "../style.css";

/* Scoped styles applied via class selector to avoid specificity wars with Tailwind prose */
.doc-content :where(code):not(:where(pre, pre *)) {
  @apply bg-muted/80 px-1.5 py-0.5 rounded-md mx-0.5 font-mono text-sm before:content-none after:content-none font-normal;
}
</style>
