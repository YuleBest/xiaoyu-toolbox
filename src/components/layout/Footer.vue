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
          <span class="text-[14px] font-semibold tracking-tight text-foreground"
            >小于工具箱</span
          >
          <span
            class="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50 font-medium"
            >NEXT</span
          >
        </div>
        <p class="text-[12px] font-normal opacity-60">
          © 2026 YuleBest. All rights reserved.
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
          邮箱
        </a>
        <a
          href="https://blog.yule.ink"
          target="_blank"
          class="flex items-center gap-1.5 text-[12.5px] font-medium hover:text-blue-500 transition-colors group"
        >
          <Globe class="h-4 w-4 opacity-70 group-hover:opacity-100" />
          博客
        </a>
      </div>
    </div>

    <!-- Disclaimer -->
    <div class="mt-8 text-center md:text-left">
      <p class="text-[11px] font-normal opacity-40 leading-relaxed max-w-2xl">
        本站提供的所有工具仅供学习和研究使用。部分资源来源于网络。
        <br class="hidden md:block" />
      </p>
    </div>
  </footer>
</template>
