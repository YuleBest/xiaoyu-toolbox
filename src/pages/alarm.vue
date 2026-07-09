<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  TriangleAlert,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from 'lucide-vue-next'
import Fuse from 'fuse.js'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import { allTools } from '@/config/tools'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  fetchLists,
  fetchAlarmList,
  fetchAlarmDetail,
  type AlarmItem,
  type AlarmLists,
  type AlarmListParams,
} from '@/api/alarm'

const { t } = useI18n()
const showToast = inject('showToast') as (msg: string, type?: 'warning' | 'error') => void

const tool = allTools.find((t) => t.id === 'alarm')!

const lists = ref<AlarmLists>({ signaltype: [], signallevel: [], province: [] })
const alarmList = ref<AlarmItem[]>([])
const totalCount = ref(0)
const pageNo = ref(1)
const pageSize = 20
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize)))
const loading = ref(false)

const selectedProvince = ref('')
const selectedType = ref('')
const selectedLevel = ref('')
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
let autoSearchTimer: ReturnType<typeof setTimeout> | null = null
let autoFetchEnabled = false

const detailOpen = ref(false)
const detailContent = ref('')
const detailTitle = ref('')
const detailLoading = ref(false)

watch(detailOpen, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

function debounceLoadAlarms() {
  if (autoSearchTimer) {
    clearTimeout(autoSearchTimer)
  }

  autoSearchTimer = setTimeout(() => {
    pageNo.value = 1
    loadAlarms()
  }, 350)
}

watch([selectedProvince, selectedType, selectedLevel], () => {
  if (!autoFetchEnabled) return
  debounceLoadAlarms()
})

watch(searchQuery, () => {
  if (!autoFetchEnabled) return
  debounceLoadAlarms()
})

onMounted(async () => {
  lists.value = await fetchLists()
  autoFetchEnabled = true
  loadAlarms()
})

onBeforeUnmount(() => {
  if (autoSearchTimer) {
    clearTimeout(autoSearchTimer)
  }
})

async function loadAlarms() {
  loading.value = true
  try {
    const params: AlarmListParams = {
      pageNo: pageNo.value,
      pageSize,
      province: selectedProvince.value || undefined,
      signaltype: selectedType.value || undefined,
      signallevel: selectedLevel.value || undefined,
    }

    const res = await fetchAlarmList(params)
    if (res.code === 0 && res.data) {
      alarmList.value = res.data.page.list
      totalCount.value = res.data.page.count
    } else {
      alarmList.value = []
      totalCount.value = 0
    }
  } catch {
    showToast(t('alarm.loadFailed'), 'error')
    alarmList.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}

const displayedList = computed(() => {
  if (!searchQuery.value.trim()) return alarmList.value
  const fuse = new Fuse(alarmList.value, {
    keys: ['title'],
    threshold: 0.3,
    ignoreLocation: true,
  })
  return fuse.search(searchQuery.value.trim()).map((r) => r.item)
})

function searchByTag(tag: string) {
  const query = tag.trim()
  if (!query) return

  searchQuery.value = query
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  searchInput.value?.focus()
  debounceLoadAlarms()
}

function clearSearch() {
  searchQuery.value = ''
}

function goPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  pageNo.value = p
  loadAlarms()
}

function refresh() {
  pageNo.value = 1
  selectedProvince.value = ''
  selectedType.value = ''
  selectedLevel.value = ''
  searchQuery.value = ''
  loadAlarms()
}

async function openDetail(item: AlarmItem) {
  detailTitle.value = item.title
  detailContent.value = ''
  detailOpen.value = true
  detailLoading.value = true
  try {
    const res = await fetchAlarmDetail(item.url)
    detailContent.value = res.content || t('alarm.noResults')
  } catch {
    detailContent.value = t('alarm.detailLoadFailed')
  } finally {
    detailLoading.value = false
  }
}

function levelBadge(level: string): string {
  const map: Record<string, string> = {
    蓝色: 'text-sky-600',
    黄色: 'text-amber-600',
    橙色: 'text-orange-600',
    红色: 'text-red-600',
  }
  return map[level] || 'text-muted-foreground'
}

function extractLevel(title: string): string {
  for (const l of lists.value.signallevel) {
    if (title.includes(l)) return l
  }
  return ''
}

function extractLocation(title: string): string {
  const idx = title.indexOf('气象台发布')
  return idx > 0 ? title.slice(0, idx) : ''
}

function extractSignalType(title: string): string {
  const pub = '发布'
  const pubIdx = title.indexOf(pub)
  if (pubIdx === -1) return ''
  const after = title.slice(pubIdx + pub.length)
  for (const l of lists.value.signallevel) {
    const li = after.indexOf(l)
    if (li !== -1) return after.slice(0, li)
  }
  return ''
}
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Filter Bar -->
      <div class="bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-6 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="space-y-1.5">
            <label class="text-xs text-muted-foreground font-medium">{{
              t('alarm.provinceLabel')
            }}</label>
            <Select v-model="selectedProvince">
              <SelectTrigger class="w-full">
                <SelectValue :placeholder="t('alarm.selectProvince')" />
              </SelectTrigger>
              <SelectContent
                class="rounded-2xl shadow-2xl border-muted/50 backdrop-blur-2xl bg-background/95 max-h-64"
              >
                <SelectItem
                  v-for="p in lists.province"
                  :key="p"
                  :value="p"
                  class="rounded-xl py-2.5 px-3 cursor-pointer focus:bg-blue-500/10 focus:text-blue-500"
                >
                  {{ p }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs text-muted-foreground font-medium">{{
              t('alarm.typeLabel')
            }}</label>
            <Select v-model="selectedType">
              <SelectTrigger class="w-full">
                <SelectValue :placeholder="t('alarm.selectType')" />
              </SelectTrigger>
              <SelectContent
                class="rounded-2xl shadow-2xl border-muted/50 backdrop-blur-2xl bg-background/95"
              >
                <SelectItem
                  v-for="s in lists.signaltype"
                  :key="s"
                  :value="s"
                  class="rounded-xl py-2.5 px-3 cursor-pointer focus:bg-blue-500/10 focus:text-blue-500"
                >
                  {{ s }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs text-muted-foreground font-medium">{{
              t('alarm.levelLabel')
            }}</label>
            <Select v-model="selectedLevel">
              <SelectTrigger class="w-full">
                <SelectValue :placeholder="t('alarm.selectLevel')" />
              </SelectTrigger>
              <SelectContent
                class="rounded-2xl shadow-2xl border-muted/50 backdrop-blur-2xl bg-background/95"
              >
                <SelectItem
                  v-for="l in lists.signallevel"
                  :key="l"
                  :value="l"
                  class="rounded-xl py-2.5 px-3 cursor-pointer focus:bg-blue-500/10 focus:text-blue-500"
                >
                  {{ l }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative flex-1 min-w-[200px]">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            />
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              :placeholder="t('alarm.searchPlaceholder')"
              class="w-full pl-9 pr-8 py-2 bg-background border border-muted rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
            />
            <button
              v-if="searchQuery"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              @click="clearSearch"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
          <button class="btn-secondary px-4 py-2 text-sm" @click="refresh">
            <RefreshCw class="h-4 w-4" />
            {{ t('alarm.refresh') }}
          </button>
        </div>
      </div>

      <!-- Alarm List -->
      <div class="bg-card/30 border border-muted/80 rounded-3xl overflow-hidden">
        <div class="px-5 py-4 border-b border-muted/30 flex items-center justify-between">
          <h3 class="flex items-center gap-2">
            <TriangleAlert class="h-4 w-4 text-red-500" />
            {{ t('alarm.latest') }}
          </h3>
          <span class="text-xs text-muted-foreground">{{
            t('alarm.totalCount', { count: totalCount })
          }}</span>
        </div>

        <div v-if="loading" class="flex justify-center py-16">
          <Loader2 class="h-8 w-8 text-red-500 animate-spin" />
        </div>

        <div
          v-else-if="displayedList.length === 0"
          class="flex flex-col items-center gap-3 py-16 opacity-50"
        >
          <TriangleAlert class="h-12 w-12" />
          <p class="text-sm">{{ t('alarm.noResults') }}</p>
        </div>

        <div v-else class="divide-y divide-muted/20">
          <button
            v-for="item in displayedList"
            :key="item.alertid"
            class="w-full px-5 py-4 flex items-start gap-3 text-left hover:bg-muted/10 transition-colors group"
            @click="openDetail(item)"
          >
            <div class="flex-1 min-w-0 space-y-2">
              <p class="text-[15px] leading-5 text-foreground/90 line-clamp-2">
                {{ item.title }}
              </p>
              <div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span class="flex items-center gap-1.5">
                  <span class="text-foreground/40">|</span>
                  {{ item.issuetime }}
                </span>
                <span
                  class="font-medium truncate max-w-[200px] text-foreground/80 hover:text-foreground cursor-pointer transition-colors"
                  @click.stop.prevent="searchByTag(extractLocation(item.title))"
                >
                  #{{ extractLocation(item.title) }}
                </span>
                <span
                  class="font-medium truncate max-w-[200px] hover:opacity-80 cursor-pointer transition-colors"
                  :class="levelBadge(extractLevel(item.title))"
                  @click.stop.prevent="
                    searchByTag(`${extractSignalType(item.title)}${extractLevel(item.title)}`)
                  "
                >
                  #{{ extractSignalType(item.title) }}{{ extractLevel(item.title) }}
                </span>
              </div>
            </div>
            <img
              v-if="item.pic"
              :src="item.pic"
              class="h-12 w-12 rounded-lg object-contain shrink-0 mt-1 bg-muted/10"
              alt=""
            />
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1 && displayedList.length > 0"
        class="flex items-center justify-center gap-4"
      >
        <button
          class="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
          :disabled="pageNo <= 1"
          @click="goPage(pageNo - 1)"
        >
          <ChevronLeft class="h-4 w-4" />
          {{ t('alarm.prevPage') }}
        </button>
        <span class="text-sm text-muted-foreground">
          {{ t('alarm.pageInfo', { current: pageNo, total: totalPages }) }}
        </span>
        <button
          class="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
          :disabled="pageNo >= totalPages"
          @click="goPage(pageNo + 1)"
        >
          {{ t('alarm.nextPage') }}
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Detail Bottom Sheet -->
    <div
      class="fixed inset-0 z-100 flex items-end justify-center sheet-backdrop"
      :class="detailOpen ? 'sheet-open' : 'sheet-closed'"
      @click.self="detailOpen = false"
    >
      <div
        class="bg-card/90 backdrop-blur-md w-full max-w-3xl rounded-t-3xl flex flex-col sheet-panel"
        style="height: 85vh"
      >
        <!-- Handle -->
        <div class="flex justify-center pt-3 pb-1 shrink-0">
          <div class="w-10 h-1 rounded-full bg-muted-foreground/20" />
        </div>

        <!-- Header -->
        <div class="flex items-start gap-4 px-6 py-4 border-b shrink-0">
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-bold truncate text-important">
              {{ detailTitle }}
            </h3>
          </div>
          <button class="btn-icon shrink-0 mt-0.5" @click="detailOpen = false">
            <X class="h-5 w-5" />
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto px-6 py-5 touch-pan-y">
          <div v-if="detailLoading" class="flex justify-center py-10">
            <Loader2 class="h-8 w-8 text-red-500 animate-spin" />
          </div>
          <p v-else class="text-sm leading-relaxed whitespace-pre-wrap">{{ detailContent }}</p>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>

<style scoped>
.sheet-backdrop {
  background-color: transparent;
  backdrop-filter: blur(0px);
  transition:
    background-color 500ms cubic-bezier(0.4, 0, 0.2, 1),
    backdrop-filter 500ms cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0s;
  will-change: background-color, backdrop-filter;
}

.sheet-backdrop.sheet-open {
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  pointer-events: auto;
  visibility: visible;
}

.sheet-backdrop.sheet-closed {
  pointer-events: none;
  visibility: hidden;
  transition:
    background-color 500ms cubic-bezier(0.4, 0, 0.2, 1),
    backdrop-filter 500ms cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0s 500ms;
}

.sheet-panel {
  transform: translateY(100%);
  transition: transform 500ms cubic-bezier(0.32, 0.72, 0, 1);
  will-change: transform;
}

.sheet-open .sheet-panel {
  transform: translateY(0);
}

.sheet-closed .sheet-panel {
  transform: translateY(100%);
}
</style>
