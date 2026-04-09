<script setup lang="ts">
import { ref, computed, watch, onMounted, shallowRef, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { MapPin, Search, Copy, Check, X, Loader2 } from 'lucide-vue-next'
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

const { t } = useI18n()
const route = useRoute()
const tool = allTools.find((t) => t.id === 'adoc')!

// Types
interface AreaNode {
  code: string
  name: string
  children?: AreaNode[]
}

interface SearchResult {
  code: string
  name: string
  fullPath: string
  level: number
}

// Data
const treeData = ref<AreaNode[]>([])
const dataLoaded = ref(false)
const loadingError = ref('')
const flatData = shallowRef<SearchResult[]>([])
const fuseInstance = shallowRef<Fuse<SearchResult> | null>(null)

// Selection
const selectedProvince = ref<AreaNode | null>(null)
const selectedCity = ref<AreaNode | null>(null)
const selectedDistrict = ref<AreaNode | null>(null)
const selectedStreet = ref<AreaNode | null>(null)

// Search
const searchQuery = ref('')
const searchResults = ref<SearchResult[]>([])
const isSearching = ref(false)

// UI
const copiedCode = ref(false)
const copiedPath = ref(false)

// Flatten tree for search
const flattenTree = (nodes: AreaNode[], level: number, path: string[], results: SearchResult[]) => {
  for (const node of nodes) {
    const currentPath = [...path, node.name]
    results.push({
      code: node.code,
      name: node.name,
      fullPath: currentPath.join(' > '),
      level,
    })
    if (node.children) {
      flattenTree(node.children, level + 1, currentPath, results)
    }
  }
}

// Initialize Fuse with flat data
const initFuse = () => {
  const allNodes: SearchResult[] = []
  flattenTree(treeData.value, 0, [], allNodes)
  flatData.value = allNodes

  fuseInstance.value = new Fuse(allNodes, {
    keys: [
      { name: 'name', weight: 0.7 },
      { name: 'code', weight: 0.3 },
      { name: 'fullPath', weight: 0.2 },
    ],
    threshold: 0.4,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 1,
  })
}

// Load data
const loadData = async () => {
  try {
    const res = await fetch('/database/adoc/pcas-code.min.json')
    const data = await res.json()
    treeData.value = data
    dataLoaded.value = true
    initFuse()
    // Process URL params after data is loaded
    await nextTick()
    handleUrlParams()
  } catch {
    loadingError.value = t('adoc.loadFailed')
  }
}

onMounted(loadData)

// === URL Parameter Handlers ===

// Find node by name in children
const findNodeByName = (nodes: AreaNode[], name: string): AreaNode | null => {
  const normalizedName = name.trim()
  return nodes.find((n) => n.name === normalizedName) || null
}

// Handle region parameter: region=广东省,肇庆市,广宁县
const handleRegionParam = async (regionStr: string) => {
  const parts = regionStr
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (parts.length === 0) return

  // Try to match each level sequentially
  let currentLevel = treeData.value
  const matchedPath: AreaNode[] = []

  for (const part of parts) {
    const node = findNodeByName(currentLevel, part)
    if (node) {
      matchedPath.push(node)
      currentLevel = node.children || []
    } else {
      // Failed to match, fallback to search with space-separated terms
      const searchTerms = parts.join(' ')
      searchQuery.value = searchTerms
      return
    }
  }

  // Successfully matched all parts, set selection
  if (matchedPath.length > 0) {
    isSelectingFromSearch.value = true
    selectedProvince.value = matchedPath[0] || null
    selectedCity.value = matchedPath[1] || null
    selectedDistrict.value = matchedPath[2] || null
    selectedStreet.value = matchedPath[3] || null
    await nextTick()
    isSelectingFromSearch.value = false
  }
}

// Handle search parameter: search=肇庆市
const handleSearchParam = (searchStr: string) => {
  searchQuery.value = searchStr.trim()
}

// Handle code parameter: code=441223
const handleCodeParam = async (codeStr: string) => {
  const code = codeStr.trim()
  if (!code) return

  // Try to find exact code match
  const nodePath = findNodePath(treeData.value, code, [])
  if (nodePath && nodePath.length > 0) {
    // Found exact match, set selection
    isSelectingFromSearch.value = true
    selectedProvince.value = nodePath[0] || null
    selectedCity.value = nodePath[1] || null
    selectedDistrict.value = nodePath[2] || null
    selectedStreet.value = nodePath[3] || null
    await nextTick()
    isSelectingFromSearch.value = false
  } else {
    // No exact match, fallback to search
    searchQuery.value = code
  }
}

// Process all URL parameters
const handleUrlParams = async () => {
  const { region, search, code } = route.query

  // Priority: region > code > search
  if (region && typeof region === 'string') {
    await handleRegionParam(region)
  } else if (code && typeof code === 'string') {
    await handleCodeParam(code)
  } else if (search && typeof search === 'string') {
    handleSearchParam(search)
  }
}

// Filtered children based on selection
const cityOptions = computed(() => selectedProvince.value?.children || [])
const districtOptions = computed(() => selectedCity.value?.children || [])
const streetOptions = computed(() => selectedDistrict.value?.children || [])

// Full path of selected location
const selectedPath = computed(() => {
  const parts: string[] = []
  if (selectedProvince.value) parts.push(selectedProvince.value.name)
  if (selectedCity.value) parts.push(selectedCity.value.name)
  if (selectedDistrict.value) parts.push(selectedDistrict.value.name)
  if (selectedStreet.value) parts.push(selectedStreet.value.name)
  return parts.join(' > ')
})

// Full code of selected location
const selectedCode = computed(() => {
  if (selectedStreet.value) return selectedStreet.value.code
  if (selectedDistrict.value) return selectedDistrict.value.code
  if (selectedCity.value) return selectedCity.value.code
  if (selectedProvince.value) return selectedProvince.value.code
  return ''
})

// Flag to skip watch reset when selecting from search
const isSelectingFromSearch = ref(false)

// Reset when parent changes (skip when selecting from search)
watch(selectedProvince, () => {
  if (isSelectingFromSearch.value) return
  selectedCity.value = null
  selectedDistrict.value = null
  selectedStreet.value = null
})

watch(selectedCity, () => {
  if (isSelectingFromSearch.value) return
  selectedDistrict.value = null
  selectedStreet.value = null
})

watch(selectedDistrict, () => {
  if (isSelectingFromSearch.value) return
  selectedStreet.value = null
})

// Search function using Fuse.js
const performSearch = () => {
  const query = searchQuery.value.trim()
  if (!query || !fuseInstance.value) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  const results = fuseInstance.value.search(query, { limit: 200 })
  searchResults.value = results.map((r) => r.item)
  isSearching.value = false
}

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(performSearch, 300)
})

// Find node path in tree
const findNodePath = (
  nodes: AreaNode[],
  targetCode: string,
  path: AreaNode[],
): AreaNode[] | null => {
  for (const node of nodes) {
    if (node.code === targetCode) {
      return [...path, node]
    }
    if (node.children) {
      const result = findNodePath(node.children, targetCode, [...path, node])
      if (result) return result
    }
  }
  return null
}

// Select from search result
const selectSearchResult = async (result: SearchResult) => {
  searchQuery.value = ''
  searchResults.value = []

  const nodePath = findNodePath(treeData.value, result.code, [])
  if (!nodePath) return

  // Set flag to skip watch reset
  isSelectingFromSearch.value = true

  // Set all selections at once (watch won't reset due to flag)
  selectedProvince.value = nodePath[0] || null
  selectedCity.value = nodePath[1] || null
  selectedDistrict.value = nodePath[2] || null
  selectedStreet.value = nodePath[3] || null

  // Wait for watch callbacks to complete, then reset flag
  await nextTick()
  isSelectingFromSearch.value = false
}

// Copy functions
const copyCode = async () => {
  if (!selectedCode.value) return
  await navigator.clipboard.writeText(selectedCode.value)
  copiedCode.value = true
  setTimeout(() => (copiedCode.value = false), 2000)
}

const copyPath = async () => {
  if (!selectedPath.value) return
  await navigator.clipboard.writeText(selectedPath.value)
  copiedPath.value = true
  setTimeout(() => (copiedPath.value = false), 2000)
}

// Clear selection
const clearSelection = () => {
  selectedProvince.value = null
  selectedCity.value = null
  selectedDistrict.value = null
  selectedStreet.value = null
}
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="space-y-6">
      <!-- Search -->
      <div class="relative">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('adoc.searchPlaceholder')"
            class="w-full pl-10 pr-10 py-2.5 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <!-- Loading spinner -->
          <Loader2
            v-if="isSearching"
            class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin"
          />
          <!-- Clear button -->
          <button
            v-else-if="searchQuery"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            @click="searchQuery = ''"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <!-- Search Results Dropdown -->
        <div
          v-if="searchResults.length > 0"
          class="absolute z-20 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-[300px] overflow-y-auto"
        >
          <button
            v-for="result in searchResults"
            :key="result.code"
            class="w-full px-4 py-2.5 text-left hover:bg-muted/50 flex items-center gap-2"
            @click="selectSearchResult(result)"
          >
            <MapPin class="h-4 w-4 text-muted-foreground shrink-0" />
            <div class="min-w-0 flex-1">
              <div class="font-medium truncate">{{ result.name }}</div>
              <div class="text-xs text-muted-foreground truncate">{{ result.fullPath }}</div>
            </div>
            <span class="text-xs bg-muted px-1.5 py-0.5 rounded shrink-0">
              {{ result.code }}
            </span>
          </button>
        </div>

        <!-- Searching indicator -->
        <div
          v-else-if="isSearching"
          class="absolute z-20 w-full mt-1 bg-background border rounded-lg shadow-lg p-4 text-center text-muted-foreground"
        >
          {{ $t('common.loading') }}
        </div>
      </div>

      <!-- Loading / Error States -->
      <div v-if="!dataLoaded" class="text-center py-12">
        <div v-if="loadingError" class="text-destructive">{{ loadingError }}</div>
        <div v-else class="text-muted-foreground">{{ $t('common.loading') }}</div>
      </div>

      <template v-else>
        <!-- Cascade Selectors -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Province -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-muted-foreground">
              {{ $t('adoc.province') }}
            </label>
            <Select
              :model-value="selectedProvince?.code"
              @update:model-value="
                (code) => {
                  selectedProvince = code ? treeData.find((p) => p.code === code) || null : null
                }
              "
            >
              <SelectTrigger class="w-full">
                <SelectValue :placeholder="$t('adoc.selectProvince')" />
              </SelectTrigger>
              <SelectContent
                class="rounded-2xl shadow-2xl border-muted/50 backdrop-blur-2xl bg-background/95"
              >
                <SelectItem
                  v-for="p in treeData"
                  :key="p.code"
                  :value="p.code"
                  class="rounded-xl py-2.5 px-3 cursor-pointer focus:bg-blue-500/10 focus:text-blue-500 data-[state=checked]:bg-blue-500/10 data-[state=checked]:text-blue-500"
                >
                  {{ p.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- City -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-muted-foreground">
              {{ $t('adoc.city') }}
            </label>
            <Select
              :model-value="selectedCity?.code"
              :disabled="!selectedProvince"
              @update:model-value="
                (code) => {
                  selectedCity = code ? cityOptions.find((c) => c.code === code) || null : null
                }
              "
            >
              <SelectTrigger class="w-full">
                <SelectValue :placeholder="$t('adoc.selectCity')" />
              </SelectTrigger>
              <SelectContent
                class="rounded-2xl shadow-2xl border-muted/50 backdrop-blur-2xl bg-background/95"
              >
                <SelectItem
                  v-for="c in cityOptions"
                  :key="c.code"
                  :value="c.code"
                  class="rounded-xl py-2.5 px-3 cursor-pointer focus:bg-blue-500/10 focus:text-blue-500 data-[state=checked]:bg-blue-500/10 data-[state=checked]:text-blue-500"
                >
                  {{ c.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- District -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-muted-foreground">
              {{ $t('adoc.district') }}
            </label>
            <Select
              :model-value="selectedDistrict?.code"
              :disabled="!selectedCity"
              @update:model-value="
                (code) => {
                  selectedDistrict = code
                    ? districtOptions.find((d) => d.code === code) || null
                    : null
                }
              "
            >
              <SelectTrigger class="w-full">
                <SelectValue :placeholder="$t('adoc.selectDistrict')" />
              </SelectTrigger>
              <SelectContent
                class="rounded-2xl shadow-2xl border-muted/50 backdrop-blur-2xl bg-background/95"
              >
                <SelectItem
                  v-for="d in districtOptions"
                  :key="d.code"
                  :value="d.code"
                  class="rounded-xl py-2.5 px-3 cursor-pointer focus:bg-blue-500/10 focus:text-blue-500 data-[state=checked]:bg-blue-500/10 data-[state=checked]:text-blue-500"
                >
                  {{ d.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Street -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-muted-foreground">
              {{ $t('adoc.street') }}
            </label>
            <Select
              :model-value="selectedStreet?.code"
              :disabled="!selectedDistrict"
              @update:model-value="
                (code) => {
                  selectedStreet = code ? streetOptions.find((s) => s.code === code) || null : null
                }
              "
            >
              <SelectTrigger class="w-full">
                <SelectValue :placeholder="$t('adoc.selectStreet')" />
              </SelectTrigger>
              <SelectContent
                class="rounded-2xl shadow-2xl border-muted/50 backdrop-blur-2xl bg-background/95"
              >
                <SelectItem
                  v-for="s in streetOptions"
                  :key="s.code"
                  :value="s.code"
                  class="rounded-xl py-2.5 px-3 cursor-pointer focus:bg-blue-500/10 focus:text-blue-500 data-[state=checked]:bg-blue-500/10 data-[state=checked]:text-blue-500"
                >
                  {{ s.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Result Display -->
        <div
          v-if="selectedProvince || selectedCity || selectedDistrict || selectedStreet"
          class="bg-linear-to-r from-primary/5 to-primary/10 rounded-xl p-6 space-y-4"
        >
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-lg">{{ $t('adoc.selectedInfo') }}</h3>
            <button class="btn-ghost text-sm px-3 py-1.5" @click="clearSelection">
              {{ $t('common.clear') }}
            </button>
          </div>

          <!-- Full Path -->
          <div class="space-y-1">
            <div class="text-sm text-muted-foreground">{{ $t('adoc.fullPath') }}</div>
            <div class="flex items-center gap-2">
              <div class="flex-1 font-medium text-lg">{{ selectedPath }}</div>
              <button
                class="btn-icon"
                :title="$t('common.copy')"
                :disabled="!selectedPath"
                @click="copyPath"
              >
                <Check v-if="copiedPath" class="h-4 w-4 text-green-500" />
                <Copy v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Division Code -->
          <div class="space-y-1">
            <div class="text-sm text-muted-foreground">{{ $t('adoc.divisionCode') }}</div>
            <div class="flex items-center gap-2">
              <code
                class="flex-1 bg-background/80 px-4 py-2 rounded-lg font-mono text-xl font-semibold"
              >
                {{ selectedCode }}
              </code>
              <button
                class="btn-icon"
                :title="$t('common.copy')"
                :disabled="!selectedCode"
                @click="copyCode"
              >
                <Check v-if="copiedCode" class="h-4 w-4 text-green-500" />
                <Copy v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Level Info -->
          <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span v-if="selectedProvince" class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              {{ $t('adoc.province') }}: {{ selectedProvince.code }}
            </span>
            <span v-if="selectedCity" class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              {{ $t('adoc.city') }}: {{ selectedCity.code }}
            </span>
            <span v-if="selectedDistrict" class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-orange-500"></span>
              {{ $t('adoc.district') }}: {{ selectedDistrict.code }}
            </span>
            <span v-if="selectedStreet" class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-purple-500"></span>
              {{ $t('adoc.street') }}: {{ selectedStreet.code }}
            </span>
          </div>
        </div>
      </template>

      <!-- Tips -->
      <div class="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 md:p-5">
        <p class="text-blue-600/80 font-medium leading-relaxed">
          {{ $t('adoc.tip') }}
        </p>
      </div>
    </div>
  </ToolContainer>
</template>
