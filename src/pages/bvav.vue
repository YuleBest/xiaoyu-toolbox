<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowRightLeft, Copy, Check, Trash2, X, ExternalLink } from 'lucide-vue-next'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import { allTools } from '@/config/tools'
import { inject } from 'vue'

const showToast = inject('showToast') as (msg: string, type?: 'warning' | 'error') => void

const { t } = useI18n()
const tool = allTools.find((t) => t.id === 'bvav')!

// ===== BV/AV 转换算法（新版，兼容新旧 BV 号）=====

// Base58 字符表
const TABLE = 'FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf'

// 反向查找表：字符 → 索引 (BigInt)
const TR: Record<string, bigint> = {}
for (let i = 0; i < TABLE.length; i++) {
  TR[TABLE[i]!] = BigInt(i)
}

// BV 号 12 位字符的位置映射
const S = [0, 1, 2, 9, 7, 5, 6, 4, 8, 3, 10, 11]

const BASE = 58n
const BV_LEN = 12
const MAX = 1n << 51n // 2^51
const XOR_VAL = 23442827791579n
const MASK = 2251799813685247n // (1n << 51n) - 1n

/**
 * BV号 → AV号
 */
function bv2av(bv: string): number {
  let r = 0n
  for (let i = 3; i < BV_LEN; i++) {
    r = r * BASE + TR[bv[S[i]!]!]!
  }
  return Number((r & MASK) ^ XOR_VAL)
}

/**
 * AV号 → BV号
 */
function av2bv(av: number): string {
  const r = Array.from('BV1         ')
  let it = BV_LEN - 1
  let tmp = (BigInt(av) | MAX) ^ XOR_VAL
  while (tmp !== 0n) {
    r[S[it]!] = TABLE[Number(tmp % BASE)]!
    tmp /= BASE
    it--
  }
  return r.join('')
}

// ===== 页面逻辑 =====

const input = ref('')
const resultBv = ref('')
const resultAv = ref('')
const errorMsg = ref('')
const hasConverted = ref(false)
const copiedBv = ref(false)
const copiedAv = ref(false)

interface HistoryItem {
  bv: string
  av: string
}

const history = ref<HistoryItem[]>([])

// 从 sessionStorage 恢复历史
try {
  const saved = sessionStorage.getItem('bvav-history')
  if (saved) history.value = JSON.parse(saved)
} catch {
  /* ignore */
}

const saveHistory = () => {
  try {
    sessionStorage.setItem('bvav-history', JSON.stringify(history.value))
  } catch {
    /* ignore */
  }
}

/**
 * 检测输入类型并执行转换
 * 优先级：
 *   1. 以 av/AV 开头 → AV 号
 *   2. 纯数字 → AV 号
 *   3. 以 BV/bv 开头 → BV 号（自动修正大小写）
 *   4. 含字母（如 12d45187XG）→ 视为 BV 号主体，自动补 "BV1" 前缀
 */
const doConvert = () => {
  const raw = input.value.trim()
  if (!raw) return

  errorMsg.value = ''
  resultBv.value = ''
  resultAv.value = ''
  hasConverted.value = true

  // 1) 以 av 开头 → AV 号
  if (/^av/i.test(raw)) {
    const numStr = raw.replace(/^av/i, '')
    return convertFromAv(numStr)
  }

  // 2) 纯数字 → AV 号
  if (/^\d+$/.test(raw)) {
    return convertFromAv(raw)
  }

  // 3) 以 BV 开头 → BV 号（修正大小写）
  if (/^bv/i.test(raw)) {
    const bv = 'BV' + raw.slice(2)
    return convertFromBv(bv)
  }

  // 4) 含字母但不以 BV/av 开头 → 视为 BV 号主体（9 位），自动补 "BV1"
  if (/[A-Za-z]/.test(raw)) {
    const bv = 'BV1' + raw
    return convertFromBv(bv)
  }

  // 无法识别
  errorMsg.value = t('bvav.invalidInput')
}

const convertFromBv = (bv: string) => {
  if (!/^BV1[A-Za-z0-9]{9}$/.test(bv)) {
    errorMsg.value = t('bvav.invalidBv')
    return
  }

  try {
    const av = bv2av(bv)
    if (av <= 0 || !Number.isFinite(av)) {
      errorMsg.value = t('bvav.invalidBv')
      return
    }
    resultBv.value = bv
    resultAv.value = `av${av}`
    addHistory(bv, `av${av}`)
  } catch {
    errorMsg.value = t('bvav.invalidBv')
  }
}

const convertFromAv = (numStr: string) => {
  if (!/^\d+$/.test(numStr)) {
    errorMsg.value = t('bvav.invalidAv')
    return
  }

  const av = parseInt(numStr, 10)
  if (av <= 0 || !Number.isFinite(av)) {
    errorMsg.value = t('bvav.invalidAv')
    return
  }

  try {
    const bv = av2bv(av)
    resultBv.value = bv
    resultAv.value = `av${av}`
    addHistory(bv, `av${av}`)
  } catch {
    errorMsg.value = t('bvav.invalidAv')
  }
}

const addHistory = (bv: string, av: string) => {
  history.value = [{ bv, av }, ...history.value.filter((h) => h.bv !== bv)].slice(0, 10)
  saveHistory()
}

const copyToClipboard = async (text: string, type: 'bv' | 'av') => {
  if (!text) return
  await navigator.clipboard.writeText(text)
  if (type === 'bv') {
    copiedBv.value = true
    setTimeout(() => (copiedBv.value = false), 2000)
  } else {
    copiedAv.value = true
    setTimeout(() => (copiedAv.value = false), 2000)
  }
  showToast(t('bvav.copied'))
}

const clearAll = () => {
  input.value = ''
  resultBv.value = ''
  resultAv.value = ''
  errorMsg.value = ''
  hasConverted.value = false
}

const queryFromHistory = (item: HistoryItem) => {
  input.value = item.bv
  resultBv.value = item.bv
  resultAv.value = item.av
  hasConverted.value = true
  errorMsg.value = ''
}

const clearHistory = () => {
  history.value = []
  sessionStorage.removeItem('bvav-history')
}

const hasResult = computed(() => hasConverted.value && !errorMsg.value && resultBv.value)
</script>

<template>
  <ToolContainer :tool="tool">
    <template #actions>
      <div class="flex items-center gap-2">
        <button class="btn-destructive px-3 py-1.5 md:px-4 md:py-2" @click="clearAll">
          <Trash2 class="h-4 w-4" />
          <span class="hidden sm:inline">{{ $t('common.clearAll') }}</span>
        </button>
      </div>
    </template>

    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Input Card -->
      <div class="bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-8">
        <div class="flex gap-3">
          <div class="relative flex-1 min-w-0">
            <ArrowRightLeft
              class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <input
              v-model="input"
              type="text"
              maxlength="30"
              :placeholder="t('bvav.inputPlaceholder')"
              class="w-full pl-11 pr-4 py-3 bg-background border border-muted rounded-2xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-mono"
              @keyup.enter="doConvert"
            />
          </div>
          <button
            :disabled="!input.trim()"
            class="px-5 py-3 rounded-2xl bg-blue-500 text-white font-medium hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center gap-2"
            @click="doConvert"
          >
            <ArrowRightLeft class="h-4 w-4" />
            {{ t('bvav.convert') }}
          </button>
        </div>
      </div>

      <!-- Result Card -->
      <div
        v-if="hasResult"
        class="bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- BV Result -->
          <div
            class="bg-card border border-muted/60 rounded-xl p-4 flex items-center justify-between gap-3"
          >
            <div class="min-w-0">
              <div class="text-xs text-muted-foreground font-medium mb-1">
                {{ t('bvav.resultBv') }}
              </div>
              <div class="text-base font-bold font-mono truncate">
                {{ resultBv }}
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <a
                :href="`https://m.bilibili.com/video/${resultBv}`"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-icon"
                title="在 B 站打开"
              >
                <ExternalLink class="h-4 w-4 opacity-50 hover:opacity-100" />
              </a>
              <button
                class="btn-icon"
                :title="$t('common.copy')"
                @click="copyToClipboard(resultBv, 'bv')"
              >
                <Check v-if="copiedBv" class="h-4 w-4 text-green-500" />
                <Copy v-else class="h-4 w-4 opacity-50 hover:opacity-100" />
              </button>
            </div>
          </div>

          <!-- AV Result -->
          <div
            class="bg-card border border-muted/60 rounded-xl p-4 flex items-center justify-between gap-3"
          >
            <div class="min-w-0">
              <div class="text-xs text-muted-foreground font-medium mb-1">
                {{ t('bvav.resultAv') }}
              </div>
              <div class="text-base font-bold font-mono truncate">
                {{ resultAv }}
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <a
                :href="`https://m.bilibili.com/video/${resultAv}`"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-icon"
                title="在 B 站打开"
              >
                <ExternalLink class="h-4 w-4 opacity-50 hover:opacity-100" />
              </a>
              <button
                class="btn-icon"
                :title="$t('common.copy')"
                @click="copyToClipboard(resultAv, 'av')"
              >
                <Check v-if="copiedAv" class="h-4 w-4 text-green-500" />
                <Copy v-else class="h-4 w-4 opacity-50 hover:opacity-100" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-if="hasConverted && errorMsg"
        class="bg-card/30 border border-muted/80 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-3"
      >
        <div class="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-2">
          <X class="h-8 w-8 text-muted-foreground opacity-50" />
        </div>
        <p class="text-lg font-medium text-foreground">{{ errorMsg }}</p>
      </div>

      <!-- History -->
      <div
        v-if="history.length > 0"
        class="bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-8"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-muted-foreground">
            {{ t('bvav.history') }}
          </h3>
          <button
            class="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            @click="clearHistory"
          >
            <X class="h-3 w-3" />
            {{ t('common.clearAll') }}
          </button>
        </div>
        <div class="space-y-2">
          <button
            v-for="item in history"
            :key="item.bv"
            class="w-full flex items-center justify-between bg-card border border-muted/60 rounded-xl px-4 py-3 hover:border-blue-500/30 hover:bg-muted/30 transition-all text-left cursor-pointer group"
            @click="queryFromHistory(item)"
          >
            <span class="font-mono text-sm font-bold">
              {{ item.bv }}
            </span>
            <span
              class="text-xs text-muted-foreground group-hover:text-foreground transition-colors"
            >
              {{ item.av }}
            </span>
          </button>
        </div>
      </div>

      <!-- Quick Tip -->
      <div class="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 md:p-5">
        <p class="text-blue-600/80 font-medium leading-relaxed">
          {{ t('bvav.tip') }}
        </p>
      </div>
    </div>
  </ToolContainer>
</template>
