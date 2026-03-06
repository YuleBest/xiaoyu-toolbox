<script setup lang="ts">
import { allTools } from '@/config/tools'
import holidayData from '@/assets/database/chinas_statutory_holidays-2026.json'
import { CalendarHeart, ExternalLink, Info, CalendarDays } from 'lucide-vue-next'

const tool = allTools.find((t) => t.id === 'statutory-holidays')!

// Calculate duration days
const getDuration = (start: string, end: string) => {
  const s = new Date(start)
  const e = new Date(end)
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <!-- Info Banner -->
      <div
        class="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-6 md:p-8 text-blue-900 dark:text-blue-100 flex flex-col gap-4 shadow-sm"
      >
        <div class="flex items-center gap-2 font-extrabold text-xl md:text-2xl tracking-tight">
          <Info class="w-6 h-6 text-blue-500" />
          {{ holidayData.year }} 年部分节假日安排
        </div>
        <p class="text-sm md:text-base leading-relaxed opacity-90 font-medium tracking-wide">
          {{ holidayData.note }}
        </p>
        <div
          class="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs md:text-sm opacity-75 mt-2 font-medium"
        >
          <span class="flex items-center gap-1">发布机构: {{ holidayData.author }}</span>
          <span class="flex items-center gap-1">发布日期: {{ holidayData['public-date'] }}</span>
          <a
            :href="holidayData.link"
            target="_blank"
            class="flex items-center gap-1 hover:text-blue-500 transition-colors bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full shadow-sm"
          >
            查看国务院公报原件 <ExternalLink class="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <!-- Holidays Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
        <div
          v-for="(holiday, index) in holidayData.days"
          :key="index"
          class="bg-card/50 border border-border/50 rounded-3xl p-6 md:p-8 hover:border-blue-500/40 hover:shadow-md transition-all duration-300 group overflow-hidden relative"
        >
          <!-- Decoration -->
          <div
            class="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none"
          ></div>

          <div class="flex items-start justify-between mb-6 relative z-10">
            <h3 class="text-2xl font-bold flex items-center gap-3 tracking-tight">
              <CalendarHeart class="w-7 h-7 text-blue-500" />
              {{ holiday.name }}
            </h3>
            <span
              class="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-bold px-4 py-1.5 rounded-full whitespace-nowrap"
            >
              放假 {{ getDuration(holiday.date.start, holiday.date.end) }} 天
            </span>
          </div>

          <div class="space-y-5 relative z-10">
            <div class="flex flex-col gap-1.5">
              <div
                class="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-widest font-bold"
              >
                <CalendarDays class="w-3.5 h-3.5" />
                放假时间
              </div>
              <span
                class="text-base md:text-lg font-semibold tracking-wide text-foreground/90 pl-5 border-l-2 border-blue-500/30"
              >
                {{ formatDate(holiday.date.start) }} 至 {{ formatDate(holiday.date.end) }}
              </span>
            </div>

            <div v-if="holiday['break-off'].length > 0" class="flex flex-col gap-1.5">
              <span
                class="text-xs text-rose-500 dark:text-rose-400 uppercase tracking-widest font-bold flex items-center gap-1.5"
              >
                <div class="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                调休上班
              </span>
              <div class="flex flex-wrap gap-2 pl-3">
                <span
                  v-for="(bo, i) in holiday['break-off']"
                  :key="i"
                  class="text-sm font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-lg border border-rose-500/20"
                >
                  {{
                    bo.start === bo.end
                      ? formatDate(bo.start)
                      : formatDate(bo.start) + '至' + formatDate(bo.end)
                  }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>
