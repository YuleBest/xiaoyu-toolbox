<template>
  <div class="container mx-auto px-4 py-8">
    <div
      class="doc-content prose dark:prose-invert max-w-none prose-neutral prose-headings:font-bold prose-h1:text-center prose-a:text-blue-500 hover:prose-a:text-blue-600 prose-a:no-underline prose-img:rounded-xl prose-pre:bg-muted/50 prose-pre:text-foreground prose-pre:border prose-pre:border-border prose-pre:rounded-xl mx-auto"
    >
      <h1>关于本站</h1>

      <p>
        <strong>小于工具箱</strong>
        是一个在线工具集合，旨在为开发者和日常用户提供高效、便捷的实用工具。
      </p>

      <p>
        本站由
        <strong
          ><a href="https://github.com/YuleBest" target="_blank"
            >Yule</a
          ></strong
        >
        开发维护，项目源码托管于 GitHub。
      </p>

      <h2>技术栈</h2>

      <p>本站基于以下开源技术构建：</p>

      <ul>
        <li>
          <strong>前端框架</strong>:
          <a href="https://vuejs.org/" target="_blank">Vue 3</a> +
          <a href="https://vitejs.dev/" target="_blank">Vite</a>
        </li>
        <li>
          <strong>UI 框架</strong>:
          <a href="https://github.com/shadcn-vue/shadcn-vue" target="_blank"
            >Shadcn-Vue</a
          >
        </li>
        <li>
          <strong>图标库</strong>:
          <a href="https://lucide.dev/" target="_blank">Lucide Vue Next</a>
        </li>
      </ul>

      <h2>开源协议</h2>

      <p>
        本项目遵循 <strong>MIT 协议</strong> 开源。欢迎提交 Issue 或 Pull
        Request 来帮助改进这个项目！
      </p>

      <ul>
        <li>
          <a href="https://github.com/YuleBest/xiaoyu-toolbox" target="_blank"
            >GitHub 仓库</a
          >
        </li>
        <li>
          <a
            href="https://github.com/YuleBest/xiaoyu-toolbox/issues"
            target="_blank"
            >提交反馈</a
          >
        </li>
      </ul>

      <h2>联系作者</h2>

      <p>如有任何问题或建议，欢迎联系我：</p>

      <ul>
        <li>
          <strong>Email</strong>:
          <a href="mailto:yule-best@outlook.com">yule-best@outlook.com</a>
        </li>
        <li>
          <strong>GitHub</strong>:
          <a href="https://github.com/YuleBest" target="_blank">@YuleBest</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<style>
@reference "../style.css";

/* Scoped styles applied via class selector to avoid specificity wars with Tailwind prose */
.doc-content :where(code):not(:where(pre, pre *)) {
  @apply bg-muted/80 px-1.5 py-0.5 rounded-md mx-0.5 font-mono text-sm before:content-none after:content-none font-normal;
}
</style>
