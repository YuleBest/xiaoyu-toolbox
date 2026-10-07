/**
 * 机查查数据定时同步：拉取上游 CSV → 转 JSON → 写入 R2。
 * 由 Worker Cron Trigger 驱动（wrangler.toml [triggers]），MD5 未变化时跳过转换。
 */
import Papa from 'papaparse'
import type { R2Bucket } from '@cloudflare/workers-types'

const CSV_URL =
  'https://raw.githubusercontent.com/YuleBest/MobileModels-csv/refs/heads/main/models.csv'

const KEY_MODELS = 'database/jichacha/models.json'
const KEY_UPDATE_TIME = 'database/jichacha/update_time.txt'
const KEY_MD5 = 'database/jichacha/last_csv_md5.txt'

const HTTP_METADATA = {
  models: {
    contentType: 'application/json;charset=utf-8',
    cacheControl: 'public, max-age=300, stale-while-revalidate=3600',
  },
  text: { contentType: 'text/plain;charset=utf-8' },
}

export function getFileMd5(content: ArrayBuffer): Promise<string> {
  return crypto.subtle
    .digest('MD5', new Uint8Array(content))
    .then((d) => [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join(''))
}

/** 北京时间（UTC+8）的 "YYYY-MM-DD HH:MM:SS" */
function beijingNow(): string {
  return new Date().toLocaleString('sv-SE', {
    timeZone: 'Asia/Shanghai',
    hour12: false,
  })
}

export async function syncJichacha(env: { DATA: R2Bucket }): Promise<{ updated: boolean }> {
  console.log('正在拉取远程 CSV...')
  const res = await fetch(CSV_URL)
  if (!res.ok) throw new Error(`拉取 CSV 失败: HTTP ${res.status}`)
  const content = await res.arrayBuffer()

  const md5 = await getFileMd5(content)
  const md5Obj = await env.DATA.get(KEY_MD5)
  const oldMd5 = md5Obj ? await md5Obj.text() : null

  if (oldMd5 && oldMd5.trim() === md5) {
    console.log('MD5 匹配，数据未变动，跳过更新')
    return { updated: false }
  }

  const csvString = new TextDecoder('utf-8').decode(content).replace(/^\uFEFF/, '')
  const parsed = Papa.parse<Record<string, string | null>>(csvString, {
    header: true,
    skipEmptyLines: true,
    transform: (value) => (value === '' ? null : value),
  })
  const jsonList = parsed.data ?? []

  await env.DATA.put(KEY_MODELS, JSON.stringify(jsonList), {
    httpMetadata: HTTP_METADATA.models,
  })
  await env.DATA.put(KEY_UPDATE_TIME, beijingNow(), {
    httpMetadata: HTTP_METADATA.text,
  })
  await env.DATA.put(KEY_MD5, md5, { httpMetadata: HTTP_METADATA.text })

  console.log(`同步完成，共 ${jsonList.length} 条机型数据`)
  return { updated: true }
}
