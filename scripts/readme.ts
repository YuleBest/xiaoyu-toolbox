import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { toolsData } from '../src/config/tools.ts'
import zhCN from '../src/i18n/zh-CN.ts'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const categories = zhCN.categories as Record<string, string>

const toolsI18n = zhCN.tools as Record<string, any>

let markdownList = ''

for (const [categoryKey, categoryName] of Object.entries(categories)) {
  const tools = toolsData[categoryKey]
  if (!tools || tools.length === 0) continue

  markdownList += `### ${categoryName}\n\n`
  markdownList += `| 标题 | 副标题 | 简介 |\n`
  markdownList += `| --- | --- | --- |\n`
  for (const tool of tools) {
    const id = tool.id
    const title = toolsI18n[id]?.title || tool.title
    const subtitle = toolsI18n[id]?.subtitle || tool.subtitle
    let description = toolsI18n[id]?.description || tool.description
    if (description) {
      description = description.replace(/\n/g, '<br>')
    } else {
      description = ''
    }
    markdownList += `| [${title}](https://tool.yule.ink${tool.path}) | ${subtitle} | ${description} |\n`
  }
  markdownList += '\n'
}

const readmePath = path.join(rootDir, 'README.md')
const readmeContent = fs.readFileSync(readmePath, 'utf-8')

const startTag = '## 工具列表\n\n'
const endTag = '\n### 部署指南'

const startIndex = readmeContent.indexOf(startTag)
const endIndex = readmeContent.indexOf(endTag)

if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
  const newContent =
    readmeContent.slice(0, startIndex + startTag.length) +
    markdownList +
    readmeContent.slice(endIndex)
  fs.writeFileSync(readmePath, newContent, 'utf-8')

  try {
    execSync(`npx prettier --write "${readmePath}"`)
    console.log('README.md updated and formatted successfully!')
  } catch (error) {
    console.error('Failed to format README.md:', error)
  }
} else {
  console.error('Could not find the target sections in README.md')
  process.exit(1)
}
