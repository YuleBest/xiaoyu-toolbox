<script setup lang="ts">
import { ref, watch, onBeforeUnmount, inject, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Search,
  Upload,
  Trash2,
  ExternalLink,
  Play,
  Info,
  Globe,
  Twitter,
  Youtube,
  Monitor,
  User,
  Calendar,
  Layers,
} from 'lucide-vue-next'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import { allTools } from '@/config/tools'

const { t } = useI18n()
const showToast = inject('showToast') as (
  msg: string,
  type?: 'success' | 'warning' | 'error',
) => void

const tool = allTools.find((t) => t.id === 'anime-search')!

// --- State ---
const file = ref<File | null>(null)
const loading = ref(false)
const results = ref<any[]>([])
const error = ref('')
const previewUrl = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const quota = ref<{ quota: number; quotaUsed: number } | null>(null)
const cutBorders = ref(true)

// --- Methods ---
const fetchQuota = async () => {
  try {
    const res = await fetch('/api/anime-search/me')
    if (res.ok) {
      quota.value = await res.json()
    }
  } catch (err) {
    console.error('Failed to fetch quota:', err)
  }
}

onMounted(() => {
  fetchQuota()
})

watch(
  () => file.value,
  async (newFile) => {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = ''
    }
    results.value = []
    error.value = ''

    if (newFile) {
      previewUrl.value = URL.createObjectURL(newFile)
      await searchAnime()
    }
  },
)

onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})

const searchAnime = async () => {
  if (!file.value) return

  loading.value = true
  error.value = ''

  const formData = new FormData()
  formData.append('image', file.value)

  try {
    const res = await fetch(`/api/anime-search/search${cutBorders.value ? '?cutBorders' : ''}`, {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || t('animeSearch.searchFailed'))
    }

    results.value = data.result || []
    if (results.value.length === 0) {
      error.value = t('animeSearch.noResults')
    }
    fetchQuota()
  } catch (err: any) {
    error.value = err.message
    showToast(err.message, 'error')
  } finally {
    loading.value = false
  }
}

const handleFileUpload = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  if (f.size > 25 * 1024 * 1024) {
    showToast(t('exif.fileSizeLimit'), 'error')
    return
  }
  file.value = f
}

const handleDrop = (e: DragEvent) => {
  const f = e.dataTransfer?.files?.[0]
  if (!f) return
  if (!f.type.startsWith('image/') && !f.type.startsWith('video/')) {
    showToast(t('exif.dragImageOnly'), 'warning')
    return
  }
  if (f.size > 25 * 1024 * 1024) {
    showToast(t('exif.fileSizeLimit'), 'error')
    return
  }
  file.value = f
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const getStudioName = (res: any) => {
  const studioEdge =
    res.anilist?.studios?.edges?.find((e: any) => e.isMain) || res.anilist?.studios?.edges?.[0]
  return studioEdge?.node?.name || '-'
}

const getStartDate = (res: any) => {
  const d = res.anilist?.startDate
  if (!d || !d.year) return '-'
  return `${d.year}${d.month ? '-' + String(d.month).padStart(2, '0') : ''}`
}

const getLinkIcon = (site: string) => {
  const s = site.toLowerCase()
  if (s.includes('twitter') || s.includes('x.com')) return Twitter
  if (s.includes('youtube')) return Youtube
  if (s.includes('official') || s.includes('site')) return Globe
  return ExternalLink
}

const clearAll = () => {
  file.value = null
  results.value = []
  error.value = ''
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <ToolContainer :tool="tool">
    <template #actions>
      <div v-if="quota" class="hidden sm:flex items-center gap-3 mr-4">
        <div
          class="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black border border-emerald-500/20 uppercase tracking-wider"
        >
          {{ t('animeSearch.searchQuota') }}: {{ quota.quota - quota.quotaUsed }}
        </div>
      </div>
      <button
        v-if="file"
        class="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-95"
        @click="clearAll"
      >
        <Trash2 class="h-4 w-4" />
        <span class="hidden sm:inline">{{ $t('common.clear') }}</span>
      </button>
    </template>

    <div class="max-w-5xl mx-auto space-y-8">
      <input
        ref="fileInput"
        type="file"
        accept="image/*,video/*"
        class="hidden"
        @change="handleFileUpload"
      />

      <!-- Stage 1: Initial Upload Area -->
      <div
        v-if="!file"
        class="relative border-2 border-dashed border-muted/80 rounded-3xl p-10 md:p-20 text-center transition-all bg-card/5 hover:bg-card/10 hover:border-indigo-500/40 group overflow-hidden"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <div
          class="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        ></div>

        <div class="flex flex-col items-center gap-6 relative z-10">
          <div
            class="w-20 h-20 bg-indigo-500/10 rounded-[28px] flex items-center justify-center transition-transform group-hover:scale-105 group-hover:rotate-3 shadow-inner"
          >
            <Search class="h-10 w-10 text-indigo-500" />
          </div>

          <div class="space-y-2">
            <h3 class="text-xl font-black text-foreground">{{ t('animeSearch.placeholder') }}</h3>
            <p class="text-sm text-muted-foreground">{{ t('exif.supportedFormats') }} (Max 25MB)</p>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <button
              class="flex items-center gap-3 px-8 py-3 bg-indigo-500 text-white rounded-2xl text-base font-black shadow-xl shadow-indigo-500/20 hover:bg-indigo-600 hover:-translate-y-0.5 transition-all active:scale-95"
              @click="fileInput?.click()"
            >
              <Upload class="h-5 w-5" />
              {{ t('exif.selectImage') }}
            </button>

            <label
              class="flex items-center gap-3 cursor-pointer group/toggle px-4 py-2 bg-muted/20 border border-muted/50 rounded-2xl backdrop-blur-sm"
            >
              <input v-model="cutBorders" type="checkbox" class="sr-only" />
              <div
                class="w-8 h-4.5 bg-muted rounded-full relative transition-colors group-has-checked:bg-indigo-500"
              >
                <div
                  class="absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all group-has-checked:left-4"
                ></div>
              </div>
              <span
                class="text-xs font-black text-muted-foreground group-hover/toggle:text-foreground transition-colors"
                >{{ t('animeSearch.cutBorders') }}</span
              >
            </label>
          </div>
        </div>
      </div>

      <!-- Stage 2: Result Stage (Single Column) -->
      <div v-if="file" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <!-- Top Status Bar -->
        <div
          class="flex flex-col md:flex-row items-center gap-6 p-4 md:p-6 bg-card/40 border border-muted/60 rounded-3xl shadow-sm"
        >
          <div class="flex items-center gap-4 flex-1 min-w-0">
            <div
              class="w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-black/20 border border-muted/30"
            >
              <img :src="previewUrl" class="w-full h-full object-cover" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <Layers class="h-3.5 w-3.5 text-indigo-500" />
                <span
                  class="text-[10px] uppercase font-black text-muted-foreground tracking-widest"
                  >{{ t('animeSearch.searchingSource') }}</span
                >
              </div>
              <h4 class="text-sm font-black text-foreground truncate max-w-sm">{{ file.name }}</h4>
              <p class="text-[11px] text-muted-foreground font-bold">
                {{ (file.size / 1024 / 1024).toFixed(2) }} MB
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button
              class="px-5 py-2.5 bg-muted/30 hover:bg-muted/50 text-xs font-black rounded-xl transition-all flex items-center gap-2 border border-muted/30"
              @click="fileInput?.click()"
            >
              <Upload class="h-4 w-4" />
              {{ t('exif.changeImage') }}
            </button>
          </div>
        </div>

        <!-- Progress/Status -->
        <div
          v-if="loading"
          class="py-20 flex flex-col items-center justify-center gap-6 bg-card/20 rounded-3xl border border-muted/40"
        >
          <div
            class="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"
          ></div>
          <div class="text-center">
            <p class="text-lg font-black text-foreground">{{ t('animeSearch.uploading') }}</p>
            <p class="text-sm text-muted-foreground">{{ t('animeSearch.analysing') }}</p>
          </div>
        </div>

        <div
          v-else-if="error"
          class="p-12 bg-destructive/5 border border-destructive/10 rounded-3xl text-center space-y-4"
        >
          <Info class="h-10 w-10 text-destructive mx-auto opacity-50" />
          <p class="text-base font-black text-destructive">{{ error }}</p>
          <button
            @click="searchAnime"
            class="px-8 py-2.5 bg-destructive text-white rounded-xl text-sm font-black shadow-lg shadow-destructive/20"
          >
            {{ t('common.confirm') }}
          </button>
        </div>

        <!-- Results Column -->
        <div v-else-if="results.length" class="space-y-6">
          <div
            v-for="(res, idx) in results"
            :key="idx"
            class="bg-card/40 border border-muted/60 rounded-[32px] overflow-hidden hover:border-indigo-500/40 transition-all duration-300 group shadow-sm hover:shadow-xl hover:shadow-indigo-500/5"
          >
            <div class="flex flex-col md:flex-row">
              <!-- Thumbnail Side -->
              <div
                class="w-full md:w-64 shrink-0 aspect-16/10 md:h-auto bg-black/40 relative group/video border-b md:border-b-0 md:border-r border-muted/20"
              >
                <video
                  :src="res.video"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loop
                  muted
                  playsinline
                  autoplay
                ></video>
                <div
                  class="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded-lg text-[10px] text-white font-mono border border-white/10"
                >
                  {{ formatTime(res.at) }}
                </div>
                <div
                  class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity pointer-events-none"
                >
                  <div class="bg-indigo-500/80 p-3 rounded-full shadow-2xl">
                    <Play class="h-6 w-6 text-white fill-white" />
                  </div>
                </div>
              </div>

              <!-- Content Side -->
              <div class="flex-1 p-6 md:p-8 min-w-0 flex flex-col">
                <div class="flex items-start justify-between gap-6 mb-4">
                  <div class="min-w-0 flex-1">
                    <h3
                      class="text-lg md:text-xl font-black text-foreground leading-tight tracking-tight mb-2 group-hover:text-indigo-500 transition-colors"
                    >
                      {{
                        res.anilist?.title?.chinese ||
                        res.anilist?.title?.romaji ||
                        res.anilist?.title?.native ||
                        res.filename
                      }}
                    </h3>
                    <div class="flex items-center gap-3">
                      <p
                        v-if="res.anilist?.title?.english"
                        class="text-xs text-muted-foreground font-bold line-clamp-1 italic"
                      >
                        {{ res.anilist.title.english }}
                      </p>
                    </div>
                  </div>

                  <div class="text-right shrink-0">
                    <div
                      class="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1"
                    >
                      {{ t('animeSearch.confidence') }}
                    </div>
                    <div
                      class="text-2xl font-black tabular-nums leading-none"
                      :class="res.similarity > 0.9 ? 'text-emerald-500' : 'text-amber-500'"
                    >
                      {{ (res.similarity * 100).toFixed(1) }}%
                    </div>
                  </div>
                </div>

                <!-- Info Grid -->
                <div
                  class="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 pt-4 border-t border-muted/20"
                >
                  <div class="space-y-1">
                    <p
                      class="text-[10px] font-black text-muted-foreground/50 uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <Monitor class="h-3 w-3" /> {{ t('animeSearch.format') }}
                    </p>
                    <p class="text-[13px] font-black text-foreground/90">
                      {{ res.anilist?.format || 'TV' }}
                    </p>
                  </div>
                  <div class="space-y-1">
                    <p
                      class="text-[10px] font-black text-muted-foreground/50 uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <Play class="h-3 w-3" /> {{ t('animeSearch.episode') }}
                    </p>
                    <p class="text-[13px] font-black text-foreground/90">
                      {{ res.episode || '1' }}
                    </p>
                  </div>
                  <div class="space-y-1">
                    <p
                      class="text-[10px] font-black text-muted-foreground/50 uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <User class="h-3 w-3" /> {{ t('animeSearch.studio') }}
                    </p>
                    <p class="text-[13px] font-black text-foreground/90 truncate">
                      {{ getStudioName(res) }}
                    </p>
                  </div>
                  <div class="space-y-1">
                    <p
                      class="text-[10px] font-black text-muted-foreground/50 uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <Calendar class="h-3 w-3" /> {{ t('animeSearch.season') }}
                    </p>
                    <p class="text-[13px] font-black text-foreground/90">{{ getStartDate(res) }}</p>
                  </div>
                </div>

                <!-- Action Bar -->
                <div
                  class="mt-8 pt-6 border-t border-muted/10 flex flex-wrap items-center justify-between gap-4"
                >
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="g in res.anilist?.genres?.slice(0, 4)"
                      :key="g"
                      class="px-3 py-1 bg-muted/30 text-muted-foreground text-[10px] font-black rounded-lg uppercase tracking-wider"
                    >
                      {{ g }}
                    </span>
                  </div>

                  <div class="flex items-center gap-4">
                    <a
                      v-if="res.anilist?.id"
                      :href="`https://anilist.co/anime/${res.anilist.id}`"
                      target="_blank"
                      class="px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                      <ExternalLink class="h-4 w-4" />
                      {{ t('animeSearch.anilistInfo') }}
                    </a>

                    <div class="flex items-center gap-2">
                      <a
                        v-for="link in res.anilist?.externalLinks?.slice(0, 3)"
                        :key="link.id"
                        :href="link.url"
                        target="_blank"
                        class="w-10 h-10 rounded-xl bg-muted/40 hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-500 border border-muted flex items-center justify-center transition-all"
                        :title="link.site"
                      >
                        <component :is="getLinkIcon(link.site)" class="h-4.5 w-4.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>

<style scoped>
.animate-in {
  animation-duration: 0.5s;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
