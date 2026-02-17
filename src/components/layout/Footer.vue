<script setup lang="ts">
import { Github, Mail, Globe } from "lucide-vue-next";
</script>

<template>
  <footer class="mt-20 pb-12 pt-8 border-t border-muted/30">
    <div
      class="flex flex-col md:flex-row items-center justify-between gap-6 px-1 text-muted-foreground"
    >
      <!-- Brand & Copy -->
      <div class="flex flex-col items-center md:items-start gap-1">
        <div class="flex items-center gap-2">
          <span
            class="text-[14px] font-semibold tracking-tight text-foreground"
            >{{ $t("common.appName") }}</span
          >
        </div>
        <p class="opacity-60">
          {{ $t("footer.copyright") }}
        </p>
      </div>

      <!-- Links -->
      <div class="flex items-center gap-5">
        <a
          href="https://github.com/YuleBest/xiaoyu-toolbox-next"
          target="_blank"
          class="flex items-center gap-1.5 text-[12.5px] font-medium hover:text-blue-500 transition-colors group"
        >
          <Github class="h-4 w-4 opacity-70 group-hover:opacity-100" />
          GitHub
        </a>
        <a
          href="mailto:yule-best@outlook.com"
          class="flex items-center gap-1.5 text-[12.5px] font-medium hover:text-blue-500 transition-colors group"
        >
          <Mail class="h-4 w-4 opacity-70 group-hover:opacity-100" />
          {{ $t("footer.email") }}
        </a>
        <a
          href="https://blog.yule.ink"
          target="_blank"
          class="flex items-center gap-1.5 text-[12.5px] font-medium hover:text-blue-500 transition-colors group"
        >
          <Globe class="h-4 w-4 opacity-70 group-hover:opacity-100" />
          {{ $t("footer.blog") }}
        </a>
      </div>
    </div>

    <!-- Disclaimer -->
    <div class="mt-8 text-center md:text-left">
      <p class="text-[11px] opacity-40 max-w-2xl">
        {{ $t("footer.disclaimer") }}
        <br class="hidden md:block" />
      </p>
    </div>
  </footer>
</template>
