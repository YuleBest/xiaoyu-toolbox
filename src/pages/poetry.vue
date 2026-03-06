<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Fuse from 'fuse.js'
import { pinyin } from 'pinyin-pro'
import * as OpenCC from 'opencc-js'

import { allTools } from '@/config/tools'
import { Search, Languages } from 'lucide-vue-next'

const { t, locale } = useI18n()
const tool = allTools.find((t) => t.id === 'poetry')!

// 简繁互转
const converterST = OpenCC.Converter({ from: 'cn', to: 'tw' })
const converterTS = OpenCC.Converter({ from: 'tw', to: 'cn' })

interface Poem {
  title: string
  author: string
  content: string[]
  meta?: { tags: string[] }
}

const keyword = ref('')
const loading = ref(false)
const results = ref<Poem[]>([])
const hasSearched = ref(false)

const getDefaultLang = () => {
  if (locale.value === 'zh-CN') return 'zh-CN'
  if (locale.value === 'zh-TW') return 'zh-TW'
  return 'original'
}

// current display language: 'original' | 'zh-CN' | 'zh-TW'
const displayLang = ref<'original' | 'zh-CN' | 'zh-TW'>(getDefaultLang())

const poetryTree = ref<string[]>([])

// Load the poetry tree once
const loadTree = async () => {
  if (poetryTree.value.length > 0) return
  try {
    const res = await fetch('/database/poetry-tree.json')
    poetryTree.value = await res.json()
  } catch (err) {
    console.error('Failed to load poetry tree', err)
  }
}

const findBestFile = (keywordBase: string): string | null => {
  let currentKey = keywordBase
  while (currentKey.length > 0) {
    // Exact match: [PREFIX].json
    const exactName = `${currentKey}.json`
    if (poetryTree.value.includes(exactName)) return exactName

    // Exact End match: [PREFIX]_END.json
    const exactEndName = `${currentKey}_END.json`
    if (poetryTree.value.includes(exactEndName)) return exactEndName

    // Remove last char and try again
    currentKey = currentKey.slice(0, -1)
  }
  return null
}

const deduplicatePoems = (poems: Poem[]): Poem[] => {
  const map = new Map<string, Poem[]>()

  poems.forEach((poem) => {
    const rawText = converterTS(poem.content.join(''))
    // 以内容为基准去重，保留汉字、字母、数字
    const normalizedKey = rawText.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')

    if (!map.has(normalizedKey)) {
      map.set(normalizedKey, [])
    }
    map.get(normalizedKey)!.push(poem)
  })

  const chosenPoems = new Set<Poem>()
  for (const group of map.values()) {
    group.sort((a, b) => {
      // 1. 带换行的内容优先 (content数组长度较大)
      if (a.content.length !== b.content.length) {
        return b.content.length - a.content.length
      }
      // 2. 作者字段字数最多的优先
      if (a.author.length !== b.author.length) {
        return b.author.length - a.author.length
      }
      // 3. 标题字段字数最多的优先
      if (a.title.length !== b.title.length) {
        return b.title.length - a.title.length
      }
      // 4. Tag数量最多的优先
      const aTags = a.meta?.tags?.length || 0
      const bTags = b.meta?.tags?.length || 0
      return bTags - aTags
    })
    // 选出该组（内容一模一样）中的最优解
    chosenPoems.add(group[0])
  }

  return poems.filter((poem) => chosenPoems.has(poem))
}

const searchPoetry = async () => {
  if (!keyword.value.trim()) return

  loading.value = true
  hasSearched.value = true
  results.value = []

  await loadTree()

  // 1. Get Keyword Variations (Original, Simp, Trad)
  const kw = keyword.value.trim()
  const kwSimp = converterTS(kw)
  const kwTrad = converterST(kw)

  // 2. Generate Pinyin initials from the Simplifed/Original term, replacing spaces with #
  const pinyinInitials = pinyin(kw, {
    pattern: 'first',
    toneType: 'none',
    type: 'array',
    nonZh: 'consecutive', // Keep spaces/punctuation grouped or separate, we'll manually replace spaces
  })
    .join('')
    .toUpperCase()
    .replace(/\s+/g, '#')

  console.log('Searching Initials:', pinyinInitials)

  // 3. Find the best JSON file to fetch
  const fileName = findBestFile(pinyinInitials)

  if (!fileName) {
    console.log('No matching JSON file found for', pinyinInitials)
    loading.value = false
    return
  }

  // 4. Fetch the data
  try {
    console.log('Fetching:', fileName)
    const res = await fetch(`https://poetry.r2.yule.ink/${fileName}`)
    if (!res.ok) {
      throw new Error(`Failed to GET ${fileName}`)
    }
    const data: Poem[] = await res.json()

    // 5. Fuzzy Match using fuse.js
    const fuse = new Fuse(data, {
      keys: ['title'],
      threshold: 0.3,
      includeScore: true,
      ignoreLocation: true, // Search anywhere in the title
    })

    // Search against original, simplified, and traditional
    let matchedResults = fuse.search(kw)
    if (matchedResults.length === 0 && kw !== kwSimp) {
      matchedResults = fuse.search(kwSimp)
    }
    if (matchedResults.length === 0 && kw !== kwTrad) {
      matchedResults = fuse.search(kwTrad)
    }

    const rawResults = matchedResults.map((item) => item.item)
    results.value = deduplicatePoems(rawResults)

    // reset display lang to default on new search
    displayLang.value = getDefaultLang()
  } catch (err) {
    console.error('Error fetching or parsing poetry data', err)
  } finally {
    loading.value = false
  }
}

const toggleLang = () => {
  if (displayLang.value === 'original') displayLang.value = 'zh-CN'
  else if (displayLang.value === 'zh-CN') displayLang.value = 'zh-TW'
  else displayLang.value = 'original'
}

const formatText = (text: string) => {
  if (displayLang.value === 'zh-CN') return converterTS(text)
  if (displayLang.value === 'zh-TW') return converterST(text)
  return text
}
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="space-y-6">
      <!-- Search Input -->
      <div class="flex gap-2">
        <div class="relative flex-1">
          <input
            v-model="keyword"
            @keyup.enter="searchPoetry"
            type="text"
            class="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-blue-900"
            :placeholder="t('poetry.searchPlaceholder', '搜索诗词标题...')"
          />
          <Search class="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
        </div>
        <button
          @click="searchPoetry"
          :disabled="loading"
          class="flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-75 disabled:active:scale-100"
        >
          <span
            v-if="loading"
            class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"
          ></span>
          {{ t('common.search') }}
        </button>
      </div>

      <!-- Results Display -->
      <div v-if="results.length > 0" class="space-y-4">
        <div class="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>{{ t('poetry.resultCount', { count: results.length }) }}</span>
          <button
            @click="toggleLang"
            class="flex items-center gap-1.5 rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Languages class="h-3.5 w-3.5" />
            <span v-if="displayLang === 'original'">{{ t('poetry.langOriginal', '原文') }}</span>
            <span v-else-if="displayLang === 'zh-CN'">{{ t('poetry.langSimp', '简体') }}</span>
            <span v-else>{{ t('poetry.langTrad', '繁体') }}</span>
          </button>
        </div>

        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <div
            v-for="(poem, index) in results"
            :key="index"
            class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div class="mb-4">
              <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100">
                {{ formatText(poem.title) }}
              </h3>
              <p class="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                [{{ formatText(poem.author) }}]
              </p>
            </div>

            <div class="space-y-1">
              <p
                v-for="(line, i) in poem.content"
                :key="i"
                class="text-slate-600 leading-relaxed dark:text-slate-300"
              >
                {{ formatText(line) }}
              </p>
            </div>

            <div
              v-if="poem.meta && poem.meta.tags && poem.meta.tags.length > 0"
              class="mt-4 flex flex-wrap gap-2"
            >
              <span
                v-for="tag in poem.meta.tags"
                :key="tag"
                class="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              >
                {{ formatText(tag) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Not Found / Empty State -->
      <div
        v-else-if="hasSearched && !loading"
        class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-900/50"
      >
        <BookOpen class="h-10 w-10 text-slate-400 mb-3 opacity-50" />
        <p class="text-slate-500 dark:text-slate-400">
          {{ t('poetry.noResults', '未找到相关诗词作品') }}
        </p>
      </div>
    </div>
  </ToolContainer>
</template>
