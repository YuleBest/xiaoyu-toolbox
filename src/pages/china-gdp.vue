<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { VisXYContainer, VisLine, VisArea, VisAxis, VisCrosshair, VisTooltip } from '@unovis/vue'
import { ChartContainer, ChartTooltipContent, componentToString } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import { allTools } from '@/config/tools'
import {
  BadgeDollarSign,
  TrendingUp,
  TrendingDown,
  Info,
  Download,
  Landmark,
} from 'lucide-vue-next'

const { t } = useI18n()
const tool = allTools.find((r) => r.id === 'china-gdp')!

// ========== 数据类型 ==========
interface GdpRow {
  year: number
  gni: number
  gdp: number
  gdpPerCapita: number
}

interface GdpGniPoint {
  year: number
  gdp: number
  gni: number
}

interface GdpPerCapitaPoint {
  year: number
  gdpPerCapita: number
}

interface GdpRaw {
  columns: string[]
  unit: string[]
  data: number[][]
}

// ========== 数据加载 ==========
const rows = ref<GdpRow[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('/database/china-gdp/china-gdp.json')
    const raw = (await res.json()) as GdpRaw
    rows.value = raw.data
      .map((d) => ({
        year: d[0] ?? 0,
        gni: d[1] ?? 0,
        gdp: d[2] ?? 0,
        gdpPerCapita: d[3] ?? 0,
      }))
      .sort((a, b) => a.year - b.year)
  } catch {
    // silently ignore
  } finally {
    loading.value = false
  }
})

// ========== 计算属性 ==========
const latestRow = computed(() => rows.value[rows.value.length - 1])
const prevRow = computed(() => rows.value[rows.value.length - 2])

const gdpGniData = computed<GdpGniPoint[]>(() =>
  rows.value.map((r) => ({ year: r.year, gdp: r.gdp, gni: r.gni })),
)

const perCapitaData = computed<GdpPerCapitaPoint[]>(() =>
  rows.value.map((r) => ({ year: r.year, gdpPerCapita: r.gdpPerCapita })),
)

// ========== 图表配置 ==========
const gdpGniConfig = computed<ChartConfig>(() => ({
  gdp: { label: t('chinaGdp.gdp'), color: 'var(--chart-1)' },
  gni: { label: t('chinaGdp.gni'), color: 'var(--chart-2)' },
}))

const perCapitaConfig = computed<ChartConfig>(() => ({
  gdpPerCapita: { label: t('chinaGdp.gdpPerCapita'), color: 'var(--chart-3)' },
}))

// ========== 标签页 ==========
type TabKey = 'gdp-gni' | 'per-capita'
const activeTab = ref<TabKey>('gdp-gni')

// 表格（最新年份在前）
const tableRows = computed(() => [...rows.value].reverse())

// ========== 下载 ==========
function downloadJson() {
  const blob = new Blob([JSON.stringify(rows.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'china-gdp.json'
  a.click()
  URL.revokeObjectURL(url)
}

function downloadCsv() {
  const headers = [
    t('chinaGdp.colYear'),
    t('chinaGdp.colGni'),
    t('chinaGdp.colGdp'),
    t('chinaGdp.colGdpPerCapita'),
  ]
  const lines = [headers.join(',')]
  for (const r of rows.value) {
    lines.push([r.year, r.gni, r.gdp, r.gdpPerCapita].join(','))
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'china-gdp.csv'
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

// 增长率
const growthRate = (curr: number | null | undefined, prev: number | null | undefined) => {
  if (curr == null || prev == null || prev === 0) return null
  return ((curr - prev) / prev) * 100
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
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <!-- 国内生产总值 -->
        <div
          class="bg-card border rounded-2xl p-4 space-y-2 hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div class="absolute -right-3 -top-3 opacity-5">
            <BadgeDollarSign class="h-20 w-20" />
          </div>
          <div class="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <BadgeDollarSign class="h-3.5 w-3.5 text-blue-500" />
            {{ $t('chinaGdp.gdp') }}
          </div>
          <div class="text-2xl font-bold tabular-nums">
            {{ latestRow ? (latestRow.gdp / 10000).toFixed(2) : '--' }}
            <span class="text-sm font-normal text-muted-foreground">{{
              $t('chinaGdp.unitTrillion')
            }}</span>
          </div>
          <div class="text-xs text-muted-foreground">
            {{ latestRow?.year }}{{ $t('chinaGdp.yearSuffix') }} ·
            <TrendingUp
              v-if="(diff(latestRow?.gdp, prevRow?.gdp) ?? 0) >= 0"
              class="h-3 w-3 text-green-500 inline align-[-2px]"
            />
            <TrendingDown v-else class="h-3 w-3 text-red-500 inline align-[-2px]" />
            <span
              :class="
                (diff(latestRow?.gdp, prevRow?.gdp) ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'
              "
            >
              {{ fmtDiff(diff(latestRow?.gdp, prevRow?.gdp), $t('chinaGdp.unitHundredMillion')) }}
              ({{ growthRate(latestRow?.gdp, prevRow?.gdp)?.toFixed(2) }}%)
            </span>
          </div>
        </div>

        <!-- 国民总收入 -->
        <div
          class="bg-card border rounded-2xl p-4 space-y-2 hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div class="absolute -right-3 -top-3 opacity-5">
            <Landmark class="h-20 w-20" />
          </div>
          <div class="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Landmark class="h-3.5 w-3.5 text-emerald-500" />
            {{ $t('chinaGdp.gni') }}
          </div>
          <div class="text-2xl font-bold tabular-nums">
            {{ latestRow ? (latestRow.gni / 10000).toFixed(2) : '--' }}
            <span class="text-sm font-normal text-muted-foreground">{{
              $t('chinaGdp.unitTrillion')
            }}</span>
          </div>
          <div class="text-xs text-muted-foreground">
            {{ latestRow?.year }}{{ $t('chinaGdp.yearSuffix') }} ·
            <TrendingUp
              v-if="(diff(latestRow?.gni, prevRow?.gni) ?? 0) >= 0"
              class="h-3 w-3 text-green-500 inline align-[-2px]"
            />
            <TrendingDown v-else class="h-3 w-3 text-red-500 inline align-[-2px]" />
            <span
              :class="
                (diff(latestRow?.gni, prevRow?.gni) ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'
              "
            >
              {{ fmtDiff(diff(latestRow?.gni, prevRow?.gni), $t('chinaGdp.unitHundredMillion')) }}
              ({{ growthRate(latestRow?.gni, prevRow?.gni)?.toFixed(2) }}%)
            </span>
          </div>
        </div>

        <!-- 人均GDP -->
        <div
          class="bg-card border rounded-2xl p-4 space-y-2 hover:shadow-md transition-shadow relative overflow-hidden sm:col-span-2 lg:col-span-1"
        >
          <div class="absolute -right-3 -top-3 opacity-5">
            <TrendingUp class="h-20 w-20" />
          </div>
          <div class="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <TrendingUp class="h-3.5 w-3.5 text-purple-500" />
            {{ $t('chinaGdp.gdpPerCapita') }}
          </div>
          <div class="text-2xl font-bold tabular-nums">
            {{ latestRow?.gdpPerCapita?.toLocaleString('zh-CN') ?? '--' }}
            <span class="text-sm font-normal text-muted-foreground">{{
              $t('chinaGdp.unitYuanPerPerson')
            }}</span>
          </div>
          <div class="text-xs text-muted-foreground">
            {{ latestRow?.year }}{{ $t('chinaGdp.yearSuffix') }} ·
            <TrendingUp
              v-if="(diff(latestRow?.gdpPerCapita, prevRow?.gdpPerCapita) ?? 0) >= 0"
              class="h-3 w-3 text-green-500 inline align-[-2px]"
            />
            <TrendingDown v-else class="h-3 w-3 text-red-500 inline align-[-2px]" />
            <span
              :class="
                (diff(latestRow?.gdpPerCapita, prevRow?.gdpPerCapita) ?? 0) >= 0
                  ? 'text-green-500'
                  : 'text-red-500'
              "
            >
              {{
                fmtDiff(
                  diff(latestRow?.gdpPerCapita, prevRow?.gdpPerCapita),
                  $t('chinaGdp.unitYuan'),
                )
              }}
              ({{ growthRate(latestRow?.gdpPerCapita, prevRow?.gdpPerCapita)?.toFixed(2) }}%)
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
                activeTab === 'gdp-gni'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              "
              @click="activeTab = 'gdp-gni'"
            >
              {{ $t('chinaGdp.tabGdpGni') }}
            </button>
            <button
              class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              :class="
                activeTab === 'per-capita'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              "
              @click="activeTab = 'per-capita'"
            >
              {{ $t('chinaGdp.tabPerCapita') }}
            </button>
          </div>

          <!-- 图例 -->
          <div class="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <template v-if="activeTab === 'gdp-gni'">
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-0.5 bg-[var(--chart-1)] rounded-full inline-block" />
                {{ $t('chinaGdp.gdp') }}
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-0.5 bg-[var(--chart-2)] rounded-full inline-block" />
                {{ $t('chinaGdp.gni') }}
              </span>
            </template>
            <template v-else>
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-0.5 bg-[var(--chart-3)] rounded-full inline-block" />
                {{ $t('chinaGdp.gdpPerCapita') }}
              </span>
            </template>
          </div>
        </div>

        <!-- GDP & GNI 趋势 -->
        <div v-show="activeTab === 'gdp-gni'">
          <ChartContainer :config="gdpGniConfig" class="h-[320px] md:h-[380px] w-full">
            <VisXYContainer :data="gdpGniData">
              <VisArea
                :x="(d: GdpGniPoint) => d.year"
                :y="(d: GdpGniPoint) => d.gdp"
                :color="'var(--chart-1)'"
                :opacity="0.1"
                curve-type="natural"
              />
              <VisLine
                :x="(d: GdpGniPoint) => d.year"
                :y="[(d: GdpGniPoint) => d.gdp, (d: GdpGniPoint) => d.gni]"
                :color="['var(--chart-1)', 'var(--chart-2)']"
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
                :tick-format="(d: number) => `${(d / 10000).toFixed(0)}万亿`"
                :num-ticks="5"
              />
              <VisTooltip />
              <VisCrosshair
                :template="
                  componentToString(gdpGniConfig, ChartTooltipContent, {
                    labelFormatter: (d: number | Date) => `${d}${t('chinaGdp.yearSuffix')}`,
                  })
                "
                :color="['var(--chart-1)', 'var(--chart-2)']"
              />
            </VisXYContainer>
          </ChartContainer>
        </div>

        <!-- 人均GDP 趋势 -->
        <div v-show="activeTab === 'per-capita'">
          <ChartContainer :config="perCapitaConfig" class="h-[320px] md:h-[380px] w-full">
            <VisXYContainer :data="perCapitaData">
              <VisArea
                :x="(d: GdpPerCapitaPoint) => d.year"
                :y="(d: GdpPerCapitaPoint) => d.gdpPerCapita"
                :color="'var(--chart-3)'"
                :opacity="0.15"
                curve-type="natural"
              />
              <VisLine
                :x="(d: GdpPerCapitaPoint) => d.year"
                :y="[(d: GdpPerCapitaPoint) => d.gdpPerCapita]"
                :color="['var(--chart-3)']"
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
                :tick-format="(d: number) => `${(d / 10000).toFixed(1)}万`"
                :num-ticks="5"
              />
              <VisTooltip />
              <VisCrosshair
                :template="
                  componentToString(perCapitaConfig, ChartTooltipContent, {
                    labelFormatter: (d: number | Date) => `${d}${t('chinaGdp.yearSuffix')}`,
                  })
                "
                :color="['var(--chart-3)']"
              />
            </VisXYContainer>
          </ChartContainer>
        </div>
      </div>

      <!-- ========== 里程碑提示 ========== -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="flex items-start gap-3 bg-blue-500/5 border border-blue-500/15 rounded-xl p-3">
          <TrendingUp class="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p class="text-sm font-medium">{{ $t('chinaGdp.milestone.gdpFirst') }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">
              {{ $t('chinaGdp.milestone.gdpFirstDesc') }}
            </p>
          </div>
        </div>
        <div
          class="flex items-start gap-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3"
        >
          <BadgeDollarSign class="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
          <div>
            <p class="text-sm font-medium">{{ $t('chinaGdp.milestone.perCapita10k') }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">
              {{ $t('chinaGdp.milestone.perCapita10kDesc') }}
            </p>
          </div>
        </div>
      </div>

      <!-- ========== 数据表格 ========== -->
      <div class="bg-card/30 border rounded-2xl overflow-hidden">
        <div class="px-4 py-3 border-b flex items-center justify-between gap-3">
          <h3 class="text-sm font-semibold">{{ $t('chinaGdp.tableTitle') }}</h3>
          <div class="flex items-center gap-3">
            <span class="text-xs text-muted-foreground hidden sm:inline">
              {{ $t('chinaGdp.tableSource') }}
            </span>
            <button
              class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted/50 transition-colors"
              @click="downloadJson"
            >
              <Download class="h-3.5 w-3.5" />
              {{ $t('chinaGdp.downloadJson') }}
            </button>
            <button
              class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted/50 transition-colors"
              @click="downloadCsv"
            >
              <Download class="h-3.5 w-3.5" />
              {{ $t('chinaGdp.downloadCsv') }}
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
                  {{ $t('chinaGdp.colYear') }}
                </th>
                <th
                  class="px-3 py-2.5 text-right font-medium text-muted-foreground whitespace-nowrap"
                >
                  {{ $t('chinaGdp.colGni') }}
                </th>
                <th
                  class="px-3 py-2.5 text-right font-medium text-muted-foreground whitespace-nowrap"
                >
                  {{ $t('chinaGdp.colGdp') }}
                </th>
                <th
                  class="px-3 py-2.5 text-right font-medium text-muted-foreground whitespace-nowrap"
                >
                  {{ $t('chinaGdp.colGdpPerCapita') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in tableRows"
                :key="row.year"
                class="border-b border-border/40 hover:bg-muted/20 transition-colors"
              >
                <td class="px-3 py-2 font-mono font-medium">{{ row.year }}</td>
                <td class="px-3 py-2 text-right tabular-nums">
                  {{ row.gni.toLocaleString('zh-CN') }}
                </td>
                <td
                  class="px-3 py-2 text-right tabular-nums font-medium text-blue-600 dark:text-blue-400"
                >
                  {{ row.gdp.toLocaleString('zh-CN') }}
                </td>
                <td
                  class="px-3 py-2 text-right tabular-nums text-emerald-600 dark:text-emerald-400"
                >
                  {{ row.gdpPerCapita.toLocaleString('zh-CN') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-4 py-3 border-t text-xs text-muted-foreground flex items-start gap-1.5">
          <Info class="h-3.5 w-3.5 mt-0.5 shrink-0" />
          {{ $t('chinaGdp.tableNote') }}
        </div>
      </div>
    </div>
  </ToolContainer>
</template>
