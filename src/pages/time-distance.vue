<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import {
  getLocalTimeZone,
  today,
  CalendarDate,
  parseDate,
} from "@internationalized/date";
import { Clock, CalendarIcon } from "lucide-vue-next";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";
import { Calendar } from "@/components/ui/calendar/index";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

const { t, locale } = useI18n();
const tool = allTools.find((t) => t.id === "time-distance")!;

const tz = getLocalTimeZone();
const currentDate = today(tz);

// --- State ---
const startYest = currentDate.subtract({ days: 1 });
const startDate = ref<any>(
  new CalendarDate(startYest.year, startYest.month, startYest.day),
);
const startDateStr = ref(startYest.toString()); // YYYY-MM-DD
const startTimeStr = ref("00:00:00");
const startTimeRef = ref({ h: 0, m: 0, s: 0 });

const endDate = ref<any>(
  new CalendarDate(currentDate.year, currentDate.month, currentDate.day),
);
const endDateStr = ref(currentDate.toString()); // YYYY-MM-DD
const endTimeStr = ref("00:00:00");
const endTimeRef = ref({ h: 0, m: 0, s: 0 });

const skipWeekends = ref(false);

const startCalendarOpen = ref(false);
const endCalendarOpen = ref(false);
const startTimeOpen = ref(false);
const endTimeOpen = ref(false);

const pad = (n: number) => n.toString().padStart(2, "0");

// Parse Dates from string when user manually types
watch(startDateStr, (val) => {
  try {
    const parsed = parseDate(val);
    if (parsed) startDate.value = parsed;
  } catch (_e) {
    // invalid date string, ignore
  }
});

watch(endDateStr, (val) => {
  try {
    const parsed = parseDate(val);
    if (parsed) endDate.value = parsed;
  } catch (_e) {
    // invalid date string, ignore
  }
});

// Sync Calendar objects back to string
watch(startDate, (val) => {
  if (val) startDateStr.value = val.toString();
});
watch(endDate, (val) => {
  if (val) endDateStr.value = val.toString();
});

// Time Sync
const updateTimeString = (refObj: any, strRef: any) => {
  strRef.value = `${pad(refObj.h)}:${pad(refObj.m)}:${pad(refObj.s)}`;
};

watch(startTimeRef, (val) => updateTimeString(val, startTimeStr), {
  deep: true,
});
watch(endTimeRef, (val) => updateTimeString(val, endTimeStr), { deep: true });

// Time Picker Scroll logic: snap to center
const scrollTargetH1 = ref<HTMLElement[] | null>(null);
const scrollTargetM1 = ref<HTMLElement[] | null>(null);
const scrollTargetS1 = ref<HTMLElement[] | null>(null);
const scrollTargetH2 = ref<HTMLElement[] | null>(null);
const scrollTargetM2 = ref<HTMLElement[] | null>(null);
const scrollTargetS2 = ref<HTMLElement[] | null>(null);

const scrollToTime1 = async (refObj: any) => {
  await nextTick();
  if (scrollTargetH1.value?.[refObj.h]) {
    scrollTargetH1.value[refObj.h]!.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }
  if (scrollTargetM1.value?.[refObj.m]) {
    scrollTargetM1.value[refObj.m]!.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }
  if (scrollTargetS1.value?.[refObj.s]) {
    scrollTargetS1.value[refObj.s]!.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }
};
const scrollToTime2 = async (refObj: any) => {
  await nextTick();
  if (scrollTargetH2.value?.[refObj.h]) {
    scrollTargetH2.value[refObj.h]!.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }
  if (scrollTargetM2.value?.[refObj.m]) {
    scrollTargetM2.value[refObj.m]!.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }
  if (scrollTargetS2.value?.[refObj.s]) {
    scrollTargetS2.value[refObj.s]!.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }
};

watch(startTimeOpen, (isOpen) => {
  if (isOpen) scrollToTime1(startTimeRef.value);
});
watch(endTimeOpen, (isOpen) => {
  if (isOpen) scrollToTime2(endTimeRef.value);
});

// Calculate distance
const distance = computed(() => {
  if (!startDate.value || !endDate.value)
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const start = new Date(
    startDate.value.year,
    startDate.value.month - 1,
    startDate.value.day,
    startTimeRef.value.h,
    startTimeRef.value.m,
    startTimeRef.value.s,
  );

  const end = new Date(
    endDate.value.year,
    endDate.value.month - 1,
    endDate.value.day,
    endTimeRef.value.h,
    endTimeRef.value.m,
    endTimeRef.value.s,
  );

  let diff = end.getTime() - start.getTime();
  const isNegative = diff < 0;
  if (isNegative) diff = -diff;

  // Calculate skip weekends (Saturday & Sunday)
  if (skipWeekends.value) {
    let weekendMs = 0;
    const sTime = isNegative ? end.getTime() : start.getTime();
    const eTime = isNegative ? start.getTime() : end.getTime();

    const curStart = new Date(sTime);
    const startDay = new Date(
      curStart.getFullYear(),
      curStart.getMonth(),
      curStart.getDate(),
    );

    // Count milliseconds
    let cur = startDay;

    while (cur.getTime() <= eTime) {
      const nextDay = new Date(
        cur.getFullYear(),
        cur.getMonth(),
        cur.getDate() + 1,
      );

      if (cur.getDay() === 0 || cur.getDay() === 6) {
        // It's a weekend day. Find overlap with [sTime, eTime]
        const overlapStart = Math.max(cur.getTime(), sTime);
        const overlapEnd = Math.min(nextDay.getTime(), eTime);
        if (overlapEnd > overlapStart) {
          weekendMs += overlapEnd - overlapStart;
        }
      }
      cur = nextDay;
    }

    diff = diff - weekendMs;
    if (diff < 0) diff = 0;
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds };
});

const resultString = computed(() => {
  return t("timeDistance.resultStr", {
    days: distance.value.days,
    hours: distance.value.hours,
    minutes: distance.value.minutes,
    seconds: distance.value.seconds,
  });
});

// Lists for time pickers
const hoursList = Array.from({ length: 24 }, (_, i) => i);
const minSecList = Array.from({ length: 60 }, (_, i) => i);
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <!-- Skip Weekends Toggle -->
      <div class="flex items-center justify-end gap-3 px-2">
        <span
          class="text-sm font-bold text-muted-foreground uppercase tracking-widest"
          >{{ t("timeDistance.skipWeekend") }}</span
        >
        <Switch v-model:checked="skipWeekends" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div class="space-y-6">
          <!-- Start Time Block -->
          <div
            class="bg-card/30 border border-muted/80 rounded-3xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all"
          >
            <h3
              class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2"
            >
              <Clock class="w-4 h-4 text-blue-500" />
              {{ t("timeDistance.startTime") }}
            </h3>

            <div class="flex flex-col sm:flex-row gap-2">
              <div class="flex-1 relative group/date">
                <input
                  v-model="startDateStr"
                  type="text"
                  placeholder="YYYY-MM-DD"
                  class="w-full bg-background border border-muted rounded-2xl pl-4 pr-12 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-foreground"
                />
                <Popover v-model:open="startCalendarOpen">
                  <PopoverTrigger as-child>
                    <button
                      class="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-muted/30 rounded-xl transition-all text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                    >
                      <CalendarIcon class="w-5 h-5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    class="w-auto p-0 rounded-2xl border-muted/50 shadow-xl"
                    align="start"
                  >
                    <Calendar
                      v-model="startDate"
                      mode="single"
                      layout="month-and-year"
                      :locale="locale"
                      class="p-3"
                      @update:model-value="startCalendarOpen = false"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div class="w-full sm:w-[150px] relative">
                <input
                  v-model="startTimeStr"
                  type="text"
                  readonly
                  class="w-full bg-background border border-muted rounded-2xl pl-3 pr-10 py-3 text-lg font-bold transition-all text-center cursor-pointer hover:border-blue-500/30 text-foreground"
                  @click="startTimeOpen = true"
                />
                <Popover v-model:open="startTimeOpen">
                  <PopoverTrigger as-child>
                    <button
                      class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted/30 rounded-xl transition-all text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                    >
                      <Clock class="w-5 h-5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    class="w-auto p-4 rounded-3xl shadow-xl border-muted/50"
                    align="end"
                  >
                    <div class="flex gap-3 font-bold text-center">
                      <div
                        class="flex flex-col gap-1 w-12 h-60 overflow-y-auto scrollbar-hide snap-y snap-mandatory bg-muted/20 rounded-xl py-2"
                      >
                        <div
                          v-for="h in hoursList"
                          :key="h"
                          ref="scrollTargetH1"
                          class="py-2 cursor-pointer snap-center hover:bg-blue-500/10 transition-colors"
                          :class="
                            startTimeRef.h === h
                              ? 'text-blue-500 text-lg'
                              : 'text-muted-foreground'
                          "
                          @click="startTimeRef.h = h"
                        >
                          {{ pad(h) }}
                        </div>
                      </div>
                      <div class="text-muted-foreground font-black pt-2">:</div>
                      <div
                        class="flex flex-col gap-1 w-12 h-60 overflow-y-auto scrollbar-hide snap-y snap-mandatory bg-muted/20 rounded-xl py-2"
                      >
                        <div
                          v-for="m in minSecList"
                          :key="m"
                          ref="scrollTargetM1"
                          class="py-2 cursor-pointer snap-center hover:bg-blue-500/10 transition-colors"
                          :class="
                            startTimeRef.m === m
                              ? 'text-blue-500 text-lg'
                              : 'text-muted-foreground'
                          "
                          @click="startTimeRef.m = m"
                        >
                          {{ pad(m) }}
                        </div>
                      </div>
                      <div class="text-muted-foreground font-black pt-2">:</div>
                      <div
                        class="flex flex-col gap-1 w-12 h-60 overflow-y-auto scrollbar-hide snap-y snap-mandatory bg-muted/20 rounded-xl py-2"
                      >
                        <div
                          v-for="s in minSecList"
                          :key="s"
                          ref="scrollTargetS1"
                          class="py-2 cursor-pointer snap-center hover:bg-blue-500/10 transition-colors"
                          :class="
                            startTimeRef.s === s
                              ? 'text-blue-500 text-lg'
                              : 'text-muted-foreground'
                          "
                          @click="startTimeRef.s = s"
                        >
                          {{ pad(s) }}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <!-- End Time Block -->
          <div
            class="bg-card/30 border border-muted/80 rounded-3xl p-6 relative overflow-hidden group hover:border-rose-500/30 transition-all"
          >
            <h3
              class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2"
            >
              <Clock class="w-4 h-4 text-rose-500" />
              {{ t("timeDistance.endTime") }}
            </h3>

            <div class="flex flex-col sm:flex-row gap-2">
              <div class="flex-1 relative group/date">
                <input
                  v-model="endDateStr"
                  type="text"
                  placeholder="YYYY-MM-DD"
                  class="w-full bg-background border border-muted rounded-2xl pl-4 pr-12 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all text-foreground"
                />
                <Popover v-model:open="endCalendarOpen">
                  <PopoverTrigger as-child>
                    <button
                      class="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-muted/30 rounded-xl transition-all text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 cursor-pointer"
                    >
                      <CalendarIcon class="w-5 h-5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    class="w-auto p-0 rounded-2xl border-muted/50 shadow-xl"
                    align="start"
                  >
                    <Calendar
                      v-model="endDate"
                      mode="single"
                      layout="month-and-year"
                      :locale="locale"
                      class="p-3"
                      @update:model-value="endCalendarOpen = false"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div class="w-full sm:w-[150px] relative">
                <input
                  v-model="endTimeStr"
                  type="text"
                  readonly
                  class="w-full bg-background border border-muted rounded-2xl pl-3 pr-10 py-3 text-lg font-bold transition-all text-center cursor-pointer hover:border-rose-500/30 text-foreground"
                  @click="endTimeOpen = true"
                />
                <Popover v-model:open="endTimeOpen">
                  <PopoverTrigger as-child>
                    <button
                      class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted/30 rounded-xl transition-all text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 cursor-pointer"
                    >
                      <Clock class="w-5 h-5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    class="w-auto p-4 rounded-3xl shadow-xl border-muted/50"
                    align="end"
                  >
                    <div class="flex gap-3 font-bold text-center">
                      <div
                        class="flex flex-col gap-1 w-12 h-60 overflow-y-auto scrollbar-hide snap-y snap-mandatory bg-muted/20 rounded-xl py-2"
                      >
                        <div
                          v-for="h in hoursList"
                          :key="h"
                          ref="scrollTargetH2"
                          class="py-2 cursor-pointer snap-center hover:bg-rose-500/10 transition-colors"
                          :class="
                            endTimeRef.h === h
                              ? 'text-rose-500 text-lg'
                              : 'text-muted-foreground'
                          "
                          @click="endTimeRef.h = h"
                        >
                          {{ pad(h) }}
                        </div>
                      </div>
                      <div class="text-muted-foreground font-black pt-2">:</div>
                      <div
                        class="flex flex-col gap-1 w-12 h-60 overflow-y-auto scrollbar-hide snap-y snap-mandatory bg-muted/20 rounded-xl py-2"
                      >
                        <div
                          v-for="m in minSecList"
                          :key="m"
                          ref="scrollTargetM2"
                          class="py-2 cursor-pointer snap-center hover:bg-rose-500/10 transition-colors"
                          :class="
                            endTimeRef.m === m
                              ? 'text-rose-500 text-lg'
                              : 'text-muted-foreground'
                          "
                          @click="endTimeRef.m = m"
                        >
                          {{ pad(m) }}
                        </div>
                      </div>
                      <div class="text-muted-foreground font-black pt-2">:</div>
                      <div
                        class="flex flex-col gap-1 w-12 h-60 overflow-y-auto scrollbar-hide snap-y snap-mandatory bg-muted/20 rounded-xl py-2"
                      >
                        <div
                          v-for="s in minSecList"
                          :key="s"
                          ref="scrollTargetS2"
                          class="py-2 cursor-pointer snap-center hover:bg-rose-500/10 transition-colors"
                          :class="
                            endTimeRef.s === s
                              ? 'text-rose-500 text-lg'
                              : 'text-muted-foreground'
                          "
                          @click="endTimeRef.s = s"
                        >
                          {{ pad(s) }}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]"
        >
          <Clock class="w-12 h-12 text-blue-500 mb-6 opacity-80" />
          <h2
            class="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4"
          >
            {{ t("timeDistance.distance") }}
          </h2>
          <div
            class="text-2xl md:text-3xl font-black text-important leading-tight wrap-break-word max-w-full"
          >
            {{ resultString }}
          </div>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
