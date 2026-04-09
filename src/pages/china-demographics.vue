<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { VisXYContainer, VisLine, VisArea, VisAxis, VisCrosshair, VisTooltip } from '@unovis/vue'
import { ChartContainer, ChartTooltipContent, componentToString } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import { allTools } from '@/config/tools'
import { Users, Baby, Skull, TrendingUp, TrendingDown, Info, Download } from 'lucide-vue-next'

const { t } = useI18n()
const tool = allTools.find((r) => r.id === 'china-demographics')!

// ========== 数据类型 ==========
interface DemoRow {
  year: number
  population: number
  births: number | null
  deaths: number | null
  naturalGrowth: number | null
  birthRate: number
  deathRate: number
  naturalGrowthRate: number
}

interface PopulationPoint {
  year: number
  population: number
}

interface BirthDeathPoint {
  year: number
  births: number
  deaths: number
}

interface RatesPoint {
  year: number
  birthRate: number
  deathRate: number
  naturalGrowthRate: number
}

interface DemographicsRaw {
  年末总人口: Record<string, number | ''>
  出生数: Record<string, number | ''>
  死亡数: Record<string, number | ''>
  自然增长数: Record<string, number | ''>
  '出生率(‰)': Record<string, number | ''>
  '死亡率(‰)': Record<string, number | ''>
  '自然增长率(‰)': Record<string, number | ''>
}

// ========== 数据加载 ==========
const rows = ref<DemoRow[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('/database/demographics-of-China/doc_1949-2025.json')
    const raw = (await res.json()) as DemographicsRaw
    const toNum = (v: number | '' | undefined): number | null => (typeof v === 'number' ? v : null)
    const toNumOrZero = (v: number | '' | undefined): number => (typeof v === 'number' ? v : 0)
    const yearKeys = Object.keys(raw['年末总人口'])
      .map(Number)
      .sort((a, b) => a - b)
    rows.value = yearKeys.map((y) => {
      const sy = String(y)
      return {
        year: y,
        population: toNumOrZero(raw['年末总人口'][sy]),
        births: toNum(raw['出生数'][sy]),
        deaths: toNum(raw['死亡数'][sy]),
        naturalGrowth: toNum(raw['自然增长数'][sy]),
        birthRate: toNumOrZero(raw['出生率(‰)'][sy]),
        deathRate: toNumOrZero(raw['死亡率(‰)'][sy]),
        naturalGrowthRate: toNumOrZero(raw['自然增长率(‰)'][sy]),
      }
    })
  } catch {
    // silently ignore
  } finally {
    loading.value = false
  }
})

// ========== 计算属性 ==========
const latestRow = computed(() => rows.value[rows.value.length - 1])
const prevRow = computed(() => rows.value[rows.value.length - 2])

const peakRow = computed(() =>
  rows.value.reduce(
    (max, r) => (r.population > max.population ? r : max),
    rows.value[0] ?? ({ population: 0 } as DemoRow),
  ),
)

const populationData = computed<PopulationPoint[]>(() =>
  rows.value.map((r) => ({ year: r.year, population: r.population })),
)

const birthDeathData = computed<BirthDeathPoint[]>(() =>
  rows.value
    .filter((r) => r.births !== null && r.deaths !== null)
    .map((r) => ({ year: r.year, births: r.births as number, deaths: r.deaths as number })),
)

const ratesData = computed<RatesPoint[]>(() =>
  rows.value.map((r) => ({
    year: r.year,
    birthRate: r.birthRate,
    deathRate: r.deathRate,
    naturalGrowthRate: r.naturalGrowthRate,
  })),
)

// ========== 图表配置（响应式以支持 i18n） ==========
const populationConfig = computed<ChartConfig>(() => ({
  population: { label: t('chinaDemographics.population'), color: 'var(--chart-1)' },
}))

const birthDeathConfig = computed<ChartConfig>(() => ({
  births: { label: t('chinaDemographics.births'), color: 'var(--chart-2)' },
  deaths: { label: t('chinaDemographics.deaths'), color: 'var(--chart-5)' },
}))

const ratesConfig = computed<ChartConfig>(() => ({
  birthRate: { label: t('chinaDemographics.birthRate'), color: 'var(--chart-2)' },
  deathRate: { label: t('chinaDemographics.deathRate'), color: 'var(--chart-5)' },
  naturalGrowthRate: {
    label: t('chinaDemographics.naturalGrowthRate'),
    color: 'var(--chart-1)',
  },
}))

// ========== 标签页 ==========
type TabKey = 'population' | 'births-deaths' | 'rates'
const activeTab = ref<TabKey>('population')

// 表格（最新年份在前）
const tableRows = computed(() => [...rows.value].reverse())

// ========== 下载 ==========
function downloadJson() {
  const blob = new Blob([JSON.stringify(rows.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'china-demographics.json'
  a.click()
  URL.revokeObjectURL(url)
}

function downloadCsv() {
  const headers = [
    t('chinaDemographics.colYear'),
    t('chinaDemographics.colPopulation'),
    t('chinaDemographics.colBirths'),
    t('chinaDemographics.colDeaths'),
    t('chinaDemographics.colNaturalGrowth'),
    t('chinaDemographics.colBirthRate'),
    t('chinaDemographics.colDeathRate'),
    t('chinaDemographics.colNaturalGrowthRate'),
  ]
  const lines = [headers.join(',')]
  for (const r of rows.value) {
    lines.push(
      [
        r.year,
        r.population,
        r.births ?? '',
        r.deaths ?? '',
        r.naturalGrowth ?? '',
        r.birthRate,
        r.deathRate,
        r.naturalGrowthRate,
      ].join(','),
    )
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'china-demographics.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// 差值辅助
const diff = (curr: number | null | undefined, prev: number | null | undefined) => {
  if (curr == null || prev == null) return null
  return curr - prev
}

const fmtDiff = (d: number | null, unit = '') => {
  if (d === null) return '-'
  const sign = d > 0 ? '+' : ''
  return `${sign}${d.toLocaleString('zh-CN')}${unit}`
}
</script>

<template>
  <ToolContainer :tool="tool">
    <!-- 加载中 -->
    <div v-if="loading" class="flex items-center justify-center h-48">
      <div class="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>

    <div v-else class="space-y-6">
      <!-- ========== 关键指标卡片 ========== -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- 总人口 -->
        <div
          class="bg-card border rounded-2xl p-4 space-y-2 hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div class="absolute -right-3 -top-3 opacity-5">
            <Users class="h-20 w-20" />
          </div>
          <div class="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Users class="h-3.5 w-3.5 text-blue-500" />
            {{ $t('chinaDemographics.population') }}
          </div>
          <div class="text-2xl font-bold tabular-nums">
            {{ latestRow ? (latestRow.population / 10000).toFixed(2) : '--' }}
            <span class="text-sm font-normal text-muted-foreground">{{
              $t('chinaDemographics.unitBillion')
            }}</span>
          </div>
          <div class="text-xs text-muted-foreground">
            {{ latestRow?.year }}{{ $t('chinaDemographics.yearSuffix') }} ·
            <span
              :class="
                (diff(latestRow?.population, prevRow?.population) ?? 0) < 0
                  ? 'text-red-500'
                  : 'text-green-500'
              "
            >
              {{
                fmtDiff(
                  diff(latestRow?.population, prevRow?.population),
                  $t('chinaDemographics.unitWan'),
                )
              }}
            </span>
          </div>
        </div>

        <!-- 出生人数 -->
        <div
          class="bg-card border rounded-2xl p-4 space-y-2 hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div class="absolute -right-3 -top-3 opacity-5">
            <Baby class="h-20 w-20" />
          </div>
          <div class="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Baby class="h-3.5 w-3.5 text-green-500" />
            {{ $t('chinaDemographics.births') }}
          </div>
          <div class="text-2xl font-bold tabular-nums">
            {{ latestRow?.births?.toLocaleString('zh-CN') ?? '--' }}
            <span class="text-sm font-normal text-muted-foreground">{{
              $t('chinaDemographics.unitWan')
            }}</span>
          </div>
          <div class="text-xs text-muted-foreground">
            {{ $t('chinaDemographics.birthRate') }} {{ latestRow?.birthRate }}‰
          </div>
        </div>

        <!-- 死亡人数 -->
        <div
          class="bg-card border rounded-2xl p-4 space-y-2 hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div class="absolute -right-3 -top-3 opacity-5">
            <Skull class="h-20 w-20" />
          </div>
          <div class="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Skull class="h-3.5 w-3.5 text-slate-500" />
            {{ $t('chinaDemographics.deaths') }}
          </div>
          <div class="text-2xl font-bold tabular-nums">
            {{ latestRow?.deaths?.toLocaleString('zh-CN') ?? '--' }}
            <span class="text-sm font-normal text-muted-foreground">{{
              $t('chinaDemographics.unitWan')
            }}</span>
          </div>
          <div class="text-xs text-muted-foreground">
            {{ $t('chinaDemographics.deathRate') }} {{ latestRow?.deathRate }}‰
          </div>
        </div>

        <!-- 自然增长 -->
        <div
          class="bg-card border rounded-2xl p-4 space-y-2 hover:shadow-md transition-shadow relative overflow-hidden"
          :class="
            (latestRow?.naturalGrowthRate ?? 0) < 0 ? 'border-red-200 dark:border-red-900/40' : ''
          "
        >
          <div class="absolute -right-3 -top-3 opacity-5">
            <TrendingDown
              v-if="(latestRow?.naturalGrowthRate ?? 0) < 0"
              class="h-20 w-20 text-red-500"
            />
            <TrendingUp v-else class="h-20 w-20 text-green-500" />
          </div>
          <div class="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <TrendingDown
              v-if="(latestRow?.naturalGrowthRate ?? 0) < 0"
              class="h-3.5 w-3.5 text-red-500"
            />
            <TrendingUp v-else class="h-3.5 w-3.5 text-green-500" />
            {{ $t('chinaDemographics.naturalGrowth') }}
          </div>
          <div
            class="text-2xl font-bold tabular-nums"
            :class="(latestRow?.naturalGrowthRate ?? 0) < 0 ? 'text-red-500' : 'text-green-500'"
          >
            {{ latestRow?.naturalGrowth?.toLocaleString('zh-CN') ?? '--' }}
            <span class="text-sm font-normal text-muted-foreground">{{
              $t('chinaDemographics.unitWan')
            }}</span>
          </div>
          <div class="text-xs text-muted-foreground">
            {{ $t('chinaDemographics.naturalGrowthRate') }}
            <span
              :class="(latestRow?.naturalGrowthRate ?? 0) < 0 ? 'text-red-500' : 'text-green-500'"
            >
              {{ latestRow?.naturalGrowthRate }}‰
            </span>
          </div>
        </div>
      </div>

      <!-- ========== 图表区域 ========== -->
      <div class="bg-card/30 border rounded-2xl p-4 md:p-6 space-y-4">
        <!-- 标签页 -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex p-1 bg-muted/30 rounded-xl">
            <button
              class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              :class="
                activeTab === 'population'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              "
              @click="activeTab = 'population'"
            >
              {{ $t('chinaDemographics.tabPopulation') }}
            </button>
            <button
              class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              :class="
                activeTab === 'births-deaths'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              "
              @click="activeTab = 'births-deaths'"
            >
              {{ $t('chinaDemographics.tabBirthsDeath') }}
            </button>
            <button
              class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              :class="
                activeTab === 'rates'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              "
              @click="activeTab = 'rates'"
            >
              {{ $t('chinaDemographics.tabRates') }}
            </button>
          </div>

          <!-- 图例 -->
          <div class="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <template v-if="activeTab === 'population'">
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-0.5 bg-[var(--chart-1)] rounded-full inline-block" />
                {{ $t('chinaDemographics.population') }}
              </span>
            </template>
            <template v-else-if="activeTab === 'births-deaths'">
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-0.5 bg-[var(--chart-2)] rounded-full inline-block" />
                {{ $t('chinaDemographics.births') }}
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-0.5 bg-[var(--chart-5)] rounded-full inline-block" />
                {{ $t('chinaDemographics.deaths') }}
              </span>
            </template>
            <template v-else>
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-0.5 bg-[var(--chart-2)] rounded-full inline-block" />
                {{ $t('chinaDemographics.birthRate') }}
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-0.5 bg-[var(--chart-5)] rounded-full inline-block" />
                {{ $t('chinaDemographics.deathRate') }}
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-0.5 bg-[var(--chart-1)] rounded-full inline-block" />
                {{ $t('chinaDemographics.naturalGrowthRate') }}
              </span>
            </template>
          </div>
        </div>

        <!-- 总人口趋势 -->
        <div v-show="activeTab === 'population'">
          <ChartContainer :config="populationConfig" class="h-[320px] md:h-[380px] w-full">
            <VisXYContainer :data="populationData">
              <VisArea
                :x="(d: PopulationPoint) => d.year"
                :y="(d: PopulationPoint) => d.population"
                :color="'var(--chart-1)'"
                :opacity="0.15"
                curve-type="natural"
              />
              <VisLine
                :x="(d: PopulationPoint) => d.year"
                :y="[(d: PopulationPoint) => d.population]"
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
                :tick-format="(d: number) => `${(d / 10000).toFixed(0)}亿`"
                :num-ticks="5"
              />
              <VisTooltip />
              <VisCrosshair
                :template="
                  componentToString(populationConfig, ChartTooltipContent, {
                    labelFormatter: (d: number | Date) =>
                      `${d}${t('chinaDemographics.yearSuffix')}`,
                  })
                "
                :color="['var(--chart-1)']"
              />
            </VisXYContainer>
          </ChartContainer>
        </div>

        <!-- 出生与死亡 -->
        <div v-show="activeTab === 'births-deaths'">
          <ChartContainer :config="birthDeathConfig" class="h-[320px] md:h-[380px] w-full">
            <VisXYContainer :data="birthDeathData">
              <VisLine
                :x="(d: BirthDeathPoint) => d.year"
                :y="[(d: BirthDeathPoint) => d.births, (d: BirthDeathPoint) => d.deaths]"
                :color="['var(--chart-2)', 'var(--chart-5)']"
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
                :tick-format="(d: number) => `${d}万`"
                :num-ticks="5"
              />
              <VisTooltip />
              <VisCrosshair
                :template="
                  componentToString(birthDeathConfig, ChartTooltipContent, {
                    labelFormatter: (d: number | Date) =>
                      `${d}${t('chinaDemographics.yearSuffix')}`,
                  })
                "
                :color="['var(--chart-2)', 'var(--chart-5)']"
              />
            </VisXYContainer>
          </ChartContainer>
        </div>

        <!-- 增长率 -->
        <div v-show="activeTab === 'rates'">
          <ChartContainer :config="ratesConfig" class="h-[320px] md:h-[380px] w-full">
            <VisXYContainer :data="ratesData" :y-domain="[-10, undefined]">
              <VisLine
                :x="(d: RatesPoint) => d.year"
                :y="[
                  (d: RatesPoint) => d.birthRate,
                  (d: RatesPoint) => d.deathRate,
                  (d: RatesPoint) => d.naturalGrowthRate,
                ]"
                :color="['var(--chart-2)', 'var(--chart-5)', 'var(--chart-1)']"
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
                :tick-format="(d: number) => `${d}‰`"
                :num-ticks="5"
              />
              <VisTooltip />
              <VisCrosshair
                :template="
                  componentToString(ratesConfig, ChartTooltipContent, {
                    labelFormatter: (d: number | Date) =>
                      `${d}${t('chinaDemographics.yearSuffix')}`,
                  })
                "
                :color="['var(--chart-2)', 'var(--chart-5)', 'var(--chart-1)']"
              />
            </VisXYContainer>
          </ChartContainer>
        </div>
      </div>

      <!-- ========== 里程碑提示 ========== -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="flex items-start gap-3 bg-blue-500/5 border border-blue-500/15 rounded-xl p-3">
          <Info class="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p class="text-sm font-medium">{{ $t('chinaDemographics.milestone.peak') }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">
              {{
                $t('chinaDemographics.milestone.peakDesc', {
                  year: peakRow?.year,
                  pop: peakRow ? (peakRow.population / 10000).toFixed(2) : '--',
                })
              }}
            </p>
          </div>
        </div>
        <div class="flex items-start gap-3 bg-red-500/5 border border-red-500/15 rounded-xl p-3">
          <TrendingDown class="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p class="text-sm font-medium">{{ $t('chinaDemographics.milestone.negGrowth') }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">
              {{ $t('chinaDemographics.milestone.negGrowthDesc') }}
            </p>
          </div>
        </div>
        <div
          class="flex items-start gap-3 bg-amber-500/5 border border-amber-500/15 rounded-xl p-3"
        >
          <Baby class="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p class="text-sm font-medium">{{ $t('chinaDemographics.milestone.lowBirth') }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">
              {{ $t('chinaDemographics.milestone.lowBirthDesc') }}
            </p>
          </div>
        </div>
      </div>

      <!-- ========== 数据表格 ========== -->
      <div class="bg-card/30 border rounded-2xl overflow-hidden">
        <div class="px-4 py-3 border-b flex items-center justify-between gap-3">
          <h3 class="text-sm font-semibold">{{ $t('chinaDemographics.tableTitle') }}</h3>
          <div class="flex items-center gap-3">
            <span class="text-xs text-muted-foreground hidden sm:inline">
              {{ $t('chinaDemographics.tableSource') }}
            </span>
            <button
              class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted/50 transition-colors"
              @click="downloadJson"
            >
              <Download class="h-3.5 w-3.5" />
              {{ $t('chinaDemographics.downloadJson') }}
            </button>
            <button
              class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted/50 transition-colors"
              @click="downloadCsv"
            >
              <Download class="h-3.5 w-3.5" />
              {{ $t('chinaDemographics.downloadCsv') }}
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs md:text-sm">
            <thead>
              <tr class="border-b bg-muted/30">
                <th
                  class="px-3 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap"
                >
                  {{ $t('chinaDemographics.colYear') }}
                </th>
                <th
                  class="px-3 py-2.5 text-right font-medium text-muted-foreground whitespace-nowrap"
                >
                  {{ $t('chinaDemographics.colPopulation') }}
                </th>
                <th
                  class="px-3 py-2.5 text-right font-medium text-muted-foreground whitespace-nowrap"
                >
                  {{ $t('chinaDemographics.colBirths') }}
                </th>
                <th
                  class="px-3 py-2.5 text-right font-medium text-muted-foreground whitespace-nowrap"
                >
                  {{ $t('chinaDemographics.colDeaths') }}
                </th>
                <th
                  class="px-3 py-2.5 text-right font-medium text-muted-foreground whitespace-nowrap"
                >
                  {{ $t('chinaDemographics.colNaturalGrowth') }}
                </th>
                <th
                  class="px-3 py-2.5 text-right font-medium text-muted-foreground whitespace-nowrap"
                >
                  {{ $t('chinaDemographics.colBirthRate') }}
                </th>
                <th
                  class="px-3 py-2.5 text-right font-medium text-muted-foreground whitespace-nowrap"
                >
                  {{ $t('chinaDemographics.colDeathRate') }}
                </th>
                <th
                  class="px-3 py-2.5 text-right font-medium text-muted-foreground whitespace-nowrap"
                >
                  {{ $t('chinaDemographics.colNaturalGrowthRate') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in tableRows"
                :key="row.year"
                class="border-b border-border/40 hover:bg-muted/20 transition-colors"
                :class="row.naturalGrowthRate < 0 ? 'bg-red-500/3' : ''"
              >
                <td class="px-3 py-2 font-mono font-medium">{{ row.year }}</td>
                <td class="px-3 py-2 text-right tabular-nums">
                  {{ row.population.toLocaleString('zh-CN') }}
                </td>
                <td class="px-3 py-2 text-right tabular-nums text-green-600 dark:text-green-400">
                  {{ row.births?.toLocaleString('zh-CN') ?? '-' }}
                </td>
                <td class="px-3 py-2 text-right tabular-nums text-rose-600 dark:text-rose-400">
                  {{ row.deaths?.toLocaleString('zh-CN') ?? '-' }}
                </td>
                <td
                  class="px-3 py-2 text-right tabular-nums font-medium"
                  :class="
                    row.naturalGrowth === null
                      ? 'text-muted-foreground'
                      : (row.naturalGrowth ?? 0) < 0
                        ? 'text-red-500'
                        : 'text-foreground'
                  "
                >
                  {{ row.naturalGrowth?.toLocaleString('zh-CN') ?? '-' }}
                </td>
                <td class="px-3 py-2 text-right tabular-nums">{{ row.birthRate }}</td>
                <td class="px-3 py-2 text-right tabular-nums">{{ row.deathRate }}</td>
                <td
                  class="px-3 py-2 text-right tabular-nums font-medium"
                  :class="row.naturalGrowthRate < 0 ? 'text-red-500' : ''"
                >
                  {{ row.naturalGrowthRate }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-4 py-3 border-t text-xs text-muted-foreground flex items-start gap-1.5">
          <Info class="h-3.5 w-3.5 mt-0.5 shrink-0" />
          {{ $t('chinaDemographics.tableNote') }}
        </div>
      </div>
    </div>
  </ToolContainer>
</template>
