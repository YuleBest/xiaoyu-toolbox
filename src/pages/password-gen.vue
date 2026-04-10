<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RefreshCw, Copy, Shield, Eye, EyeOff } from 'lucide-vue-next'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import { allTools } from '@/config/tools'
import { inject } from 'vue'

const { t } = useI18n()
const showToast = inject('showToast') as (
  msg: string,
  type?: 'success' | 'warning' | 'error',
) => void

const tool = allTools.find((t) => t.id === 'password-gen')!

// === 参数配置 ===
const length = ref(16)
const includeUppercase = ref(true)
const includeLowercase = ref(true)
const includeNumbers = ref(true)
const includeSymbols = ref(true)
const excludeAmbiguous = ref(false)
const customSymbols = ref('!@#$%^&*()-_=+[]{}|;:,.<>?')
const count = ref(1)

const showPasswords = ref(false)
const passwords = ref<string[]>([])

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const NUMBERS = '0123456789'
const AMBIGUOUS = 'Il1O0o'

const charset = computed(() => {
  let chars = ''
  if (includeLowercase.value) chars += LOWERCASE
  if (includeUppercase.value) chars += UPPERCASE
  if (includeNumbers.value) chars += NUMBERS
  if (includeSymbols.value) chars += customSymbols.value
  if (excludeAmbiguous.value) {
    chars = chars
      .split('')
      .filter((c) => !AMBIGUOUS.includes(c))
      .join('')
  }
  return chars
})

const isValid = computed(() => charset.value.length > 0 && length.value >= 4)

const generateOne = (): string => {
  const chars = charset.value
  const arr = new Uint32Array(length.value)
  crypto.getRandomValues(arr)
  return Array.from(arr)
    .map((v) => chars[v % chars.length])
    .join('')
}

const generate = () => {
  if (!isValid.value) return
  passwords.value = Array.from({ length: count.value }, generateOne)
}

// 初始生成
generate()

// 参数变化时自动重新生成
watch(
  [
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
    excludeAmbiguous,
    customSymbols,
    count,
  ],
  generate,
)

const strengthScore = (pwd: string): number => {
  let score = 0
  if (pwd.length >= 12) score++
  if (pwd.length >= 16) score++
  if (/[a-z]/.test(pwd)) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^a-zA-Z0-9]/.test(pwd)) score++
  return score
}

const strengthLabel = (score: number) => {
  if (score <= 2) return t('passwordGen.strengthWeak')
  if (score <= 4) return t('passwordGen.strengthMedium')
  return t('passwordGen.strengthStrong')
}

const strengthColor = (score: number) => {
  if (score <= 2) return 'bg-rose-500'
  if (score <= 4) return 'bg-amber-400'
  return 'bg-emerald-500'
}

const strengthTextColor = (score: number) => {
  if (score <= 2) return 'text-rose-500'
  if (score <= 4) return 'text-amber-500'
  return 'text-emerald-500'
}

const copyPassword = async (pwd: string) => {
  try {
    await navigator.clipboard.writeText(pwd)
    showToast(t('common.copySuccess'), 'success')
  } catch {
    showToast(t('common.copyFailed'), 'error')
  }
}

const copyAll = async () => {
  try {
    await navigator.clipboard.writeText(passwords.value.join('\n'))
    showToast(t('common.copySuccess'), 'success')
  } catch {
    showToast(t('common.copyFailed'), 'error')
  }
}
</script>

<template>
  <ToolContainer :tool="tool">
    <div
      class="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pt-4"
    >
      <!-- 参数配置卡片 -->
      <div class="bg-card/40 border-2 border-muted/40 rounded-3xl p-6 space-y-5">
        <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {{ t('passwordGen.settings') }}
        </h2>

        <!-- 密码长度 -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium">{{ t('passwordGen.length') }}</label>
            <span class="text-sm font-mono font-bold text-blue-500">{{ length }}</span>
          </div>
          <input
            v-model.number="length"
            type="range"
            min="4"
            max="128"
            class="w-full accent-blue-500 cursor-pointer"
          />
          <div class="flex justify-between text-xs text-muted-foreground">
            <span>4</span>
            <span>128</span>
          </div>
        </div>

        <!-- 字符类型 -->
        <div class="grid grid-cols-2 gap-3">
          <label
            v-for="opt in [
              {
                key: 'includeUppercase',
                label: t('passwordGen.uppercase'),
                model: includeUppercase,
              },
              {
                key: 'includeLowercase',
                label: t('passwordGen.lowercase'),
                model: includeLowercase,
              },
              { key: 'includeNumbers', label: t('passwordGen.numbers'), model: includeNumbers },
              { key: 'includeSymbols', label: t('passwordGen.symbols'), model: includeSymbols },
            ]"
            :key="opt.key"
            class="flex items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 rounded-2xl cursor-pointer transition-all"
          >
            <input
              v-if="opt.key === 'includeUppercase'"
              v-model="includeUppercase"
              type="checkbox"
              class="w-4 h-4 accent-blue-500 cursor-pointer"
            />
            <input
              v-else-if="opt.key === 'includeLowercase'"
              v-model="includeLowercase"
              type="checkbox"
              class="w-4 h-4 accent-blue-500 cursor-pointer"
            />
            <input
              v-else-if="opt.key === 'includeNumbers'"
              v-model="includeNumbers"
              type="checkbox"
              class="w-4 h-4 accent-blue-500 cursor-pointer"
            />
            <input
              v-else
              v-model="includeSymbols"
              type="checkbox"
              class="w-4 h-4 accent-blue-500 cursor-pointer"
            />
            <span class="text-sm">{{ opt.label }}</span>
          </label>
        </div>

        <!-- 排除易混淆字符 -->
        <label
          class="flex items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 rounded-2xl cursor-pointer transition-all"
        >
          <input
            v-model="excludeAmbiguous"
            type="checkbox"
            class="w-4 h-4 accent-blue-500 cursor-pointer"
          />
          <span class="text-sm">{{ t('passwordGen.excludeAmbiguous') }}</span>
          <span class="text-xs text-muted-foreground font-mono ml-auto">Il1O0o</span>
        </label>

        <!-- 自定义符号 -->
        <div v-if="includeSymbols" class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('passwordGen.customSymbols') }}</label>
          <input
            v-model="customSymbols"
            type="text"
            class="w-full px-4 py-2.5 bg-muted/30 border border-muted/60 focus:border-blue-500/50 rounded-xl outline-none text-sm font-mono transition-all"
            :placeholder="t('passwordGen.customSymbolsPlaceholder')"
          />
        </div>

        <!-- 生成数量 -->
        <div class="flex items-center gap-4">
          <label class="text-sm font-medium shrink-0">{{ t('passwordGen.count') }}</label>
          <input
            v-model.number="count"
            type="number"
            min="1"
            max="20"
            class="w-24 px-3 py-2 bg-muted/30 border border-muted/60 focus:border-blue-500/50 rounded-xl outline-none text-sm font-mono text-center transition-all"
          />
        </div>

        <!-- 无效字符集提示 -->
        <div
          v-if="!isValid"
          class="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-2.5"
        >
          {{ t('passwordGen.invalidCharset') }}
        </div>
      </div>

      <!-- 生成按钮 -->
      <div class="flex gap-3">
        <button
          :disabled="!isValid"
          class="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-500 text-white font-medium rounded-2xl hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          @click="generate"
        >
          <RefreshCw class="h-4 w-4" />
          {{ t('passwordGen.generate') }}
        </button>
        <button
          v-if="passwords.length > 1"
          class="flex items-center justify-center gap-2 px-5 py-3.5 bg-muted/40 text-muted-foreground hover:bg-muted/60 rounded-2xl text-sm font-medium transition-all active:scale-95"
          @click="copyAll"
        >
          <Copy class="h-4 w-4" />
          {{ t('passwordGen.copyAll') }}
        </button>
        <button
          class="flex items-center justify-center px-4 py-3.5 bg-muted/40 text-muted-foreground hover:bg-muted/60 rounded-2xl transition-all active:scale-95"
          :title="showPasswords ? t('passwordGen.hidePasswords') : t('passwordGen.showPasswords')"
          @click="showPasswords = !showPasswords"
        >
          <Eye v-if="!showPasswords" class="h-4 w-4" />
          <EyeOff v-else class="h-4 w-4" />
        </button>
      </div>

      <!-- 密码列表 -->
      <div v-if="passwords.length" class="space-y-3">
        <div
          v-for="(pwd, idx) in passwords"
          :key="idx"
          class="bg-card/40 border-2 border-muted/40 hover:border-blue-500/20 rounded-2xl p-4 space-y-3 transition-all"
        >
          <!-- 密码文本 -->
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1.5 shrink-0">
              <Shield class="h-4 w-4 text-muted-foreground" />
            </div>
            <span
              class="flex-1 font-mono text-base tracking-wider break-all select-all"
              :class="showPasswords ? '' : 'blur-sm select-none'"
            >
              {{ pwd }}
            </span>
            <button
              class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 rounded-xl text-sm font-medium transition-all active:scale-95 shrink-0"
              @click="copyPassword(pwd)"
            >
              <Copy class="h-3.5 w-3.5" />
              {{ t('common.copy') }}
            </button>
          </div>

          <!-- 强度条 -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="text-muted-foreground">{{ t('passwordGen.strength') }}</span>
              <span :class="strengthTextColor(strengthScore(pwd))" class="font-medium">
                {{ strengthLabel(strengthScore(pwd)) }}
              </span>
            </div>
            <div class="h-1.5 bg-muted/40 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="strengthColor(strengthScore(pwd))"
                :style="{ width: `${(strengthScore(pwd) / 6) * 100}%` }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>
