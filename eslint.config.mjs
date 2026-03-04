import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'

// import js from "@eslint/js";
// import globals from "globals";
// import tseslint from "typescript-eslint";
// import prettierConfig from "eslint-config-prettier";
// import prettierPlugin from "eslint-plugin-prettier";
// // 引入 Vue 插件和解析器
// import pluginVue from "eslint-plugin-vue";
// import vueParser from "vue-eslint-parser";

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  skipFormatting,
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
)

// export default tseslint.config(
//   {
//     ignores: [
//       ".old_project",
//       "dist",
//       "node_modules",
//       "pnpm-lock.yaml",
//       "package-lock.json",
//       "package.json",
//       "docs",
//       "*.d.ts",
//       ".eslintcache",
//       "src/components/ui",
//       "public",
//     ],
//   },
//   js.configs.recommended,
//   ...tseslint.configs.recommended,
//   // 注入 Vue 推荐配置
//   ...pluginVue.configs["flat/recommended"],
//   {
//     files: ["**/*.ts", "**/*.tsx", "**/*.vue"],
//     languageOptions: {
//       ecmaVersion: 2022,
//       sourceType: "module",
//       // 用 vue-parser 才能看懂 SFC
//       parser: vueParser,
//       parserOptions: {
//         // 在 Vue 文件里，script 标签部分依然交给 TS 解析
//         parser: tseslint.parser,
//         extraFileExtensions: [".vue"],
//         sourceType: "module",
//       },
//       globals: {
//         ...globals.browser,
//         ...globals.node,
//       },
//     },
//     plugins: {
//       prettier: prettierPlugin,
//     },
//     rules: {
//       "prettier/prettier": "error",
//       // TS 相关
//       "@typescript-eslint/no-unused-vars": [
//         "warn",
//         {
//           argsIgnorePattern: "^_",
//           varsIgnorePattern: "^_",
//           caughtErrorsIgnorePattern: "^_",
//         },
//       ],
//       "@typescript-eslint/no-explicit-any": "warn",
//       "vue/multi-word-component-names": "off",
//       "vue/no-v-html": "off",
//     },
//   },
//   prettierConfig,
// );
