/**
 * 拉取机器人同步的运行时数据到本地，供开发环境使用。
 * 这些目录已从 git 移除，生产环境来源：
 * - public/database/jichacha  GitHub Actions 同步到 R2
 * - public/database/hok       Worker 代理 YuleBest/GetHOK 仓库的 data 目录
 */
import fs from 'fs-extra'
import path from 'node:path'

const BASE = process.env.DATA_BASE_URL ?? 'https://tool.yule.ink'
const ROOT = path.resolve(process.cwd(), 'public/database')

const JICHACHA_FILES = ['models.json', 'update_time.txt', 'last_csv_md5.txt']

async function download(rel: string): Promise<void> {
  const res = await fetch(`${BASE}/${rel}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  await fs.outputFile(path.join(ROOT, rel.slice('database/'.length)), Buffer.from(await res.arrayBuffer()))
}

async function pool(items: string[], limit: number, fn: (item: string) => Promise<void>): Promise<void> {
  const queue = [...items]
  await Promise.all(
    Array.from({ length: Math.min(limit, queue.length) }, async () => {
      let item = queue.shift()
      while (item) {
        await fn(item)
        item = queue.shift()
      }
    }),
  )
}

async function main() {
  console.log(`从 ${BASE} 拉取运行时数据到 ${ROOT}`)
  const jichacha = JICHACHA_FILES.map((f) => `database/jichacha/${f}`)
  const manifest = await (await fetch(`${BASE}/database/_hok_manifest.txt`)).text()
  const hok = manifest
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  let failed = 0
  await pool([...jichacha, ...hok], 16, async (rel) => {
    try {
      await download(rel)
    } catch (e) {
      failed++
      console.error(`⚠️ ${rel}: ${(e as Error).message}`)
    }
  })
  console.log(`✅ 完成（jichacha ${jichacha.length} 个，hok ${hok.length} 个${failed ? `，失败 ${failed} 个` : ''}）`)
}

main()
