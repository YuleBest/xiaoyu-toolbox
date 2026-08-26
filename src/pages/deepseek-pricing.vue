<script setup lang="ts">
import { computed, onMounted, onUnmounted, shallowRef } from 'vue'
import { Brain, ExternalLink, Info, Moon, Sun } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import { allTools } from '@/config/tools'

interface PricingRow {
  model: string
  cacheHit: string
  cacheMiss: string
  output: string
}

interface BeijingTime {
  weekday: number
  hour: number
  label: string
}

const { t } = useI18n()
const tool = allTools.find((item) => item.id === 'deepseek-pricing')!

const officialPricingUrl = 'https://api-docs.deepseek.com/zh-cn/quick_start/pricing/'

const peakPricing: PricingRow[] = [
  { model: 'deepseek-v4-flash', cacheHit: '0.10', cacheMiss: '3.00', output: '9.00' },
  { model: 'deepseek-v4-pro', cacheHit: '0.30', cacheMiss: '9.00', output: '27.00' },
  { model: 'deepseek-v4-flash-vision-exp', cacheHit: '0.10', cacheMiss: '3.00', output: '9.00' },
]

const offPeakPricing: PricingRow[] = [
  { model: 'deepseek-v4-flash', cacheHit: '0.05', cacheMiss: '1.50', output: '4.50' },
  { model: 'deepseek-v4-pro', cacheHit: '0.15', cacheMiss: '4.50', output: '13.50' },
  { model: 'deepseek-v4-flash-vision-exp', cacheHit: '0.05', cacheMiss: '1.50', output: '4.50' },
]

const beijingTime = shallowRef<BeijingTime>({ weekday: 0, hour: 0, label: '' })

const beijingFormatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function updateBeijingTime() {
  const parts = beijingFormatter.formatToParts(new Date())
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  const weekdayMap: Record<string, number> = {
    周日: 0,
    周一: 1,
    周二: 2,
    周三: 3,
    周四: 4,
    周五: 5,
    周六: 6,
  }

  const weekday = values.weekday ?? '周日'
  const hour = values.hour ?? '00'
  const minute = values.minute ?? '00'

  beijingTime.value = {
    weekday: weekdayMap[weekday] ?? 0,
    hour: Number(hour),
    label: `${weekday} ${hour}:${minute}`,
  }
}

const isPeakPeriod = computed(() => {
  const { weekday, hour } = beijingTime.value
  return weekday >= 1 && weekday <= 5 && ((hour >= 9 && hour < 12) || (hour >= 14 && hour < 18))
})

const currentPricing = computed(() => (isPeakPeriod.value ? peakPricing : offPeakPricing))

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  updateBeijingTime()
  timer = setInterval(updateBeijingTime, 60_000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="max-w-5xl mx-auto flex flex-col gap-6 md:gap-8">
      <section class="bg-card border rounded-2xl p-5 md:p-6">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="flex items-start gap-3">
            <div class="size-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Brain />
            </div>
            <div class="flex flex-col gap-1">
              <h2 class="text-base font-semibold">{{ t('deepseekPricing.sourceTitle') }}</h2>
              <p class="text-sm leading-relaxed text-muted-foreground">
                {{ t('deepseekPricing.sourceDescription') }}
              </p>
            </div>
          </div>
          <a
            :href="officialPricingUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            {{ t('deepseekPricing.viewOfficialPricing') }}
            <ExternalLink class="size-4" />
          </a>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <article class="border border-amber-500/25 bg-amber-500/5 rounded-2xl p-5 flex flex-col gap-3">
          <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Sun class="size-5" />
            <h2 class="font-semibold">{{ t('deepseekPricing.peak') }}</h2>
          </div>
          <p class="text-sm leading-relaxed text-muted-foreground">
            {{ t('deepseekPricing.peakPeriod') }}
          </p>
        </article>
        <article class="border border-sky-500/25 bg-sky-500/5 rounded-2xl p-5 flex flex-col gap-3">
          <div class="flex items-center gap-2 text-sky-600 dark:text-sky-400">
            <Moon class="size-5" />
            <h2 class="font-semibold">{{ t('deepseekPricing.offPeak') }}</h2>
          </div>
          <p class="text-sm leading-relaxed text-muted-foreground">
            {{ t('deepseekPricing.offPeakPeriod') }}
          </p>
        </article>
      </section>

      <section class="border rounded-2xl bg-card overflow-hidden">
        <div
          class="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between md:p-6"
          :class="isPeakPeriod ? 'bg-amber-500/5' : 'bg-sky-500/5'"
        >
          <div class="flex items-center gap-3">
            <div
              class="size-10 shrink-0 rounded-xl flex items-center justify-center"
              :class="isPeakPeriod ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-sky-500/10 text-sky-600 dark:text-sky-400'"
            >
              <Sun v-if="isPeakPeriod" class="size-5" />
              <Moon v-else class="size-5" />
            </div>
            <div class="flex flex-col gap-1">
              <h2 class="text-base font-semibold">{{ t('deepseekPricing.currentPeriod') }}</h2>
              <p class="text-sm text-muted-foreground">
                {{ t('deepseekPricing.currentTime') }}: {{ beijingTime.label }}
              </p>
            </div>
          </div>
          <div
            class="self-start rounded-full px-3 py-1 text-sm font-semibold md:self-auto"
            :class="isPeakPeriod ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'bg-sky-500/10 text-sky-700 dark:text-sky-300'"
          >
            {{ isPeakPeriod ? t('deepseekPricing.peak') : t('deepseekPricing.offPeak') }}
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[620px] text-left text-sm">
            <thead class="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th class="px-4 py-3 font-medium">{{ t('deepseekPricing.model') }}</th>
                <th class="px-4 py-3 text-right font-medium">{{ t('deepseekPricing.cacheHitInput') }}</th>
                <th class="px-4 py-3 text-right font-medium">{{ t('deepseekPricing.cacheMissInput') }}</th>
                <th class="px-4 py-3 text-right font-medium">{{ t('deepseekPricing.output') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border/60">
              <tr v-for="row in currentPricing" :key="row.model" class="hover:bg-muted/30">
                <th class="px-4 py-3 font-mono text-xs font-medium">{{ row.model }}</th>
                <td class="px-4 py-3 text-right tabular-nums">{{ row.cacheHit }}</td>
                <td class="px-4 py-3 text-right tabular-nums">{{ row.cacheMiss }}</td>
                <td class="px-4 py-3 text-right tabular-nums">{{ row.output }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="border-t px-5 py-3 text-xs text-muted-foreground">
          {{ t('deepseekPricing.currentPricing') }} · {{ t('deepseekPricing.pricingUnit') }} · {{ t('deepseekPricing.refreshedEveryMinute') }}
        </p>
      </section>

      <section class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <h2 class="text-base font-semibold">{{ t('deepseekPricing.pricingTable') }}</h2>
          <p class="text-sm text-muted-foreground">{{ t('deepseekPricing.pricingUnit') }}</p>
        </div>

        <div class="overflow-hidden rounded-2xl border bg-card">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[720px] text-left text-sm">
              <thead class="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th rowspan="2" class="px-4 py-3 font-medium">{{ t('deepseekPricing.model') }}</th>
                  <th colspan="3" class="border-l px-4 py-3 text-center font-medium text-amber-700 dark:text-amber-300">
                    {{ t('deepseekPricing.peak') }}
                  </th>
                  <th colspan="3" class="border-l px-4 py-3 text-center font-medium text-sky-700 dark:text-sky-300">
                    {{ t('deepseekPricing.offPeak') }}
                  </th>
                </tr>
                <tr class="border-t border-border/60">
                  <th class="border-l px-4 py-2 font-medium">{{ t('deepseekPricing.cacheHitInput') }}</th>
                  <th class="px-4 py-2 font-medium">{{ t('deepseekPricing.cacheMissInput') }}</th>
                  <th class="px-4 py-2 font-medium">{{ t('deepseekPricing.output') }}</th>
                  <th class="border-l px-4 py-2 font-medium">{{ t('deepseekPricing.cacheHitInput') }}</th>
                  <th class="px-4 py-2 font-medium">{{ t('deepseekPricing.cacheMissInput') }}</th>
                  <th class="px-4 py-2 font-medium">{{ t('deepseekPricing.output') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border/60">
                <tr v-for="(peakRow, index) in peakPricing" :key="peakRow.model" class="hover:bg-muted/30">
                  <th class="px-4 py-3 font-mono text-xs font-medium">{{ peakRow.model }}</th>
                  <td class="border-l px-4 py-3 text-right tabular-nums">{{ peakRow.cacheHit }}</td>
                  <td class="px-4 py-3 text-right tabular-nums">{{ peakRow.cacheMiss }}</td>
                  <td class="px-4 py-3 text-right tabular-nums">{{ peakRow.output }}</td>
                  <td class="border-l px-4 py-3 text-right tabular-nums">{{ offPeakPricing[index]!.cacheHit }}</td>
                  <td class="px-4 py-3 text-right tabular-nums">{{ offPeakPricing[index]!.cacheMiss }}</td>
                  <td class="px-4 py-3 text-right tabular-nums">{{ offPeakPricing[index]!.output }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="border-t px-4 py-3 text-xs text-muted-foreground">
            {{ t('deepseekPricing.modelNote') }}
          </p>
        </div>
      </section>

      <section class="border rounded-2xl bg-muted/20 p-5 md:p-6 flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <Info class="size-5 text-primary" />
          <h2 class="text-base font-semibold">{{ t('deepseekPricing.billingTitle') }}</h2>
        </div>
        <p class="text-sm leading-relaxed text-muted-foreground">
          {{ t('deepseekPricing.billingDescription') }}
        </p>
        <p class="text-sm text-muted-foreground">{{ t('deepseekPricing.noEffectiveDate') }}</p>
      </section>
    </div>
  </ToolContainer>
</template>
