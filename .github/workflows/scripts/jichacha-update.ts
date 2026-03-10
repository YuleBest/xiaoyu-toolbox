import axios from 'axios'
import fs from 'fs-extra'
import path from 'path'
import crypto from 'crypto'
import Papa from 'papaparse'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const CSV_URL =
  'https://raw.githubusercontent.com/YuleBest/MobileModels-csv/refs/heads/main/models.csv'
const DATA_DIR = path.resolve(__dirname, '../../../public/database/jichacha')
const MD5_FILE = path.join(DATA_DIR, 'last_csv_md5.txt')
const JSON_FILENAME = path.join(DATA_DIR, 'models.json')
const UPDATE_TIME_FILE = path.join(DATA_DIR, 'update_time.txt')

function getFileMd5(content: Buffer): string {
  return crypto.createHash('md5').update(content).digest('hex')
}

// Convert Beijing timezone (UTC+8) and format
function getCurrentBeijingTime(): string {
  const now = new Date()
  const offset = 8 * 60 * 60 * 1000 // 8 hours in ms
  const localTime = now.getTime()
  const localOffset = now.getTimezoneOffset() * 60000
  const utc = localTime + localOffset
  const beijingTime = new Date(utc + offset)

  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${beijingTime.getFullYear()}-${pad(beijingTime.getMonth() + 1)}-${pad(beijingTime.getDate())} ${pad(beijingTime.getHours())}:${pad(beijingTime.getMinutes())}:${pad(beijingTime.getSeconds())}`
}

async function main() {
  console.log('正在拉取远程 CSV...')
  let newContent: Buffer

  try {
    const res = await axios.get(CSV_URL, { responseType: 'arraybuffer', timeout: 30000 })
    newContent = Buffer.from(res.data)
  } catch (e: any) {
    console.error(`❌ 拉取失败: ${e.message}`)
    process.exit(1)
  }

  const newMd5 = getFileMd5(newContent)

  // Ensure output directory exists before reading or writing
  await fs.ensureDir(DATA_DIR)

  if (await fs.pathExists(MD5_FILE)) {
    const oldMd5 = (await fs.readFile(MD5_FILE, 'utf-8')).trim()
    if (newMd5 === oldMd5) {
      console.log('✅ MD5 匹配，数据未变动。跳过本地更新。')
      return // Exit early
    }
  }

  console.log('🚀 数据变动，开始处理 JSON...')

  // Parse CSV
  // The CSV might contain BOM, we convert buffer to string first
  const csvString = newContent.toString('utf-8').replace(/^\uFEFF/, '')
  const parsed = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    // PapaParse typically yields empty strings for empty fields,
    // we should map them to null to match python's df.where(pd.notnull(df), None) behavior.
    transform: (value) => {
      return value === '' ? null : value
    },
  })

  // We need to keep only objects with valid keys
  const jsonList = parsed.data || []

  // Dump to JSON with no spaces (separators=(',', ':') equivalent)
  const jsonString = JSON.stringify(jsonList)

  try {
    // Write JSON
    await fs.outputFile(JSON_FILENAME, jsonString, 'utf-8')
    console.log(`✅ 成功写入 ${JSON_FILENAME}`)

    // Update MD5
    await fs.outputFile(MD5_FILE, newMd5, 'utf-8')

    // Update Time
    const currentBeijingTime = getCurrentBeijingTime()
    await fs.outputFile(UPDATE_TIME_FILE, currentBeijingTime, 'utf-8')

    console.log(`✨ 同步完成！更新时间: ${currentBeijingTime}`)
  } catch (err: any) {
    console.error('❌ 保存文件到本地数据库时出错:', err.message)
    process.exit(1)
  }
}

main()
