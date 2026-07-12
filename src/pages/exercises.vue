<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dumbbell, Search, X, User, Target, ChevronRight, XIcon } from 'lucide-vue-next'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import { allTools } from '@/config/tools'
import { Sheet, SheetContent, SheetTitle, SheetClose } from '@/components/ui/sheet'

const { t } = useI18n()
const tool = allTools.find((t2) => t2.id === 'exercises')!

// ========= 类型定义 =========
interface Exercise {
  id: string
  name: string
  category: string
  body_part: string
  equipment: string
  instruction_steps: string[]
  muscle_group: string
  secondary_muscles: string[]
  target: string
  image: string
  gif_url: string
  media_id: string
}

// ========= 中文映射 =========
const CATEGORY_MAP: Record<string, string> = {
  back: '背部',
  cardio: '有氧',
  chest: '胸部',
  'lower arms': '前臂',
  'lower legs': '小腿',
  neck: '颈部',
  shoulders: '肩部',
  'upper arms': '上臂',
  'upper legs': '大腿',
  waist: '腰部',
}

const EQUIPMENT_MAP: Record<string, string> = {
  'body weight': '徒手',
  dumbbell: '哑铃',
  barbell: '杠铃',
  cable: '绳索',
  band: '弹力带',
  kettlebell: '壶铃',
  'resistance band': '阻力带',
  'medicine ball': '药球',
  'stability ball': '稳定球',
  'bosu ball': '波速球',
  'smith machine': '史密斯机',
  'leverage machine': '杠杆机',
  'ez barbell': 'EZ杠铃',
  'olympic barbell': '奥杆',
  'trap bar': '六角杠',
  assisted: '辅助',
  weighted: '负重',
  hammer: '锤子',
  roller: '滚筒',
  rope: '绳',
  tire: '轮胎',
  'wheel roller': '健腹轮',
  'elliptical machine': '椭圆机',
  'stationary bike': '动感单车',
  'skierg machine': '滑雪机',
  'sled machine': '雪橇机',
  'stepmill machine': '台阶机',
  'upper body ergometer': '上肢测功仪',
}

const TARGET_MAP: Record<string, string> = {
  abs: '腹肌',
  biceps: '肱二头肌',
  calves: '小腿肌',
  delts: '三角肌',
  forearms: '前臂',
  glutes: '臀肌',
  hamstrings: '腘绳肌',
  lats: '背阔肌',
  pectorals: '胸肌',
  quads: '股四头肌',
  traps: '斜方肌',
  triceps: '肱三头肌',
  abductors: '外展肌',
  adductors: '内收肌',
  'cardiovascular system': '心血管',
  'levator scapulae': '肩胛提肌',
  'serratus anterior': '前锯肌',
  spine: '脊柱',
  'upper back': '上背',
}

const PRIORITY_EQUIPMENTS = ['body weight', 'dumbbell', 'barbell', 'cable', 'band', 'kettlebell']

// ========= 状态 =========
const allExercises = ref<Exercise[]>([])
const loading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedEquipment = ref('')
const selectedExercise = ref<Exercise | null>(null)
const detailOpen = ref(false)
const pageSize = 24
const currentPage = ref(1)

// ========= 数据加载 =========
onMounted(async () => {
  try {
    const resp = await fetch('/database/exercises/data.min.json')
    const data = await resp.json()
    allExercises.value = data as Exercise[]
  } catch {
    // fallback
  } finally {
    loading.value = false
  }
})

// ========= 计算属性 =========
const categories = computed(() => {
  const set = new Set<string>()
  allExercises.value.forEach((e) => set.add(e.category))
  return Array.from(set).sort((a, b) => (CATEGORY_MAP[a] || a).localeCompare(CATEGORY_MAP[b] || b))
})

const equipments = computed(() => {
  const set = new Set<string>()
  allExercises.value.forEach((e) => set.add(e.equipment))
  const eqs = Array.from(set)
  return eqs.sort((a, b) => {
    const aIdx = PRIORITY_EQUIPMENTS.indexOf(a)
    const bIdx = PRIORITY_EQUIPMENTS.indexOf(b)
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
    if (aIdx !== -1) return -1
    if (bIdx !== -1) return 1
    return (EQUIPMENT_MAP[a] || a).localeCompare(EQUIPMENT_MAP[b] || b)
  })
})

const filteredExercises = computed(() => {
  let list = allExercises.value
  if (selectedCategory.value) {
    list = list.filter((e) => e.category === selectedCategory.value)
  }
  if (selectedEquipment.value) {
    list = list.filter((e) => e.equipment === selectedEquipment.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter((e) => e.name.toLowerCase().includes(q))
  }
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredExercises.value.length / pageSize)))

const displayedExercises = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredExercises.value.slice(start, start + pageSize)
})

const imageUrl = (exercise: Exercise) => {
  const img = exercise.image
  if (!img) return ''
  return `https://exercises-dataset.yule.ink/${img}`
}

// ========= 方法 =========
const selectCategory = (cat: string) => {
  selectedCategory.value = selectedCategory.value === cat ? '' : cat
  currentPage.value = 1
}

const selectEquipment = (eq: string) => {
  selectedEquipment.value = selectedEquipment.value === eq ? '' : eq
  currentPage.value = 1
}

const openDetail = (exercise: Exercise) => {
  selectedExercise.value = exercise
  detailOpen.value = true
}

const goToPage = (page: number) => {
  currentPage.value = Math.max(1, Math.min(page, totalPages.value))
}

const resetFilters = () => {
  selectedCategory.value = ''
  selectedEquipment.value = ''
  searchQuery.value = ''
  currentPage.value = 1
}

const clearCategory = () => {
  selectedCategory.value = ''
  currentPage.value = 1
}

const clearEquipment = () => {
  selectedEquipment.value = ''
  currentPage.value = 1
}

const onSearchInput = () => {
  currentPage.value = 1
}
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="space-y-5 max-w-3xl mx-auto">
      <!-- Filters Card -->
      <div class="bg-card/30 border border-muted/80 rounded-3xl p-4 md:p-5 space-y-4">
        <!-- Search -->
        <div class="relative">
          <Search
            class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('exercises.searchPlaceholder')"
            class="w-full pl-10 pr-4 py-2.5 bg-background border border-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
            @input="onSearchInput"
          />
          <button
            v-if="searchQuery"
            class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-muted/50 transition-colors"
            @click="searchQuery = ''"
          >
            <X class="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        <!-- Body Part -->
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-[11px] font-semibold text-muted-foreground mr-1 shrink-0"
            >{{ t('exercises.bodyPart') }}：</span
          >
          <button
            class="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border"
            :class="
              selectedCategory === ''
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-background border-muted text-muted-foreground hover:text-foreground'
            "
            @click="clearCategory"
          >
            {{ t('common.all') }}
          </button>
          <button
            v-for="cat in categories"
            :key="cat"
            class="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border"
            :class="
              selectedCategory === cat
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-background border-muted text-muted-foreground hover:text-foreground'
            "
            @click="selectCategory(cat)"
          >
            {{ CATEGORY_MAP[cat] || cat }}
          </button>
        </div>

        <!-- Equipment -->
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-[11px] font-semibold text-muted-foreground mr-1 shrink-0"
            >{{ t('exercises.equipment') }}：</span
          >
          <button
            class="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border"
            :class="
              selectedEquipment === ''
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-background border-muted text-muted-foreground hover:text-foreground'
            "
            @click="clearEquipment"
          >
            {{ t('common.all') }}
          </button>
          <button
            v-for="eq in equipments"
            :key="eq"
            class="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border"
            :class="
              selectedEquipment === eq
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-background border-muted text-muted-foreground hover:text-foreground'
            "
            @click="selectEquipment(eq)"
          >
            {{ EQUIPMENT_MAP[eq] || eq }}
          </button>
        </div>
      </div>

      <!-- Stats Bar -->
      <div v-if="!loading" class="flex items-center justify-between px-2">
        <span class="text-xs text-muted-foreground">
          {{ t('exercises.found', { count: filteredExercises.length }) }}
        </span>
        <button
          v-if="selectedCategory || selectedEquipment || searchQuery"
          class="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
          @click="resetFilters"
        >
          {{ t('common.reset') }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center gap-3 py-16">
        <div
          class="h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"
        />
        <span class="text-sm text-muted-foreground font-medium">{{ t('common.loading') }}</span>
      </div>

      <!-- Exercise List -->
      <div
        v-else-if="filteredExercises.length > 0"
        class="bg-card/30 border border-muted/80 rounded-3xl overflow-hidden divide-y divide-muted/20"
      >
        <button
          v-for="exercise in displayedExercises"
          :key="exercise.id"
          class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/20 transition-colors group"
          @click="openDetail(exercise)"
        >
          <!-- Thumbnail -->
          <div class="relative h-14 w-14 rounded-xl bg-muted/20 overflow-hidden shrink-0">
            <img
              :src="imageUrl(exercise)"
              :alt="exercise.name"
              loading="lazy"
              class="h-full w-full object-cover"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
            <div class="absolute inset-0 flex items-center justify-center">
              <Dumbbell class="h-5 w-5 text-muted-foreground/20" />
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p
              class="text-[13px] font-semibold text-foreground truncate group-hover:text-orange-500 transition-colors"
            >
              {{ exercise.name }}
            </p>
            <div class="flex flex-wrap items-center gap-1.5 mt-1">
              <span
                class="text-[10px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded font-medium"
              >
                {{ CATEGORY_MAP[exercise.category] || exercise.category }}
              </span>
              <span class="text-[10px] text-muted-foreground/50">·</span>
              <span class="text-[10px] text-muted-foreground/50">{{
                EQUIPMENT_MAP[exercise.equipment] || exercise.equipment
              }}</span>
              <span class="text-[10px] text-muted-foreground/50">·</span>
              <span class="text-[10px] text-muted-foreground/50">{{
                TARGET_MAP[exercise.target] || exercise.target
              }}</span>
            </div>
          </div>

          <ChevronRight
            class="h-4 w-4 text-muted-foreground/30 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all shrink-0"
          />
        </button>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1 && !loading" class="flex items-center justify-center gap-2 pb-4">
        <button
          class="px-3 py-2 bg-background border border-muted rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
        >
          {{ t('common.prevPage') }}
        </button>

        <template v-for="p in totalPages" :key="p">
          <button
            v-if="p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)"
            class="min-w-[36px] px-2 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 border"
            :class="
              p === currentPage
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-background border-muted text-muted-foreground hover:text-foreground'
            "
            @click="goToPage(p)"
          >
            {{ p }}
          </button>
          <span
            v-else-if="p === currentPage - 2 || p === currentPage + 2"
            class="text-xs text-muted-foreground/40 px-0.5"
            >…</span
          >
        </template>

        <button
          class="px-3 py-2 bg-background border border-muted rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
        >
          {{ t('common.nextPage') }}
        </button>
      </div>

      <!-- Empty -->
      <div
        v-if="filteredExercises.length === 0 && !loading"
        class="flex flex-col items-center gap-4 py-16 opacity-40"
      >
        <Dumbbell class="h-12 w-12" />
        <p class="text-sm font-medium">{{ t('exercises.noResults') }}</p>
      </div>
    </div>

    <!-- Detail Sheet -->
    <Sheet v-model:open="detailOpen">
      <SheetContent
        side="bottom"
        class="h-[90vh] max-h-[90vh] rounded-t-3xl p-0 max-w-2xl mx-auto flex flex-col"
      >
        <div v-if="selectedExercise" class="flex flex-col h-full">
          <!-- Drag Handle + Close -->
          <div class="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
            <div class="w-10 h-1 rounded-full bg-muted-foreground/20" />
            <SheetClose class="rounded-full p-1.5 hover:bg-muted/50 transition-colors ml-auto">
              <XIcon class="h-5 w-5 text-muted-foreground" />
            </SheetClose>
          </div>

          <!-- Scrollable Content -->
          <div class="flex-1 overflow-y-auto px-5 pb-8 space-y-5">
            <!-- Image -->
            <div class="relative aspect-[16/10] rounded-2xl overflow-hidden bg-muted/20">
              <img
                :src="imageUrl(selectedExercise)"
                :alt="selectedExercise.name"
                class="w-full h-full object-contain bg-black/5 dark:bg-white/5"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              />
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Dumbbell class="h-10 w-10 text-muted-foreground/20" />
              </div>
            </div>

            <!-- Title & Category -->
            <div>
              <SheetTitle class="text-lg font-bold">
                {{ selectedExercise.name }}
              </SheetTitle>
              <p class="text-sm text-muted-foreground mt-0.5">
                {{ CATEGORY_MAP[selectedExercise.category] || selectedExercise.category }}
              </p>
            </div>

            <!-- Meta Chips -->
            <div class="flex flex-wrap gap-2">
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-500 text-xs font-medium"
              >
                <Target class="h-3.5 w-3.5" />
                {{ TARGET_MAP[selectedExercise.target] || selectedExercise.target }}
              </span>
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-500 text-xs font-medium"
              >
                <Dumbbell class="h-3.5 w-3.5" />
                {{ EQUIPMENT_MAP[selectedExercise.equipment] || selectedExercise.equipment }}
              </span>
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-500 text-xs font-medium"
              >
                <User class="h-3.5 w-3.5" />
                {{ selectedExercise.muscle_group }}
              </span>
            </div>

            <!-- Secondary Muscles -->
            <p
              v-if="selectedExercise.secondary_muscles?.length"
              class="text-xs text-muted-foreground"
            >
              <span class="font-medium">{{ t('exercises.secondaryMuscles') }}：</span>
              {{ selectedExercise.secondary_muscles.join('、') }}
            </p>

            <!-- Divider -->
            <hr class="border-muted/30" />

            <!-- Steps -->
            <div class="space-y-3">
              <h4 class="text-sm font-semibold text-foreground flex items-center gap-2">
                <span
                  class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold"
                  >!</span
                >
                {{ t('exercises.steps') }}
              </h4>
              <ol class="space-y-3 list-none pl-0">
                <li
                  v-for="(step, idx) in selectedExercise.instruction_steps"
                  :key="idx"
                  class="flex gap-3"
                >
                  <span
                    class="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-xs font-bold mt-0.5"
                  >
                    {{ idx + 1 }}
                  </span>
                  <span class="text-[13px] leading-relaxed text-foreground/80">{{ step }}</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  </ToolContainer>
</template>
