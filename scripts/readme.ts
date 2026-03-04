import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { toolsData } from "../src/config/tools.ts";
import zhCN from "../src/i18n/zh-CN.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const categories = zhCN.categories as Record<string, string>;
 
const toolsI18n = zhCN.tools as Record<string, any>;

let markdownList = "";

for (const [categoryKey, categoryName] of Object.entries(categories)) {
  const tools = toolsData[categoryKey];
  if (!tools || tools.length === 0) continue;

  markdownList += `- ${categoryName}\n`;
  for (const tool of tools) {
    const id = tool.id;
    let title = toolsI18n[id]?.title;
    if (!title) {
      title = tool.title;
    }
    markdownList += `  - [${title}](https://tool.yule.ink${tool.path})\n`;
  }
  markdownList += "\n";
}

const readmePath = path.join(rootDir, "README.md");
const readmeContent = fs.readFileSync(readmePath, "utf-8");

const startTag = "## 工具列表\n\n";
const endTag = "\n### 部署指南";

const startIndex = readmeContent.indexOf(startTag);
const endIndex = readmeContent.indexOf(endTag);

if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
  const newContent =
    readmeContent.slice(0, startIndex + startTag.length) +
    markdownList +
    readmeContent.slice(endIndex);
  fs.writeFileSync(readmePath, newContent, "utf-8");
  console.log("README.md updated successfully!");
} else {
  console.error("Could not find the target sections in README.md");
  process.exit(1);
}
