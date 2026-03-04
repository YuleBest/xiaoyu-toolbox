<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search, Play, Pause, Volume2, ChevronRight, Loader2, X, Download } from 'lucide-vue-next'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import { allTools } from '@/config/tools'
import { getHeroList, getHeroImages, type Hero } from '@/api/hok'

const { t } = useI18n()
const showToast = inject('showToast') as (msg: string, type?: 'warning' | 'error') => void

const tool = allTools.find((t) => t.id === 'hok-voices')!

// ===== Types =====
interface VoiceLine {
  heroName: string
  skinName: string
  category: string
  line: string
  url: string
}

// ===== State =====
const allVoices = ref<VoiceLine[]>([])
const heroData = ref<Hero[]>([])
const heroImages = ref<Record<string, string>>({})
const loading = ref(true)

const searchQuery = ref('')
const selectedHero = ref('')
const selectedSkin = ref('')
const selectedRole = ref('all')

// Audio playback
const currentAudio = ref<HTMLAudioElement | null>(null)
const playingUrl = ref('')
const isPlaying = ref(false)

// ===== Hero meta helpers =====
// Map from cname → Hero
const heroByName = computed(() => {
  const m = new Map<string, Hero>()
  heroData.value.forEach((h) => m.set(h.cname, h))
  return m
})

const getHeroInfo = (name: string) => heroByName.value.get(name)
const getHeroAvatar = (name: string) => {
  const hero = getHeroInfo(name)
  return hero ? (heroImages.value[String(hero.ename)] ?? '') : ''
}

const heroTypeName = (type: number) => {
  const names: Record<number, string> = {
    1: t('hok.warrior'),
    2: t('hok.mage'),
    3: t('hok.tank'),
    4: t('hok.assassin'),
    5: t('hok.marksman'),
    6: t('hok.support'),
  }
  return names[type] ?? t('hok.unknown')
}

const heroTypeColor = (type: number) => {
  const colors: Record<number, string> = {
    1: 'bg-red-500/15 text-red-500',
    2: 'bg-blue-500/15 text-blue-500',
    3: 'bg-green-500/15 text-green-500',
    4: 'bg-purple-500/15 text-purple-500',
    5: 'bg-orange-500/15 text-orange-500',
    6: 'bg-cyan-500/15 text-cyan-500',
  }
  return colors[type] ?? 'bg-muted text-muted-foreground'
}

// ===== Derived =====
// All hero names that appear in voices data
const voiceHeroNames = computed(() => {
  const set = new Set<string>()
  allVoices.value.forEach((v) => set.add(v.heroName))
  return set
})

// All roles present in the voice hero set
const roleList = computed(() => {
  const roles = new Set<number>()
  voiceHeroNames.value.forEach((name) => {
    const h = getHeroInfo(name)
    if (h) {
      roles.add(h.hero_type)
      if (h.hero_type2) roles.add(h.hero_type2)
    }
  })
  return Array.from(roles).sort((a, b) => a - b)
})

// Filtered hero list (by role)
const filteredHeroList = computed(() => {
  const names = Array.from(voiceHeroNames.value)
  if (selectedRole.value === 'all') return names
  const roleNum = parseInt(selectedRole.value)
  return names.filter((name) => {
    const h = getHeroInfo(name)
    return h && (h.hero_type === roleNum || h.hero_type2 === roleNum)
  })
})

const skinList = computed(() => {
  if (!selectedHero.value) return []
  const set = new Set<string>()
  allVoices.value
    .filter((v) => v.heroName === selectedHero.value)
    .forEach((v) => set.add(v.skinName))
  return Array.from(set)
})

const filteredVoices = computed(() => {
  if (!selectedHero.value) return []
  let list = allVoices.value.filter((v) => v.heroName === selectedHero.value)
  if (selectedSkin.value) list = list.filter((v) => v.skinName === selectedSkin.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter((v) => v.line.toLowerCase().includes(q))
  }
  return list
})

interface GroupedSkin {
  skinName: string
  lines: VoiceLine[]
}
interface GroupedHero {
  heroName: string
  skins: GroupedSkin[]
}

const groupedVoices = computed<GroupedHero[]>(() => {
  const heroMap = new Map<string, Map<string, VoiceLine[]>>()
  for (const v of filteredVoices.value) {
    if (!heroMap.has(v.heroName)) heroMap.set(v.heroName, new Map())
    const skinMap = heroMap.get(v.heroName)!
    if (!skinMap.has(v.skinName)) skinMap.set(v.skinName, [])
    skinMap.get(v.skinName)!.push(v)
  }
  return Array.from(heroMap.entries()).map(([heroName, skinMap]) => ({
    heroName,
    skins: Array.from(skinMap.entries()).map(([skinName, lines]) => ({ skinName, lines })),
  }))
})

// ===== Methods =====
const selectHero = (hero: string) => {
  if (selectedHero.value === hero) {
    selectedHero.value = ''
    selectedSkin.value = ''
  } else {
    selectedHero.value = hero
    selectedSkin.value = ''
  }
}

const selectSkin = (skin: string) => {
  selectedSkin.value = selectedSkin.value === skin ? '' : skin
}

const stopAudio = () => {
  if (currentAudio.value) {
    currentAudio.value.pause()
    currentAudio.value.currentTime = 0
    currentAudio.value = null
  }
  playingUrl.value = ''
  isPlaying.value = false
}

const togglePlay = (voice: VoiceLine) => {
  if (playingUrl.value === voice.url && isPlaying.value) {
    stopAudio()
    return
  }
  stopAudio()
  const audio = new Audio(voice.url)
  currentAudio.value = audio
  playingUrl.value = voice.url
  isPlaying.value = true
  audio.play().catch(() => {
    showToast(t('hokVoices.playFailed'), 'error')
    stopAudio()
  })
  audio.onended = () => {
    playingUrl.value = ''
    isPlaying.value = false
    currentAudio.value = null
  }
}

const downloadVoice = async (voice: VoiceLine, e: MouseEvent) => {
  e.stopPropagation()
  try {
    const res = await fetch(voice.url)
    const blob = await res.blob()
    const a = document.createElement('a')
    const urlPart = voice.url.split('/').pop() || `${voice.heroName}_${voice.skinName}.mp3`
    a.href = URL.createObjectURL(blob)
    a.download = urlPart
    a.click()
    URL.revokeObjectURL(a.href)
  } catch {
    showToast(t('hokVoices.downloadFailed'), 'error')
  }
}

onMounted(async () => {
  try {
    const [voices, heroes, images] = await Promise.all([
      fetch('/database/hok-voices/voices.min.json').then((r) => r.json()),
      getHeroList(),
      getHeroImages(),
    ])
    allVoices.value = voices
    heroData.value = heroes
    heroImages.value = images
  } catch {
    showToast(t('hokVoices.loadFailed'), 'error')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="space-y-5 max-w-5xl mx-auto">
      <!-- Search Bar -->
      <div class="relative">
        <Search
          class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
        />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('hokVoices.searchPlaceholder')"
          class="w-full pl-11 pr-4 py-3 bg-card/30 border border-muted/80 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all"
        />
      </div>

      <!-- Hero Filter Panel -->
      <div class="bg-card/30 border border-muted/80 rounded-3xl p-5 space-y-4">
        <!-- Role Filter Tabs -->
        <div class="flex flex-wrap gap-1.5">
          <button
            class="px-2.5 py-1 text-xs rounded-lg transition-all border"
            :class="
              selectedRole === 'all'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-muted/30 border-muted/60 text-muted-foreground hover:border-amber-500/40'
            "
            @click="selectedRole = 'all'"
          >
            {{ t('hok.all') }}
          </button>
          <button
            v-for="role in roleList"
            :key="role"
            class="px-2.5 py-1 text-xs rounded-lg transition-all border"
            :class="
              selectedRole === String(role)
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-muted/30 border-muted/60 text-muted-foreground hover:border-amber-500/40'
            "
            @click="selectedRole = String(role)"
          >
            {{ heroTypeName(role) }}
          </button>
        </div>

        <!-- Hero Avatar Grid -->
        <div v-if="loading" class="flex justify-center py-6">
          <Loader2 class="h-6 w-6 text-amber-500 animate-spin" />
        </div>
        <div v-else class="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-11 gap-2">
          <button
            v-for="hero in filteredHeroList"
            :key="hero"
            class="group flex flex-col items-center gap-1 p-1 rounded-xl transition-all"
            :class="
              selectedHero === hero
                ? 'bg-amber-500/15 ring-2 ring-amber-500/60'
                : 'hover:bg-muted/40'
            "
            @click="selectHero(hero)"
          >
            <!-- Avatar -->
            <div class="relative w-full aspect-square">
              <img
                v-if="getHeroAvatar(hero)"
                :src="getHeroAvatar(hero)"
                :alt="hero"
                class="w-full h-full object-cover rounded-lg"
                loading="lazy"
              />
              <div
                v-else
                class="w-full h-full rounded-lg bg-muted/30 flex items-center justify-center"
              >
                <Volume2 class="h-4 w-4 text-muted-foreground/40" />
              </div>
              <!-- Role badge overlay -->
              <span
                v-if="getHeroInfo(hero)"
                class="absolute bottom-0 left-0 right-0 text-center text-[9px] font-semibold px-0.5 py-px rounded-b-lg leading-tight"
                :class="heroTypeColor(getHeroInfo(hero)!.hero_type)"
              >
                {{ heroTypeName(getHeroInfo(hero)!.hero_type) }}
              </span>
            </div>
            <!-- Name -->
            <span
              class="text-[10px] leading-tight text-center truncate w-full"
              :class="
                selectedHero === hero
                  ? 'text-amber-600 dark:text-amber-400 font-semibold'
                  : 'text-muted-foreground'
              "
            >
              {{ hero }}
            </span>
          </button>
        </div>

        <!-- Skin Filter -->
        <div v-if="selectedHero && skinList.length > 1" class="pt-2 border-t border-muted/50">
          <p class="text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-2">
            {{ t('hokVoices.selectSkin') }}
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="skin in skinList"
              :key="skin"
              class="px-3 py-1 text-xs rounded-lg transition-all border"
              :class="
                selectedSkin === skin
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/50 font-semibold'
                  : 'bg-muted/20 border-muted/50 text-muted-foreground hover:border-amber-500/30'
              "
              @click="selectSkin(skin)"
            >
              {{ skin }}
            </button>
          </div>
        </div>

        <!-- Count & clear -->
        <div class="flex items-center gap-3 pt-1">
          <p class="text-xs text-muted-foreground flex-1">
            {{ t('hokVoices.resultCount', { count: filteredVoices.length }) }}
          </p>
          <button
            v-if="selectedHero || selectedSkin || searchQuery"
            class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            @click="
              () => {
                selectedHero = ''
                selectedSkin = ''
                searchQuery = ''
              }
            "
          >
            <X class="h-3 w-3" />
            {{ t('hokVoices.clearFilters') }}
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-16">
        <Loader2 class="h-10 w-10 text-amber-500 animate-spin" />
      </div>

      <!-- No hero selected hint -->
      <div v-else-if="!selectedHero && !loading" class="text-center py-16 text-muted-foreground">
        <Volume2 class="h-12 w-12 mx-auto mb-3 opacity-20" />
        <p class="text-sm">{{ t('hokVoices.selectHeroHint') }}</p>
      </div>

      <!-- Empty search results -->
      <div
        v-else-if="filteredVoices.length === 0 && !loading"
        class="text-center py-16 text-muted-foreground"
      >
        <Volume2 class="h-12 w-12 mx-auto mb-3 opacity-20" />
        <p class="text-sm">{{ t('hokVoices.noResults') }}</p>
      </div>

      <!-- Voice Groups -->
      <div v-else class="space-y-5">
        <div
          v-for="heroGroup in groupedVoices"
          :key="heroGroup.heroName"
          class="bg-card/30 border border-muted/80 rounded-3xl overflow-hidden"
        >
          <!-- Hero Header -->
          <div class="flex items-center gap-3 px-5 py-4 border-b border-muted/50">
            <!-- Avatar thumbnail in header -->
            <img
              v-if="getHeroAvatar(heroGroup.heroName)"
              :src="getHeroAvatar(heroGroup.heroName)"
              :alt="heroGroup.heroName"
              class="w-10 h-10 rounded-xl object-cover shrink-0"
            />
            <div
              v-else
              class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0"
            >
              <Volume2 class="h-5 w-5 text-amber-500" />
            </div>
            <div class="flex-1 min-w-0">
              <h2 class="text-sm font-bold text-important">{{ heroGroup.heroName }}</h2>
              <div v-if="getHeroInfo(heroGroup.heroName)" class="flex gap-1 mt-0.5">
                <span
                  class="text-[9px] font-semibold px-1.5 py-px rounded-md"
                  :class="heroTypeColor(getHeroInfo(heroGroup.heroName)!.hero_type)"
                >
                  {{ heroTypeName(getHeroInfo(heroGroup.heroName)!.hero_type) }}
                </span>
                <span
                  v-if="getHeroInfo(heroGroup.heroName)!.hero_type2"
                  class="text-[9px] font-semibold px-1.5 py-px rounded-md"
                  :class="heroTypeColor(getHeroInfo(heroGroup.heroName)!.hero_type2!)"
                >
                  {{ heroTypeName(getHeroInfo(heroGroup.heroName)!.hero_type2!) }}
                </span>
              </div>
            </div>
            <span class="text-xs text-muted-foreground shrink-0">
              {{ heroGroup.skins.reduce((sum, s) => sum + s.lines.length, 0) }}
              {{ t('hokVoices.lines') }}
            </span>
          </div>

          <!-- Skins -->
          <div class="divide-y divide-muted/30">
            <div v-for="skinGroup in heroGroup.skins" :key="skinGroup.skinName">
              <div class="flex items-center gap-2 px-5 py-2 bg-muted/10">
                <ChevronRight class="h-3 w-3 text-muted-foreground" />
                <span class="text-xs font-medium text-muted-foreground">
                  {{ skinGroup.skinName }}
                </span>
                <span class="text-[10px] text-muted-foreground/60 ml-auto">
                  {{ skinGroup.lines.length }} {{ t('hokVoices.lines') }}
                </span>
              </div>

              <!-- Voice Lines -->
              <div class="divide-y divide-muted/20">
                <button
                  v-for="voice in skinGroup.lines"
                  :key="voice.url"
                  class="w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-muted/20 group"
                  :class="playingUrl === voice.url && isPlaying ? 'bg-amber-500/5' : ''"
                  @click="togglePlay(voice)"
                >
                  <!-- Play indicator -->
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all"
                    :class="
                      playingUrl === voice.url && isPlaying
                        ? 'bg-amber-500 text-white'
                        : 'bg-muted/30 text-muted-foreground group-hover:bg-amber-500/20 group-hover:text-amber-500'
                    "
                  >
                    <Pause v-if="playingUrl === voice.url && isPlaying" class="h-3.5 w-3.5" />
                    <Play v-else class="h-3.5 w-3.5 translate-x-px" />
                  </div>

                  <!-- Line text -->
                  <p
                    class="text-sm flex-1 leading-relaxed"
                    :class="
                      playingUrl === voice.url && isPlaying
                        ? 'text-amber-600 dark:text-amber-400 font-medium'
                        : 'text-foreground'
                    "
                  >
                    {{ voice.line }}
                  </p>

                  <!-- Playing wave animation -->
                  <div
                    v-if="playingUrl === voice.url && isPlaying"
                    class="flex items-end gap-0.5 shrink-0"
                  >
                    <span class="w-0.5 h-3 bg-amber-500 rounded-full animate-wave1" />
                    <span class="w-0.5 h-4 bg-amber-500 rounded-full animate-wave2" />
                    <span class="w-0.5 h-2 bg-amber-500 rounded-full animate-wave3" />
                    <span class="w-0.5 h-4 bg-amber-500 rounded-full animate-wave2" />
                    <span class="w-0.5 h-3 bg-amber-500 rounded-full animate-wave1" />
                  </div>

                  <!-- Download button -->
                  <div
                    class="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    @click="(e) => downloadVoice(voice, e)"
                  >
                    <div
                      class="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-all"
                    >
                      <Download class="h-3.5 w-3.5" />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>

<style scoped>
@keyframes wave1 {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.4);
  }
}
@keyframes wave2 {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.5);
  }
}
@keyframes wave3 {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.7);
  }
}
.animate-wave1 {
  animation: wave1 0.8s ease-in-out infinite;
}
.animate-wave2 {
  animation: wave2 0.8s ease-in-out infinite 0.15s;
}
.animate-wave3 {
  animation: wave3 0.8s ease-in-out infinite 0.3s;
}
</style>
