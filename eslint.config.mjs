import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default tseslint.config(
  {
    // 忽略特定目录
    ignores: [
      ".old_project",
      "dist",
      "node_modules",
      "pnpm-lock.yaml",
      "package-lock.json",
      "package.json",
      "DEV-DOCS",
      "*.d.ts",
      ".eslintcache",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      // 开启 Prettier 冲突检查
      "prettier/prettier": "error",

      // 自定义你的规矩
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",

      // TS 相关
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  // 务必把 prettier 配置放在最后，用来覆盖掉冲突的规则
  prettierConfig,
);
