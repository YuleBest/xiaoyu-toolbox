<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Clock, ChevronDown, Copy, Check, Info } from 'lucide-vue-next'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import { allTools } from '@/config/tools'

const { t } = useI18n()
const tool = allTools.find((r) => r.id === 'cron')!

// ========== Cron 表达式 ==========
const expression = ref('0 0 * * *')
const exprParts = ref(['0', '0', '*', '*', '*'])

// 解析 expression 到各字段
function parseExpr(expr: string): string[] {
  const parts = expr.trim().split(/\s+/)
  if (parts.length === 5) return parts
  if (parts.length === 6) return parts.slice(1) // 忽略秒字段
  return ['0', '0', '*', '*', '*']
}

watch(expression, (val) => {
  exprParts.value = parseExpr(val)
})

// ========== Cron 解析引擎 ==========
interface CronField {
  name: string
  min: number
  max: number
  aliases: Record<string, number>
}

const CRON_FIELDS: CronField[] = [
  { name: 'minute', min: 0, max: 59, aliases: {} },
  { name: 'hour', min: 0, max: 23, aliases: {} },
  { name: 'dayOfMonth', min: 1, max: 31, aliases: {} },
  {
    name: 'month',
    min: 1,
    max: 12,
    aliases: {
      jan: 1,
      feb: 2,
      mar: 3,
      apr: 4,
      may: 5,
      jun: 6,
      jul: 7,
      aug: 8,
      sep: 9,
      oct: 10,
      nov: 11,
      dec: 12,
    },
  },
  {
    name: 'dayOfWeek',
    min: 0,
    max: 7,
    aliases: {
      sun: 0,
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5,
      sat: 6,
    },
  },
]

function expandField(
  field: string,
  min: number,
  max: number,
  aliases: Record<string, number>,
): number[] {
  const raw = field.toLowerCase()
  // 处理别名
  let processed = raw
  for (const [alias, val] of Object.entries(aliases)) {
    processed = processed.replace(new RegExp(alias, 'g'), String(val))
  }

  const results: number[] = []

  // 按逗号分割
  const parts = processed.split(',')
  for (const part of parts) {
    const stepMatch = part.match(/^(.+)\/(\d+)$/)
    let rangeStr = part
    let step = 1
    if (stepMatch) {
      rangeStr = stepMatch[1] ?? ''
      step = Number.parseInt(stepMatch[2] ?? '1', 10)
    }

    let rangeMin: number
    let rangeMax: number

    if (rangeStr === '*') {
      rangeMin = min
      rangeMax = max
    } else if (rangeStr.includes('-')) {
      const [a, b] = rangeStr.split('-')
      rangeMin = Number.parseInt(a ?? '', 10)
      rangeMax = Number.parseInt(b ?? '', 10)
    } else {
      rangeMin = Number.parseInt(rangeStr, 10)
      rangeMax = rangeMin
    }

    if (Number.isNaN(rangeMin) || Number.isNaN(rangeMax)) continue

    for (let i = rangeMin; i <= rangeMax; i += step) {
      if (i >= min && i <= max) {
        results.push(i)
      }
    }
  }

  return [...new Set(results)].sort((a, b) => a - b)
}

function parseCronExpression(expr: string): number[][] {
  const parts = parseExpr(expr)
  return CRON_FIELDS.map((field, i) =>
    expandField(parts[i] || '*', field.min, field.max, field.aliases),
  )
}

function getNextDates(expr: string, count: number): Date[] {
  const parsed = parseCronExpression(expr)
  if (parsed.length !== 5) return []
  const minutes = parsed[0]!
  const hours = parsed[1]!
  const daysOfMonth = parsed[2]!
  const months = parsed[3]!
  const daysOfWeek = parsed[4]!

  if (
    minutes.length === 0 ||
    hours.length === 0 ||
    daysOfMonth.length === 0 ||
    months.length === 0 ||
    daysOfWeek.length === 0
  ) {
    return []
  }

  const results: Date[] = []
  const now = new Date()
  // 从当前分钟后开始
  let cursor = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes() + 1,
    0,
    0,
  )

  const maxIter = count * 366 * 24 * 60 // safety limit
  let iter = 0

  while (results.length < count && iter < maxIter) {
    iter++
    const month = cursor.getMonth() + 1 // 1-indexed
    const day = cursor.getDate()
    const hour = cursor.getHours()
    const minute = cursor.getMinutes()
    const weekday = cursor.getDay() // 0=Sunday

    if (months.includes(month) && minutes.includes(minute) && hours.includes(hour)) {
      // 日匹配：dayOfMonth 和 dayOfWeek 是 OR 关系（标准 cron）
      const domMatch = daysOfMonth.includes(day)
      const dowMatch = daysOfWeek.includes(weekday)

      // 判断标准 cron 的日字段逻辑：
      // 如果 dayOfMonth 和 dayOfWeek 都未被显式设置（都是 *），视为都匹配
      const domSet = exprParts.value[2] !== '*'
      const dowSet = exprParts.value[4] !== '*'

      let dayMatch: boolean
      if (!domSet && !dowSet) {
        dayMatch = true
      } else if (domSet && dowSet) {
        dayMatch = domMatch || dowMatch // OR logic
      } else if (domSet) {
        dayMatch = domMatch
      } else {
        dayMatch = dowMatch
      }

      if (dayMatch) {
        results.push(new Date(cursor))
      }
    }

    // 前进 1 分钟
    cursor = new Date(cursor.getTime() + 60_000)
  }

  return results
}

// ========== 计算属性 ==========
const nextDates = ref<Date[]>([])
const cronError = ref('')

function refreshDates() {
  cronError.value = ''
  try {
    const expr = exprParts.value.join(' ')
    const dates = getNextDates(expr, 10)
    nextDates.value = dates
    if (dates.length === 0) {
      cronError.value = t('cron.noMatch')
    }
  } catch {
    cronError.value = t('cron.invalidExpression')
    nextDates.value = []
  }
}

watch(exprParts, refreshDates, { deep: true, immediate: true })

// ========== 快捷预设 ==========
const presets = [
  { label: t('cron.presets.everyMinute'), expr: '* * * * *' },
  { label: t('cron.presets.every5Min'), expr: '*/5 * * * *' },
  { label: t('cron.presets.every30Min'), expr: '*/30 * * * *' },
  { label: t('cron.presets.everyHour'), expr: '0 * * * *' },
  { label: t('cron.presets.everyDay'), expr: '0 0 * * *' },
  { label: t('cron.presets.everyWeek'), expr: '0 0 * * 0' },
  { label: t('cron.presets.everyMonth'), expr: '0 0 1 * *' },
  { label: t('cron.presets.everyYear'), expr: '0 0 1 1 *' },
  { label: t('cron.presets.workday9am'), expr: '0 9 * * 1-5' },
  { label: t('cron.presets.workday6pm'), expr: '0 18 * * 1-5' },
]

function applyPreset(expr: string) {
  expression.value = expr
  exprParts.value = parseExpr(expr)
}

// ========== 字段编辑器 ==========
const fieldLabels = computed(() => [
  t('cron.fields.minute'),
  t('cron.fields.hour'),
  t('cron.fields.dayOfMonth'),
  t('cron.fields.month'),
  t('cron.fields.dayOfWeek'),
])

const DOW_NAMES: Record<number, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
  7: 'Sun',
}

// ========== 复制 ==========
const copied = ref(false)
function copyExpression() {
  const expr = exprParts.value.join(' ')
  navigator.clipboard.writeText(expr)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

// ========== 格式化日期 ==========
function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const w = weekdays[date.getDay()]
  return `${y}-${m}-${d} ${h}:${mi}:${s} ${w}`
}

// ========== 人类可读描述 ==========
const humanReadable = computed(() => {
  const minPart = exprParts.value[0] || '*'
  const hourPart = exprParts.value[1] || '*'
  const domPart = exprParts.value[2] || '*'
  const monthPart = exprParts.value[3] || '*'
  const dowPart = exprParts.value[4] || '*'

  const parts: string[] = []

  if (
    minPart === '*' &&
    hourPart === '*' &&
    domPart === '*' &&
    monthPart === '*' &&
    dowPart === '*'
  ) {
    return t('cron.description.everyMinute')
  }

  // 分钟
  if (minPart === '*') {
    parts.push(t('cron.description.everyMin'))
  } else if (minPart.startsWith('*/')) {
    parts.push(t('cron.description.everyNMin', { n: minPart.slice(2) }))
  } else {
    parts.push(`${t('cron.description.atMin')} ${minPart}`)
  }

  // 小时
  if (hourPart === '*') {
    // skip
  } else if (hourPart.startsWith('*/')) {
    parts.push(t('cron.description.everyNHour', { n: hourPart.slice(2) }))
  } else {
    parts.push(`${hourPart}${t('cron.description.hour')}`)
  }

  // 日
  if (domPart !== '*') {
    if (domPart.startsWith('*/')) {
      parts.push(t('cron.description.everyNDay', { n: domPart.slice(2) }))
    } else {
      parts.push(`${domPart}${t('cron.description.day')}`)
    }
  }

  // 月
  if (monthPart !== '*') {
    parts.push(`${monthPart}${t('cron.description.month')}`)
  }

  // 星期
  if (dowPart !== '*') {
    const dows = dowPart.split(',').map((d) => DOW_NAMES[Number(d)] || d)
    parts.push(`${dows.join(',')}`)
  }

  return parts.join(' ')
})
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="space-y-6">
      <!-- ========== 输入区域 ========== -->
      <div class="bg-card border rounded-2xl p-4 md:p-6 space-y-4">
        <div class="flex items-center gap-2">
          <Clock class="h-5 w-5 text-primary" />
          <h2 class="text-sm font-semibold">{{ $t('cron.expression') }}</h2>
          <span class="text-xs text-muted-foreground ml-auto font-mono">
            {{ $t('cron.format') }}: {{ $t('cron.formatHint') }}
          </span>
        </div>

        <!-- 5 字段输入 -->
        <div class="flex flex-wrap items-center gap-2">
          <template v-for="(label, i) in fieldLabels" :key="i">
            <div class="flex flex-col items-center gap-1">
              <label class="text-[10px] text-muted-foreground uppercase tracking-wider">{{
                label
              }}</label>
              <input
                v-model="exprParts[i]"
                type="text"
                class="w-[72px] h-10 text-center font-mono text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                :class="{ 'border-red-300 dark:border-red-800': cronError }"
              />
            </div>
            <span v-if="i < 4" class="text-muted-foreground/50 font-mono mt-4">·</span>
          </template>
        </div>

        <!-- 快捷预设 -->
        <div>
          <p class="text-xs text-muted-foreground mb-2">{{ $t('cron.quickPresets') }}</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="preset in presets"
              :key="preset.expr"
              class="px-2.5 py-1 text-xs rounded-lg border bg-muted/20 hover:bg-muted/50 hover:border-primary/30 transition-all font-mono"
              :class="
                exprParts.join(' ') === preset.expr
                  ? 'border-primary/50 bg-primary/5 text-primary'
                  : 'border-transparent'
              "
              @click="applyPreset(preset.expr)"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>

        <!-- 人类可读描述 -->
        <div
          v-if="humanReadable && !cronError"
          class="flex items-start gap-2 bg-emerald-500/5 border border-emerald-500/15 rounded-lg px-3 py-2"
        >
          <Info class="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
          <p class="text-sm text-emerald-700 dark:text-emerald-300">
            {{ humanReadable }}
          </p>
        </div>

        <div
          v-if="cronError"
          class="flex items-start gap-2 bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2"
        >
          <Info class="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <p class="text-sm text-red-600 dark:text-red-400">{{ cronError }}</p>
        </div>

        <!-- 复制按钮 -->
        <div class="flex items-center gap-3">
          <button
            class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted/50 transition-colors"
            @click="copyExpression"
          >
            <Check v-if="copied" class="h-3.5 w-3.5 text-green-500" />
            <Copy v-else class="h-3.5 w-3.5" />
            {{ copied ? $t('cron.copied') : $t('cron.copyExpression') }}
          </button>
          <span class="text-xs text-muted-foreground hidden sm:inline">
            {{ $t('cron.cronTips') }}
          </span>
        </div>
      </div>

      <!-- ========== 执行时间线 ========== -->
      <div class="bg-card/30 border rounded-2xl p-4 md:p-6 space-y-4">
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-sm font-semibold">{{ $t('cron.nextExecutions') }}</h3>
          <span class="text-xs text-muted-foreground">{{
            $t('cron.showingNext', { count: nextDates.length })
          }}</span>
        </div>

        <!-- 列表视图 -->
        <div v-if="nextDates.length > 0" class="space-y-2">
          <div
            v-for="(date, idx) in nextDates"
            :key="idx"
            class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors"
            :class="idx === 0 ? 'bg-primary/5 border border-primary/15' : ''"
          >
            <span
              class="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0"
              :class="
                idx === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              "
            >
              {{ idx + 1 }}
            </span>
            <span class="font-mono text-sm font-medium">{{ formatDate(date) }}</span>
            <span
              v-if="idx === 0"
              class="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium"
            >
              {{ $t('cron.next') }}
            </span>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Clock class="h-12 w-12 mb-3 opacity-20" />
          <p class="text-sm">{{ cronError || $t('cron.noUpcoming') }}</p>
        </div>
      </div>

      <!-- ========== Cron 语法参考 ========== -->
      <details class="bg-card/30 border rounded-2xl overflow-hidden group">
        <summary
          class="px-4 md:px-6 py-3 cursor-pointer flex items-center gap-2 text-sm font-medium hover:bg-muted/20 transition-colors list-none"
        >
          <ChevronDown class="h-4 w-4 transition-transform group-open:rotate-180" />
          {{ $t('cron.syntaxReference') }}
        </summary>
        <div class="px-4 md:px-6 pb-4 space-y-3 pt-1">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b bg-muted/20">
                <th class="px-2 py-1.5 text-left font-medium">{{ $t('cron.ref.field') }}</th>
                <th class="px-2 py-1.5 text-left font-medium">{{ $t('cron.ref.required') }}</th>
                <th class="px-2 py-1.5 text-left font-medium">{{ $t('cron.ref.range') }}</th>
                <th class="px-2 py-1.5 text-left font-medium">{{ $t('cron.ref.special') }}</th>
              </tr>
            </thead>
            <tbody class="font-mono">
              <tr class="border-b border-border/30">
                <td class="px-2 py-1.5">{{ $t('cron.fields.minute') }}</td>
                <td class="px-2 py-1.5">{{ $t('cron.yes') }}</td>
                <td class="px-2 py-1.5">0-59</td>
                <td class="px-2 py-1.5">, - * /</td>
              </tr>
              <tr class="border-b border-border/30">
                <td class="px-2 py-1.5">{{ $t('cron.fields.hour') }}</td>
                <td class="px-2 py-1.5">{{ $t('cron.yes') }}</td>
                <td class="px-2 py-1.5">0-23</td>
                <td class="px-2 py-1.5">, - * /</td>
              </tr>
              <tr class="border-b border-border/30">
                <td class="px-2 py-1.5">{{ $t('cron.fields.dayOfMonth') }}</td>
                <td class="px-2 py-1.5">{{ $t('cron.yes') }}</td>
                <td class="px-2 py-1.5">1-31</td>
                <td class="px-2 py-1.5">, - * /</td>
              </tr>
              <tr class="border-b border-border/30">
                <td class="px-2 py-1.5">{{ $t('cron.fields.month') }}</td>
                <td class="px-2 py-1.5">{{ $t('cron.yes') }}</td>
                <td class="px-2 py-1.5">1-12</td>
                <td class="px-2 py-1.5">, - * /</td>
              </tr>
              <tr>
                <td class="px-2 py-1.5">{{ $t('cron.fields.dayOfWeek') }}</td>
                <td class="px-2 py-1.5">{{ $t('cron.yes') }}</td>
                <td class="px-2 py-1.5">0-7</td>
                <td class="px-2 py-1.5">, - * /</td>
              </tr>
            </tbody>
          </table>
          <div class="text-xs text-muted-foreground space-y-1">
            <p><code class="bg-muted px-1 rounded">*</code> — {{ $t('cron.ref.asterisk') }}</p>
            <p><code class="bg-muted px-1 rounded">,</code> — {{ $t('cron.ref.comma') }}</p>
            <p><code class="bg-muted px-1 rounded">-</code> — {{ $t('cron.ref.hyphen') }}</p>
            <p><code class="bg-muted px-1 rounded">/</code> — {{ $t('cron.ref.slash') }}</p>
          </div>
        </div>
      </details>
    </div>
  </ToolContainer>
</template>
