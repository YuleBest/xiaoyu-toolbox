<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { inject } from 'vue'
import { Copy, Check, Trash2, ArrowRightLeft, Upload, Download } from 'lucide-vue-next'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import { allTools } from '@/config/tools'

const { t } = useI18n()
const showToast = inject('showToast') as (
  msg: string,
  type?: 'success' | 'warning' | 'error',
) => void

const tool = allTools.find((t) => t.id === 'markdown-table-csv')!

// ========== 状态 ==========
const markdownText = ref('')
const csvText = ref('')
const markdownError = ref('')
const csvError = ref('')
const copiedMd = ref(false)
const copiedCsv = ref(false)
const isUpdating = ref(false)

// ========== CSV 转义/反转义 ==========
function escapeCsvCell(cell: string): string {
  if (cell.includes('"') || cell.includes(',') || cell.includes('\n') || cell.includes('\r')) {
    return '"' + cell.replace(/"/g, '""') + '"'
  }
  return cell
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = []
  let i = 0
  while (i < line.length) {
    if (line[i] === '"') {
      // Quoted cell
      let cell = ''
      i++ // skip opening quote
      while (i < line.length) {
        if (line[i] === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            cell += '"'
            i += 2
          } else {
            i++ // skip closing quote
            break
          }
        } else {
          cell += line[i]
          i++
        }
      }
      cells.push(cell)
      if (i < line.length && line[i] === ',') i++
    } else {
      let cell = ''
      while (i < line.length && line[i] !== ',') {
        cell += line[i]
        i++
      }
      cells.push(cell)
      if (i < line.length && line[i] === ',') i++
    }
  }
  return cells
}

function parseMarkdownCell(raw: string): string {
  return raw.trim()
}

// ========== Markdown Table -> CSV ==========
function markdownToCsv(md: string): string {
  const lines = md
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length === 0) return ''

  // Remove optional leading/trailing pipes, then split by |
  const parseRow = (line: string): string[] => {
    let l = line
    if (l.startsWith('|')) l = l.slice(1)
    if (l.endsWith('|')) l = l.slice(0, -1)
    return l.split('|').map(parseMarkdownCell)
  }

  // Separator row: matches patterns like |---|---|
  const isSeparator = (line: string): boolean =>
    /^\|?[\s:|-]+(\|[\s:|-]+)*\|?$/.test(line) && line.replace(/[|\s:-]/g, '').length === 0

  const dataRows: string[][] = []
  for (const line of lines) {
    if (isSeparator(line)) continue
    dataRows.push(parseRow(line))
  }

  return dataRows.map((row) => row.map(escapeCsvCell).join(',')).join('\n')
}

// ========== CSV -> Markdown Table ==========
function csvToMarkdown(csv: string): string {
  // Split lines correctly (quoted newlines are rare in table data, treat simple case)
  const lines = csv
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.length > 0)

  if (lines.length === 0) return ''

  const rows = lines.map(parseCsvLine)
  const colCount = Math.max(...rows.map((r) => r.length))

  // Normalize column count
  const normalized = rows.map((row) => {
    const padded = [...row]
    while (padded.length < colCount) padded.push('')
    return padded
  })

  const mdRows = normalized.map((row) => '| ' + row.join(' | ') + ' |')
  const separator = '| ' + Array(colCount).fill('---').join(' | ') + ' |'

  // Insert separator after first row (header)
  const result = [mdRows[0], separator, ...mdRows.slice(1)]
  return result.join('\n')
}

// ========== 双向联动 ==========
const handleMarkdownInput = () => {
  if (isUpdating.value) return
  isUpdating.value = true
  markdownError.value = ''
  csvError.value = ''
  try {
    if (!markdownText.value.trim()) {
      csvText.value = ''
    } else {
      csvText.value = markdownToCsv(markdownText.value)
    }
  } catch (e) {
    markdownError.value = String(e)
  } finally {
    isUpdating.value = false
  }
}

const handleCsvInput = () => {
  if (isUpdating.value) return
  isUpdating.value = true
  markdownError.value = ''
  csvError.value = ''
  try {
    if (!csvText.value.trim()) {
      markdownText.value = ''
    } else {
      markdownText.value = csvToMarkdown(csvText.value)
    }
  } catch (e) {
    csvError.value = String(e)
  } finally {
    isUpdating.value = false
  }
}

// ========== 工具函数 ==========
const copyText = async (text: string, type: 'md' | 'csv') => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    if (type === 'md') {
      copiedMd.value = true
      setTimeout(() => (copiedMd.value = false), 2000)
    } else {
      copiedCsv.value = true
      setTimeout(() => (copiedCsv.value = false), 2000)
    }
    showToast(t('common.copySuccess'), 'success')
  } catch {
    showToast(t('common.copyFailed'), 'error')
  }
}

const clearAll = () => {
  markdownText.value = ''
  csvText.value = ''
  markdownError.value = ''
  csvError.value = ''
}

const downloadFile = (content: string, filename: string) => {
  if (!content) return
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  showToast(t('common.downloadSuccess'), 'success')
}

const uploadFile = (accept: string, callback: (content: string) => void) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = accept
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      callback(ev.target?.result as string)
    }
    reader.readAsText(file, 'utf-8')
  }
  input.click()
}

const uploadMarkdown = () => {
  uploadFile('.md,.txt', (content) => {
    markdownText.value = content
    handleMarkdownInput()
  })
}

const uploadCsv = () => {
  uploadFile('.csv,.txt', (content) => {
    csvText.value = content
    handleCsvInput()
  })
}

// ========== 示例数据 ==========
const loadExample = () => {
  markdownText.value =
    '| 姓名 | 年龄 | 城市 |\n| --- | --- | --- |\n| 张三 | 25 | 北京 |\n| 李四 | 30 | 上海 |\n| 王五 | 28 | 广州 |'
  handleMarkdownInput()
}

const hasContent = computed(() => markdownText.value.trim() || csvText.value.trim())
</script>

<template>
  <ToolContainer :tool="tool">
    <!-- 操作栏 -->
    <div class="flex flex-wrap items-center gap-2 mb-4">
      <button
        class="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
        @click="loadExample"
      >
        {{ $t('markdownTableCsv.loadExample') }}
      </button>
      <button
        v-if="hasContent"
        class="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors text-destructive"
        @click="clearAll"
      >
        <Trash2 class="h-3.5 w-3.5" />
        {{ $t('common.clearAll') }}
      </button>
    </div>

    <!-- 双栏编辑区 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Markdown Table 侧 -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium flex items-center gap-1.5">
            <span
              class="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded px-1.5 py-0.5 text-xs font-mono"
            >
              Markdown Table
            </span>
          </span>
          <div class="flex items-center gap-1">
            <button
              class="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted transition-colors"
              :title="$t('common.upload')"
              @click="uploadMarkdown"
            >
              <Upload class="h-3.5 w-3.5" />
              {{ $t('common.upload') }}
            </button>
            <button
              class="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted transition-colors"
              :title="$t('common.download')"
              @click="downloadFile(markdownText, 'table.md')"
            >
              <Download class="h-3.5 w-3.5" />
              {{ $t('common.download') }}
            </button>
            <button
              class="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted transition-colors"
              :title="$t('common.copy')"
              @click="copyText(markdownText, 'md')"
            >
              <Check v-if="copiedMd" class="h-3.5 w-3.5 text-green-500" />
              <Copy v-else class="h-3.5 w-3.5" />
              {{ $t('common.copy') }}
            </button>
          </div>
        </div>
        <textarea
          v-model="markdownText"
          class="w-full min-h-80 rounded-lg border bg-background font-mono text-sm p-3 resize-y focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          :placeholder="$t('markdownTableCsv.mdPlaceholder')"
          spellcheck="false"
          @input="handleMarkdownInput"
        />
        <p v-if="markdownError" class="text-destructive text-xs mt-1">{{ markdownError }}</p>
      </div>

      <!-- 中间转换箭头（桌面端） -->
      <div
        class="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        <ArrowRightLeft class="h-5 w-5 text-muted-foreground" />
      </div>

      <!-- CSV 侧 -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium flex items-center gap-1.5">
            <span
              class="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded px-1.5 py-0.5 text-xs font-mono"
            >
              CSV
            </span>
          </span>
          <div class="flex items-center gap-1">
            <button
              class="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted transition-colors"
              :title="$t('common.upload')"
              @click="uploadCsv"
            >
              <Upload class="h-3.5 w-3.5" />
              {{ $t('common.upload') }}
            </button>
            <button
              class="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted transition-colors"
              :title="$t('common.download')"
              @click="downloadFile(csvText, 'table.csv')"
            >
              <Download class="h-3.5 w-3.5" />
              {{ $t('common.download') }}
            </button>
            <button
              class="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted transition-colors"
              :title="$t('common.copy')"
              @click="copyText(csvText, 'csv')"
            >
              <Check v-if="copiedCsv" class="h-3.5 w-3.5 text-green-500" />
              <Copy v-else class="h-3.5 w-3.5" />
              {{ $t('common.copy') }}
            </button>
          </div>
        </div>
        <textarea
          v-model="csvText"
          class="w-full min-h-80 rounded-lg border bg-background font-mono text-sm p-3 resize-y focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          :placeholder="$t('markdownTableCsv.csvPlaceholder')"
          spellcheck="false"
          @input="handleCsvInput"
        />
        <p v-if="csvError" class="text-destructive text-xs mt-1">{{ csvError }}</p>
      </div>
    </div>
  </ToolContainer>
</template>
