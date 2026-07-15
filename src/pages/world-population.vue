<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { VisXYContainer, VisLine, VisArea, VisAxis, VisCrosshair, VisTooltip } from '@unovis/vue'
import { ChartContainer, ChartTooltipContent, componentToString } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import { Globe, Baby, Skull, TrendingUp, TrendingDown, Info } from 'lucide-vue-next'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import { allTools } from '@/config/tools'

const tool = allTools.find((r) => r.id === 'world-population')!

// ========== 数据类型 ==========
interface PopulationData {
  baseYear: number
  basePopulation: number
  nextYearPopulation: number
  annualBirths: number
  annualDeaths: number
}

interface HistoryRow {
  year: number
  population: number
}

interface HistoryRaw {
  columns: string[]
  data: number[][]
}

interface ChartPoint {
  year: number
  population: number
}

const data = ref<PopulationData | null>(null)
const historyRows = ref<HistoryRow[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [res1, res2] = await Promise.all([
      fetch('/database/world-population/world-population.json'),
      fetch('/database/world-population/world-population_history.json'),
    ])
    data.value = (await res1.json()) as PopulationData
    const raw = (await res2.json()) as HistoryRaw
    historyRows.value = raw.data
      .map((d) => ({ year: d[0] ?? 0, population: d[1] ?? 0 }))
      .sort((a, b) => a.year - b.year)
  } catch {
    // silently ignore
  } finally {
    loading.value = false
  }
})

// ========== 图表数据 ==========
const populationChartData = computed<ChartPoint[]>(() =>
  historyRows.value.map((r) => ({ year: r.year, population: r.population })),
)

const populationChartConfig = computed<ChartConfig>(() => ({
  population: {
    label: '世界总人口',
    color: 'var(--chart-1)',
  },
}))

interface RealtimePoint {
  timestamp: number // ms since epoch
  population: number
}

// ========== 实时图表数据 ==========
function calculatePopulationAt(
  ts: number,
  startPop: number,
  growthPerMs: number,
  yearStart: number,
): number {
  return Math.round(startPop + growthPerMs * (ts - yearStart))
}

const realtimeData = ref<RealtimePoint[]>([])
const reactiveNow = ref(Date.now())
const realtimeConfig = computed<ChartConfig>(() => ({
  population: {
    label: '实时人口',
    color: 'var(--chart-3)',
  },
}))

const realtimeYDomain = computed<[number, number]>(() => {
  if (!data.value) return [0, 1]
  const now = reactiveNow.value
  const yearStart = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0, 0).getTime()
  const yearGrowth = data.value.nextYearPopulation - data.value.basePopulation
  const yearOffset = new Date().getFullYear() - data.value.baseYear
  const startPop = data.value.basePopulation + yearGrowth * yearOffset
  const yearNetGrowth = data.value.annualBirths - data.value.annualDeaths
  const growthPerMs = yearNetGrowth / getYearMs(new Date().getFullYear())

  const windowMs = 5 * 60 * 1000
  const pop5MinAgo = calculatePopulationAt(now - windowMs, startPop, growthPerMs, yearStart)
  const pop5MinAhead = calculatePopulationAt(now + windowMs, startPop, growthPerMs, yearStart)
  const range = pop5MinAhead - pop5MinAgo

  return [Math.floor(pop5MinAgo - range * 0.2), Math.ceil(pop5MinAhead + range * 0.2)]
})

const realtimeXDomain = computed<[number, number]>(() => {
  const now = reactiveNow.value
  const windowMs = 5 * 60 * 1000
  return [now - windowMs, now + windowMs]
})

function updateRealtimeChart() {
  if (!data.value || !isInitialized) return

  const now = Date.now()
  reactiveNow.value = now
  const currentYear = new Date().getFullYear()
  const yearStart = new Date(currentYear, 0, 1, 0, 0, 0, 0).getTime()
  const totalYearMs = getYearMs(currentYear)
  const yearGrowth = data.value.nextYearPopulation - data.value.basePopulation
  const yearOffset = currentYear - data.value.baseYear
  const startPop = data.value.basePopulation + yearGrowth * yearOffset
  const yearNetGrowth = data.value.annualBirths - data.value.annualDeaths
  const growthPerMs = yearNetGrowth / totalYearMs

  const windowMs = 5 * 60 * 1000
  const intervalMs = 1000 // 每1秒一个点
  const points: RealtimePoint[] = []

  for (let t = now - windowMs; t <= now + windowMs; t += intervalMs) {
    points.push({
      timestamp: t,
      population: calculatePopulationAt(t, startPop, growthPerMs, yearStart),
    })
  }

  realtimeData.value = points
}

let realtimeTimer: ReturnType<typeof setInterval> | null = null

function startRealtimeChart() {
  updateRealtimeChart()
  realtimeTimer = setInterval(updateRealtimeChart, 1000) // 每1秒刷新
}

function stopRealtimeChart() {
  if (realtimeTimer) {
    clearInterval(realtimeTimer)
    realtimeTimer = null
  }
}
const displayPopulation = ref(0)
const displayBirths = ref(0)
const displayDeaths = ref(0)
const elapsedDays = ref(0)
let isInitialized = false

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function getYearMs(year: number): number {
  return (isLeapYear(year) ? 366 : 365) * 24 * 60 * 60 * 1000
}

let timer: ReturnType<typeof setInterval> | null = null

function startTimer() {
  if (timer) return
  timer = setInterval(updatePopulation, 50)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function updatePopulation() {
  if (!data.value) return

  const now = new Date()
  const currentYear = now.getFullYear()
  const { basePopulation, annualBirths, annualDeaths } = data.value

  // 今年1月1日零点（本地时间）
  const yearStart = new Date(currentYear, 0, 1, 0, 0, 0, 0)
  const elapsedMs = now.getTime() - yearStart.getTime()
  const totalYearMs = getYearMs(currentYear)
  const progress = Math.max(0, Math.min(1, elapsedMs / totalYearMs))

  // 计算年初基准人口（线性插值）
  const yearGrowth = data.value.nextYearPopulation - basePopulation
  const yearOffset = currentYear - data.value.baseYear
  const startPopulation = basePopulation + yearGrowth * yearOffset

  // 精确值
  const exactBirths = Math.round(annualBirths * progress)
  const exactDeaths = Math.round(annualDeaths * progress)

  // 首次加载直接对齐精确值，避免从 0 跳动
  if (!isInitialized) {
    displayBirths.value = exactBirths
    displayDeaths.value = exactDeaths
    displayPopulation.value = startPopulation + exactBirths - exactDeaths
    elapsedDays.value = elapsedMs / (24 * 60 * 60 * 1000)
    isInitialized = true
    return
  }

  // --- 出生：追赶精确值，只增不减，速度随机变化 ---
  const birthGap = exactBirths - displayBirths.value
  if (birthGap <= 0) {
    // 已追上或超过，保持不变等精确值增长
  } else if (birthGap < 2) {
    displayBirths.value = exactBirths
  } else {
    // 追赶比例在 2%~10% 之间随机，模拟不均匀的出生节奏
    const step = Math.max(1, Math.round(birthGap * (0.02 + Math.random() * 0.08)))
    displayBirths.value = Math.min(exactBirths, displayBirths.value + step)
  }

  // --- 死亡：追赶精确值，只增不减，偶尔加速模拟批量死亡 ---
  const deathGap = exactDeaths - displayDeaths.value
  if (deathGap <= 0) {
    // 已追上，保持不变
  } else if (deathGap < 2) {
    displayDeaths.value = exactDeaths
  } else {
    // 大部分时候慢速追赶，偶尔加速（模拟集中死亡事件）
    const burstChance = 0.08 // 8% 概率触发"批量死亡"
    const isBurst = Math.random() < burstChance
    const rate = isBurst ? 0.1 + Math.random() * 0.15 : 0.015 + Math.random() * 0.025
    const step = Math.max(1, Math.round(deathGap * rate))
    displayDeaths.value = Math.min(exactDeaths, displayDeaths.value + step)
  }

  // --- 总人口：基于显示值精确计算 ---
  displayPopulation.value = startPopulation + displayBirths.value - displayDeaths.value
  elapsedDays.value = elapsedMs / (24 * 60 * 60 * 1000)
}

onMounted(() => {
  // 数据加载后立即启动
  const checkData = setInterval(() => {
    if (data.value) {
      clearInterval(checkData)
      updatePopulation()
      startTimer()
      startRealtimeChart()
    }
  }, 50)
})

onUnmounted(() => {
  stopTimer()
  stopRealtimeChart()
})

// ========== 格式化 ==========
function formatNumber(n: number): string {
  return n.toLocaleString('zh-CN')
}

// 当年净增
const netGrowth = computed(() => {
  if (!data.value) return 0
  return displayBirths.value - displayDeaths.value
})

// 年化增长率
const annualGrowthRate = computed(() => {
  if (!data.value) return 0
  return ((data.value.annualBirths - data.value.annualDeaths) / data.value.basePopulation) * 100
})
</script>

<template>
  <ToolContainer :tool="tool">
    <!-- 加载中 -->
    <div v-if="loading" class="flex items-center justify-center h-48">
      <div class="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>

    <div v-else class="space-y-6">
      <!-- ========== 主计数器：世界总人口 ========== -->
      <div
        class="bg-card border rounded-2xl p-6 md:p-8 space-y-3 text-center relative overflow-hidden"
      >
        <div class="absolute -right-6 -top-6 opacity-[0.04]">
          <Globe class="h-48 w-48" />
        </div>
        <div
          class="flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium"
        >
          <Globe class="h-3.5 w-3.5 text-blue-500" />
          {{ $t('worldPopulation.currentPopulation') }}
        </div>
        <div
          class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tabular-nums tracking-tight leading-none"
        >
          {{ formatNumber(displayPopulation) }}
        </div>
        <div class="text-xs text-muted-foreground">
          {{ $t('worldPopulation.liveUpdate') }}
        </div>
      </div>

      <!-- ========== 子计数器 ========== -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <!-- 今年出生 -->
        <div
          class="bg-card border rounded-2xl p-4 space-y-2 hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div class="absolute -right-3 -top-3 opacity-5">
            <Baby class="h-20 w-20" />
          </div>
          <div class="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Baby class="h-3.5 w-3.5 text-green-500" />
            {{ $t('worldPopulation.birthsThisYear') }}
          </div>
          <div
            class="text-xl sm:text-2xl font-bold tabular-nums text-green-600 dark:text-green-400"
          >
            {{ formatNumber(displayBirths) }}
          </div>
          <div class="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp class="h-3 w-3 text-green-500" />
            {{
              $t('worldPopulation.perSecond', {
                n: (data ? data.annualBirths / 365 / 86400 : 0).toFixed(1),
              })
            }}
          </div>
        </div>

        <!-- 今年死亡 -->
        <div
          class="bg-card border rounded-2xl p-4 space-y-2 hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div class="absolute -right-3 -top-3 opacity-5">
            <Skull class="h-20 w-20" />
          </div>
          <div class="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Skull class="h-3.5 w-3.5 text-red-500" />
            {{ $t('worldPopulation.deathsThisYear') }}
          </div>
          <div class="text-xl sm:text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">
            {{ formatNumber(displayDeaths) }}
          </div>
          <div class="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingDown class="h-3 w-3 text-red-500" />
            {{
              $t('worldPopulation.perSecond', {
                n: (data ? data.annualDeaths / 365 / 86400 : 0).toFixed(1),
              })
            }}
          </div>
        </div>

        <!-- 净增 -->
        <div
          class="bg-card border rounded-2xl p-4 space-y-2 hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div class="absolute -right-3 -top-3 opacity-5">
            <TrendingUp class="h-20 w-20 text-blue-500" />
          </div>
          <div class="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <TrendingUp class="h-3.5 w-3.5 text-blue-500" />
            {{ $t('worldPopulation.netGrowthThisYear') }}
          </div>
          <div class="text-xl sm:text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-400">
            {{ formatNumber(netGrowth) }}
          </div>
          <div class="text-xs text-muted-foreground">
            {{ $t('worldPopulation.netGrowthRate', { rate: annualGrowthRate.toFixed(2) }) }}
          </div>
        </div>
      </div>

      <!-- ========== 实时人口趋势（前后5分钟） ========== -->
      <div class="bg-card/30 border rounded-2xl p-4 md:p-6 space-y-4">
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-sm font-semibold">{{ $t('worldPopulation.realtimeChartTitle') }}</h3>
          <span class="text-[10px] text-muted-foreground">{{
            $t('worldPopulation.realtimeChartSubtitle')
          }}</span>
        </div>
        <ChartContainer :config="realtimeConfig" class="h-[260px] md:h-[300px] w-full">
          <VisXYContainer
            :data="realtimeData"
            :x-domain="realtimeXDomain"
            :y-domain="realtimeYDomain"
          >
            <VisArea
              :x="(d: RealtimePoint) => d.timestamp"
              :y="(d: RealtimePoint) => d.population"
              :color="'var(--chart-3)'"
              :opacity="0.1"
              curve-type="linear"
            />
            <VisLine
              :x="(d: RealtimePoint) => d.timestamp"
              :y="[(d: RealtimePoint) => d.population]"
              :color="['var(--chart-3)']"
              curve-type="linear"
              :line-width="2"
            />
            <VisAxis
              type="x"
              :tick-line="false"
              :domain-line="false"
              :grid-line="false"
              :tick-format="
                (d: number) => {
                  const date = new Date(d)
                  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
                }
              "
              :num-ticks="6"
            />
            <VisAxis
              type="y"
              :tick-line="false"
              :domain-line="false"
              :grid-line="true"
              :tick-format="(d: number) => d.toLocaleString('zh-CN')"
              :num-ticks="4"
            />
            <VisTooltip />
            <VisCrosshair
              :template="
                componentToString(realtimeConfig, ChartTooltipContent, {
                  labelFormatter: (d: number | Date) => {
                    const date = new Date(d as number)
                    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
                  },
                })
              "
              :color="['var(--chart-3)']"
            />
          </VisXYContainer>
        </ChartContainer>
      </div>

      <!-- ========== 历史人口趋势 ========== -->
      <div class="bg-card/30 border rounded-2xl p-4 md:p-6 space-y-4">
        <h3 class="text-sm font-semibold">{{ $t('worldPopulation.historyChartTitle') }}</h3>
        <ChartContainer :config="populationChartConfig" class="h-[300px] md:h-[360px] w-full">
          <VisXYContainer :data="populationChartData">
            <VisArea
              :x="(d: ChartPoint) => d.year"
              :y="(d: ChartPoint) => d.population"
              :color="'var(--chart-1)'"
              :opacity="0.12"
              curve-type="natural"
            />
            <VisLine
              :x="(d: ChartPoint) => d.year"
              :y="[(d: ChartPoint) => d.population]"
              :color="['var(--chart-1)']"
              curve-type="natural"
              :line-width="2"
            />
            <VisAxis
              type="x"
              :tick-line="false"
              :domain-line="false"
              :grid-line="false"
              :tick-format="(d: number) => `${d}`"
              :num-ticks="8"
            />
            <VisAxis
              type="y"
              :tick-line="false"
              :domain-line="false"
              :grid-line="true"
              :tick-format="(d: number) => `${(d / 1e9).toFixed(1)}B`"
              :num-ticks="5"
            />
            <VisTooltip />
            <VisCrosshair
              :template="
                componentToString(populationChartConfig, ChartTooltipContent, {
                  labelFormatter: (d: number | Date) => `${d}年`,
                })
              "
              :color="['var(--chart-1)']"
            />
          </VisXYContainer>
        </ChartContainer>
        <div class="flex items-start gap-2 text-xs text-muted-foreground">
          <Info class="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{{ $t('worldPopulation.historySource') }}</span>
        </div>
      </div>

      <!-- ========== 数据来源 ========== -->
      <div
        class="flex items-start gap-2 bg-muted/20 border rounded-xl px-4 py-3 text-xs text-muted-foreground"
      >
        <Globe class="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
        <span>{{ $t('worldPopulation.dataSource') }}</span>
      </div>
    </div>
  </ToolContainer>
</template>
