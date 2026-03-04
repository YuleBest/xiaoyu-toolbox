<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Info } from 'lucide-vue-next'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import { allTools } from '@/config/tools'

const { t } = useI18n()
const tool = allTools.find((t) => t.id === 'period')!

// --- Date Handling ---
const selectedDateStr = ref('')
const lastPeriodDate = ref(new Date())

const formatDateToString = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDateShort = (d: Date) => {
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

const setToday = () => {
  const now = new Date()
  selectedDateStr.value = formatDateToString(now)
}

onMounted(() => {
  const now = new Date()
  // Default to 1st of current month
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  selectedDateStr.value = formatDateToString(firstDay)
})

watch(selectedDateStr, (newVal) => {
  if (newVal) {
    const d = new Date(newVal)
    // Ensure valid date
    if (!isNaN(d.getTime())) {
      lastPeriodDate.value = d
    }
  }
})

// --- Calculations ---
const addDays = (date: Date, days: number) => {
  const r = new Date(date)
  r.setDate(r.getDate() + days - 1)
  return r
}

// Data structure for today's active phases
const activePhases = computed(() => {
  const d = lastPeriodDate.value
  const today = new Date()

  const startTime = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  const curTime = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())

  const diffDays = Math.floor((curTime - startTime) / (1000 * 60 * 60 * 24))
  const cycles = Math.floor(diffDays / 28)

  const currentCycleStart = new Date(d)
  currentCycleStart.setDate(currentCycleStart.getDate() + cycles * 28)

  const todayIndex = (((diffDays % 28) + 28) % 28) + 1

  const allDefinitions = [
    {
      id: 'menstrual',
      name: t('tools.period.phases.menstrual'),
      startDay: 1,
      endDay: 5,
      color: 'bg-rose-500',
      textColor: 'text-rose-500',
      lightBg: 'bg-rose-500/10',
      desc: t('tools.period.phaseDesc.menstrual'),
    },
    {
      id: 'follicular',
      name: t('tools.period.phases.follicular'),
      startDay: 6,
      endDay: 13,
      color: 'bg-blue-400',
      textColor: 'text-blue-500',
      lightBg: 'bg-blue-500/10',
      desc: t('tools.period.phaseDesc.follicular'),
    },
    {
      id: 'ovulationDay',
      name: t('tools.period.phases.ovulationDay'),
      startDay: 14,
      endDay: 14,
      color: 'bg-amber-500',
      textColor: 'text-amber-500',
      lightBg: 'bg-amber-500/10',
      desc: t('tools.period.phaseDesc.ovulationDay'),
    },
    {
      id: 'luteal',
      name: t('tools.period.phases.luteal'),
      startDay: 15,
      endDay: 28,
      color: 'bg-teal-500',
      textColor: 'text-teal-500',
      lightBg: 'bg-teal-500/10',
      desc: t('tools.period.phaseDesc.luteal'),
    },
    {
      id: 'fertileWindow',
      name: t('tools.period.phases.fertileWindow'),
      startDay: 9,
      endDay: 15,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      lightBg: 'bg-green-500/10',
      desc: t('tools.period.phaseDesc.fertileWindow'),
    },
    {
      id: 'ovulation',
      name: t('tools.period.phases.ovulation'),
      startDay: 9,
      endDay: 18,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      lightBg: 'bg-purple-500/10',
      desc: t('tools.period.phaseDesc.ovulation'),
    },
  ]

  return allDefinitions
    .filter((p) => todayIndex >= p.startDay && todayIndex <= p.endDay)
    .map((p) => ({
      ...p,
      start: addDays(currentCycleStart, p.startDay),
      end: addDays(currentCycleStart, p.endDay),
    }))
})

// Calendar Generation
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const calendarMonths = computed(() => {
  const d = lastPeriodDate.value
  const currentMonth = new Date(d.getFullYear(), d.getMonth(), 1)
  const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1)

  const getMonthDays = (baseDate: Date) => {
    const year = baseDate.getFullYear()
    const month = baseDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const days = []
    const startPadding = firstDay.getDay()

    for (let i = 0; i < startPadding; i++) {
      days.push(null)
    }

    const startTime = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const curDate = new Date(year, month, i)
      const curTime = Date.UTC(year, month, i)
      const diffDays = Math.floor((curTime - startTime) / (1000 * 60 * 60 * 24))

      const dayIndex = (((diffDays % 28) + 28) % 28) + 1

      const isMenstrual = dayIndex >= 1 && dayIndex <= 5
      const isFollicular = dayIndex >= 6 && dayIndex <= 13
      const isOvulationDay = dayIndex === 14
      const isLuteal = dayIndex >= 15 && dayIndex <= 28

      const isFertile = dayIndex >= 9 && dayIndex <= 15
      const isOvulationPhase = dayIndex >= 9 && dayIndex <= 18

      days.push({
        date: curDate,
        dayNum: i,
        dayIndex,
        isMenstrual,
        isFollicular,
        isOvulationDay,
        isLuteal,
        isFertile,
        isOvulationPhase,
        isToday: formatDateToString(curDate) === formatDateToString(new Date()),
      })
    }
    return days
  }

  return [
    {
      title: `${currentMonth.getFullYear()}年${currentMonth.getMonth() + 1}月`,
      days: getMonthDays(currentMonth),
    },
    {
      title: `${nextMonth.getFullYear()}年${nextMonth.getMonth() + 1}月`,
      days: getMonthDays(nextMonth),
    },
  ]
})

// --- Filters ---
const selectedFilter = ref<string | null>(null)

const toggleFilter = (filterId: string) => {
  if (selectedFilter.value === filterId) {
    selectedFilter.value = null
  } else {
    selectedFilter.value = filterId
  }
}

const legendItems = computed(() => [
  {
    id: 'menstrual',
    name: t('tools.period.phases.menstrual'),
    dotClass: 'w-3 h-3 rounded bg-rose-500/20 border border-rose-500/50',
    activeClass:
      'bg-rose-500/10 border-rose-500/50 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/50',
  },
  {
    id: 'follicular',
    name: t('tools.period.phases.follicular'),
    dotClass: 'w-3 h-3 rounded bg-blue-500/20 border border-blue-500/50',
    activeClass:
      'bg-blue-500/10 border-blue-500/50 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/50',
  },
  {
    id: 'ovulationDay',
    name: t('tools.period.phases.ovulationDay'),
    dotClass: 'w-3 h-3 rounded bg-amber-500/20 border border-amber-500/50',
    activeClass:
      'bg-amber-500/10 border-amber-500/50 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/50',
  },
  {
    id: 'luteal',
    name: t('tools.period.phases.luteal'),
    dotClass: 'w-3 h-3 rounded bg-teal-500/20 border border-teal-500/50',
    activeClass:
      'bg-teal-500/10 border-teal-500/50 text-teal-600 dark:text-teal-400 ring-1 ring-teal-500/50',
  },
  {
    id: 'fertileWindow',
    name: t('tools.period.phases.fertileWindow'),
    dotClass: 'w-3 h-1 rounded-full bg-green-500',
    activeClass:
      'bg-green-500/10 border-green-500/50 text-green-600 dark:text-green-400 ring-1 ring-green-500/50',
  },
  {
    id: 'ovulation',
    name: t('tools.period.phases.ovulation'),
    dotClass: 'w-3 h-1 rounded-full bg-purple-500',
    activeClass:
      'bg-purple-500/10 border-purple-500/50 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/50',
  },
])

const isDayMatched = (day: Record<string, any>, filter: string | null) => {
  if (!filter) return true
  if (!day) return false
  switch (filter) {
    case 'menstrual':
      return day.isMenstrual
    case 'follicular':
      return day.isFollicular
    case 'ovulationDay':
      return day.isOvulationDay
    case 'luteal':
      return day.isLuteal
    case 'fertileWindow':
      return day.isFertile
    case 'ovulation':
      return day.isOvulationPhase
    default:
      return true
  }
}
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <!-- Input Section -->
      <div
        class="bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <div>
            <p class="text-sm text-muted-foreground">
              {{ t('tools.period.lastPeriod') }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3 w-full md:w-auto">
          <input
            v-model="selectedDateStr"
            type="date"
            class="flex-1 md:w-48 bg-background border border-muted rounded-xl px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500/50 transition-all font-medium"
          />
          <button
            class="px-4 py-2.5 bg-secondary text-foreground hover:bg-secondary/80 rounded-xl text-sm font-medium transition-all active:scale-95 whitespace-nowrap"
            @click="setToday"
          >
            {{ t('tools.period.today') }}
          </button>
        </div>
      </div>

      <!-- Current Phase(s) -->
      <div
        v-if="activePhases.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div
          v-for="phase in activePhases"
          :key="phase.id"
          class="bg-card border border-muted/60 rounded-2xl p-4 hover:border-muted hover:shadow-sm transition-all flex flex-col justify-between group relative overflow-hidden"
        >
          <!-- Decorative background glow -->
          <div
            class="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20 transition-all group-hover:opacity-40"
            :class="phase.color"
          ></div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold font-mono tracking-tight" :class="phase.textColor">
                {{ phase.name }}
              </span>
              <span
                class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                :class="[phase.lightBg, phase.textColor]"
              >
                {{ formatDateShort(phase.start) }} -
                {{ formatDateShort(phase.end) }}
              </span>
            </div>
            <p
              class="text-xs text-muted-foreground leading-relaxed mt-2"
              style="position: relative; z-index: 1"
            >
              {{ phase.desc }}
            </p>
          </div>
        </div>
      </div>

      <!-- Calendar View -->
      <div class="bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-6 space-y-8">
        <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <h3 class="font-bold flex items-center gap-2 whitespace-nowrap">
            <Activity class="w-5 h-5 text-rose-500" />
            周期日历视图
          </h3>

          <!-- Filter Buttons (Replacing old legend) -->
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="item in legendItems"
              :key="item.id"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 active:scale-95 duration-200"
              :class="
                selectedFilter === item.id
                  ? item.activeClass
                  : 'bg-background border-muted/60 hover:bg-muted/30 text-muted-foreground'
              "
              @click="toggleFilter(item.id)"
            >
              <div :class="item.dotClass"></div>
              {{ item.name }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6">
          <div v-for="(month, mIndex) in calendarMonths" :key="mIndex" class="space-y-4">
            <h4 class="font-bold text-center text-lg text-foreground/80">
              {{ month.title }}
            </h4>
            <div class="grid grid-cols-7 gap-1.5 md:gap-2">
              <!-- Weekday Headers -->
              <div
                v-for="wd in weekdays"
                :key="wd"
                class="text-center text-xs font-bold text-muted-foreground pb-2"
              >
                {{ wd }}
              </div>

              <!-- Days -->
              <div
                v-for="(day, dIndex) in month.days"
                :key="dIndex"
                class="aspect-square rounded-xl flex flex-col items-center justify-center p-1 border transition-all relative overflow-hidden"
                :class="[
                  !day
                    ? 'border-transparent bg-transparent'
                    : selectedFilter && !isDayMatched(day, selectedFilter)
                      ? 'bg-transparent border-transparent opacity-20 grayscale transition-all'
                      : day.isMenstrual
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : day.isOvulationDay
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : day.isFollicular
                            ? 'bg-blue-500/10 border-blue-500/30'
                            : 'bg-teal-500/10 border-teal-500/30',
                  day?.isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : '',
                ]"
              >
                <template v-if="day">
                  <!-- Date Number -->
                  <span
                    class="text-sm font-mono font-bold"
                    :class="[
                      day.isMenstrual
                        ? 'text-rose-500'
                        : day.isOvulationDay
                          ? 'text-amber-500'
                          : day.isFollicular
                            ? 'text-blue-500'
                            : 'text-teal-500',
                    ]"
                  >
                    {{ day.dayNum }}
                  </span>

                  <!-- Indicators (Overlays for Ovulation / Fertile) -->
                  <div
                    class="absolute bottom-1 w-full flex justify-center gap-0.5 px-1.5 pointer-events-none"
                  >
                    <div
                      v-if="day.isFertile"
                      class="h-1 flex-1 bg-green-500 rounded-full"
                      title="易孕期"
                    ></div>
                    <div
                      v-if="day.isOvulationPhase"
                      class="h-1 flex-1 bg-purple-500 rounded-full"
                      title="排卵期"
                    ></div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Removed old legend from bottom -->
      </div>

      <!-- Notice -->
      <div
        class="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3 text-blue-600 dark:text-blue-400"
      >
        <Info class="w-5 h-5 shrink-0 mt-0.5" />
        <p class="text-sm leading-relaxed">
          {{ t('tools.period.notice') }}
        </p>
      </div>
    </div>
  </ToolContainer>
</template>
