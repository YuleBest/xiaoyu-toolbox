<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, watch, onMounted, inject, computed } from "vue";
import { useI18n } from "vue-i18n";
import { getLocalTimeZone, today, CalendarDate } from "@internationalized/date";
import {
  CalendarIcon,
  TrendingUp,
  ExternalLink,
  Loader2,
  Search,
  History,
} from "lucide-vue-next";

import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar/index";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const { t } = useI18n();

const showToast = inject("showToast") as (
  msg: string,
  type?: "warning" | "error" | "success",
) => void;

const tool = allTools.find((t) => t.id === "weibo-hot")!;

interface WeiboHotItem {
  url: string;
  title: string;
}

const currentDate = ref<any>(today(getLocalTimeZone()));
const selectedLimit = ref<string>("50");
const hotItems = ref<WeiboHotItem[]>([]);
const loading = ref(false);
const error = ref("");
const calendarOpen = ref(false);

const minDate = new CalendarDate(2020, 11, 24);

// Format date for API: YYYY-MM-DD
const formatDateForApi = (date: any) => {
  return date.toString();
};

const fetchDisasterSafe = async (dateStr: string) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/justjavac/weibo-trending-hot-search/refs/heads/master/raw/${dateStr}.json`,
  );
  if (!res.ok) {
    throw new Error(`HTTP Error: ${res.status}`);
  }
  const data = await res.json();
  return data;
};

const fetchData = async () => {
  loading.value = true;
  error.value = "";
  hotItems.value = [];

  if (!currentDate.value) return;

  const dateStr = formatDateForApi(currentDate.value);

  try {
    const data = await fetchDisasterSafe(dateStr);

    if (Array.isArray(data)) {
      hotItems.value = data;
    } else {
      throw new Error("Invalid data format");
    }
  } catch (err) {
    console.error("Failed to fetch weibo hot search data", err);
    error.value = t("tools.weibo-hot.fetchFailed");
    showToast(t("tools.weibo-hot.fetchFailed"), "error");
  } finally {
    loading.value = false;
  }
};

const displayedItems = computed(() => {
  if (selectedLimit.value === "all") return hotItems.value;
  return hotItems.value.slice(0, parseInt(selectedLimit.value));
});

// Watchers
watch(currentDate, () => {
  calendarOpen.value = false;
  fetchData();
});

onMounted(() => {
  fetchData();
});

const isDateDisabled = (date: any) => {
  return (
    date.compare(today(getLocalTimeZone())) > 0 || date.compare(minDate) < 0
  );
};

const getWeiboUrl = (path: string) => {
  return `https://s.weibo.com${path}`;
};
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Controls -->
      <div
        class="bg-card/30 border border-muted/80 rounded-3xl p-5 flex flex-col sm:flex-row gap-4 justify-between items-center relative overflow-hidden"
      >
        <div class="absolute -right-4 -top-4 opacity-5 pointer-events-none">
          <TrendingUp class="w-32 h-32" />
        </div>
        <div class="flex items-center gap-3 w-full sm:w-auto z-10">
          <Popover v-model:open="calendarOpen">
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                :class="
                  cn(
                    'w-[240px] justify-start text-left font-normal rounded-2xl bg-background/50 backdrop-blur-sm border-muted/50 hover:bg-muted/20 transition-all',
                    !currentDate && 'text-muted-foreground',
                  )
                "
              >
                <CalendarIcon class="mr-2 h-4 w-4 text-orange-500" />
                <span v-if="currentDate" class="font-medium">{{
                  currentDate.toString()
                }}</span>
                <span v-else>{{ $t("tools.weibo-hot.dateSelect") }}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              class="w-auto p-0 rounded-2xl border-muted/50 shadow-xl overflow-hidden"
              align="start"
            >
              <div
                class="flex items-center gap-2 px-4 py-3 bg-muted/20 border-b border-muted/20"
              >
                <History class="h-4 w-4 text-orange-500" />
                <span class="text-sm font-medium">{{
                  $t("tools.weibo-hot.historical")
                }}</span>
              </div>
              <Calendar
                v-model="currentDate"
                mode="single"
                :is-date-disabled="isDateDisabled"
                class="p-3"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto z-10">
          <span
            class="text-sm text-muted-foreground font-medium hidden sm:inline-block"
            >{{ $t("tools.weibo-hot.displayCount") }}</span
          >
          <Select v-model="selectedLimit">
            <SelectTrigger
              class="w-[140px] rounded-2xl bg-background/50 backdrop-blur-sm border-muted/50 hover:bg-muted/20 transition-all"
            >
              <SelectValue :placeholder="$t('tools.weibo-hot.show50')" />
            </SelectTrigger>
            <SelectContent class="rounded-2xl border-muted/50 shadow-xl">
              <SelectGroup>
                <SelectItem value="50" class="rounded-xl cursor-pointer">{{
                  $t("tools.weibo-hot.show50")
                }}</SelectItem>
                <SelectItem value="100" class="rounded-xl cursor-pointer">{{
                  $t("tools.weibo-hot.show100")
                }}</SelectItem>
                <SelectItem value="150" class="rounded-xl cursor-pointer">{{
                  $t("tools.weibo-hot.show150")
                }}</SelectItem>
                <SelectItem value="all" class="rounded-xl cursor-pointer">{{
                  $t("tools.weibo-hot.showAll")
                }}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex flex-col justify-center items-center py-20 bg-card/10 rounded-3xl border border-muted/30"
      >
        <div class="relative w-16 h-16 flex items-center justify-center">
          <div
            class="absolute inset-0 bg-orange-500/20 rounded-full animate-ping"
          ></div>
          <Loader2 class="h-8 w-8 text-orange-500 animate-spin relative z-10" />
        </div>
        <p class="mt-4 text-muted-foreground font-medium">
          {{ $t("tools.weibo-hot.loading") }}
        </p>
      </div>

      <!-- Empty / Error State -->
      <div
        v-else-if="error || displayedItems.length === 0"
        class="flex flex-col items-center justify-center py-20 bg-card/10 rounded-3xl border border-muted/30"
      >
        <div
          class="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4"
        >
          <Search class="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p class="text-lg font-medium text-muted-foreground">
          {{ error || $t("tools.weibo-hot.noResults") }}
        </p>
      </div>

      <!-- Hot List -->
      <div
        v-else
        class="bg-card/30 border border-muted/80 rounded-3xl overflow-hidden relative shadow-sm"
      >
        <div
          class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500"
        ></div>
        <div class="divide-y divide-muted/20">
          <a
            v-for="(item, index) in displayedItems"
            :key="index"
            :href="getWeiboUrl(item.url)"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-muted/10 transition-colors group relative block overflow-hidden"
          >
            <div
              class="h-10 w-10 rounded-xl bg-muted/10 flex items-center justify-center shrink-0 text-lg font-bold transition-all group-hover:scale-110"
              :class="{
                'bg-red-500/10 text-red-500': index === 0,
                'bg-orange-500/10 text-orange-500': index === 1,
                'bg-amber-500/10 text-amber-500': index === 2,
                'text-muted-foreground': index > 2,
              }"
            >
              {{ index + 1 }}
            </div>
            <div class="flex-1 min-w-0 pr-8">
              <h3
                class="text-[15px] font-medium text-foreground/90 group-hover:text-orange-500 transition-colors duration-300 leading-snug"
              >
                {{ item.title }}
              </h3>
            </div>
            <div
              class="absolute right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0"
            >
              <div
                class="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center"
              >
                <ExternalLink class="h-4 w-4 text-orange-500" />
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
