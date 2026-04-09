import { simpleGit } from 'simple-git'
import type { SimpleGit } from 'simple-git'
import { glob } from 'glob'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

interface CommitRecord {
  hash: string
  date: string
  message: string
  author_name: string
}

interface FileCommitLog {
  filePath: string
  commits: CommitRecord[]
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const targetPath = path.resolve(__dirname, '../src/pages')
const publicMinPath = path.resolve(__dirname, '../public/_commit.log.min.json')
const publicPath = path.resolve(__dirname, '../public/_commit.log.json')

async function run() {
  const git: SimpleGit = simpleGit()

  try {
    const isShallow = await git.revparse(['--is-shallow-repository'])
    if (isShallow === 'true') {
      console.log('Shallow clone detected, fetching full history...')
      await git.fetch(['--unshallow']).catch((err) => {
        console.warn('Failed to unshallow repository:', err.message)
      })
    }
  } catch (error) {
    console.warn('Error checking repository depth:', error)
  }

  // Load cache
  let cachedData: FileCommitLog[] = []
  if (fs.existsSync(publicMinPath)) {
    try {
      cachedData = JSON.parse(fs.readFileSync(publicMinPath, 'utf-8'))
      console.log(`[commitLog] Loaded ${cachedData.length} entries from cache.`)
    } catch {
      console.warn('[commitLog] Failed to parse cache file.')
    }
  }

  const results: FileCommitLog[] = []
  const files = await glob('**/*.vue', { cwd: targetPath, absolute: true })

  console.log(`Found ${files.length} files in ${targetPath}`)

  for (const file of files) {
    const relativePath = path.relative(targetPath, file)
    const normalizedPath = relativePath.replace(/\\/g, '/')
    const cachedEntry = cachedData.find((e) => e.filePath.replace(/\\/g, '/') === normalizedPath)

    try {
      // Get latest commit hash quickly
      const latestLog = await git.log({ file, maxCount: 1 })
      const latestHash = latestLog.latest?.hash.substring(0, 7)

      // Check if cache is valid
      if (cachedEntry && cachedEntry.commits[0]?.hash === latestHash) {
        results.push(cachedEntry)
        continue
      }

      // Fetch full log if changed or not in cache
      const log = await git.log({ file })
      console.log(`[commitLog] ${normalizedPath}: Updated (${log.all.length} commits)`)

      results.push({
        filePath: relativePath,
        commits: log.all.map((commit) => ({
          hash: commit.hash.substring(0, 7),
          date: commit.date,
          message: commit.message,
          author_name: commit.author_name,
        })),
      })
    } catch (error) {
      console.error(`[commitLog] Error processing ${normalizedPath}:`, error)
    }
  }

  // Write minified output
  fs.writeFileSync(publicMinPath, JSON.stringify(results), 'utf-8')
  console.log(`Successfully saved commit logs to ${publicMinPath}`)

  // Clean up old unminified file if it exists
  if (fs.existsSync(publicPath)) {
    fs.unlinkSync(publicPath)
    console.log(`Removed deprecated ${publicPath}`)
  }
}

run()
