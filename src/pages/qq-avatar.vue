<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search, Copy, ExternalLink, AlertCircle } from 'lucide-vue-next'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import { allTools } from '@/config/tools'
import { inject } from 'vue'

const { t } = useI18n()

const showToast = inject('showToast') as (
  msg: string,
  type?: 'success' | 'warning' | 'error',
) => void

const tool = allTools.find((t) => t.id === 'qq-avatar')!

const qqNumber = ref('')
const hasResult = ref(false)
const errorMsg = ref('')

interface AvatarVariant {
  key: string
  labelKey: string
  url: string
  size: number
}

const avatarVariants = ref<AvatarVariant[]>([])

const QQ_REGEX = /^\d{5,11}$/

const buildAvatars = (qq: string): AvatarVariant[] => [
  {
    key: 'small',
    labelKey: 'qqAvatar.size40',
    url: `https://q1.qlogo.cn/g?b=qq&nk=${qq}&s=40`,
    size: 40,
  },
  {
    key: 'medium',
    labelKey: 'qqAvatar.size100',
    url: `https://q1.qlogo.cn/g?b=qq&nk=${qq}&s=100`,
    size: 100,
  },
  {
    key: 'large',
    labelKey: 'qqAvatar.size640',
    url: `https://q1.qlogo.cn/g?b=qq&nk=${qq}&s=640`,
    size: 640,
  },
  {
    key: 'hd',
    labelKey: 'qqAvatar.sizeHD',
    url: `https://q.qlogo.cn/headimg_dl?dst_uin=${qq}&spec=640&img_type=jpg`,
    size: 640,
  },
]

const handleQuery = () => {
  const qq = qqNumber.value.trim()
  errorMsg.value = ''
  hasResult.value = false

  if (!qq) return

  if (!QQ_REGEX.test(qq)) {
    errorMsg.value = t('qqAvatar.invalidQQ')
    return
  }

  avatarVariants.value = buildAvatars(qq)
  hasResult.value = true
}

const copyUrl = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    showToast(t('common.copySuccess'), 'success')
  } catch {
    showToast(t('common.copyFailed'), 'error')
  }
}

const openUrl = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

// Preview image load error handler
const handleImgError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.style.visibility = 'hidden'
}

const handleImgLoad = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.style.visibility = 'visible'
}
</script>

<template>
  <ToolContainer :tool="tool">
    <div
      class="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pt-4"
    >
      <!-- Input Section -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div class="relative flex-1 group">
          <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search
              class="h-5 w-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors"
            />
          </div>
          <input
            v-model="qqNumber"
            type="text"
            inputmode="numeric"
            :placeholder="t('qqAvatar.inputPlaceholder')"
            class="w-full pl-12 pr-4 py-4 bg-card/50 border-2 border-muted/60 focus:border-blue-500/50 focus:bg-card/80 rounded-2xl outline-none transition-all text-base shadow-none"
            @keyup.enter="handleQuery"
          />
        </div>
        <button
          :disabled="!qqNumber.trim()"
          class="flex items-center justify-center gap-2 px-8 py-4 bg-blue-500 text-white font-medium rounded-2xl hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          @click="handleQuery"
        >
          {{ t('qqAvatar.query') }}
        </button>
      </div>

      <!-- Error Message -->
      <div
        v-if="errorMsg"
        class="flex items-center gap-3 px-5 py-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-600 dark:text-rose-400"
      >
        <AlertCircle class="h-5 w-5 shrink-0" />
        <span class="text-sm">{{ errorMsg }}</span>
      </div>

      <!-- CORS Notice -->
      <div
        v-if="hasResult"
        class="flex items-start gap-3 px-5 py-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-700 dark:text-amber-400"
      >
        <AlertCircle class="h-5 w-5 shrink-0 mt-0.5" />
        <span class="text-sm leading-relaxed">{{ t('qqAvatar.corsNotice') }}</span>
      </div>

      <!-- Avatar Results -->
      <div v-if="hasResult" class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div
          v-for="variant in avatarVariants"
          :key="variant.key"
          class="bg-card/40 border-2 border-muted/40 hover:border-blue-500/30 rounded-3xl p-6 transition-all space-y-4"
        >
          <!-- Label and size badge -->
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-foreground">{{ t(variant.labelKey) }}</h3>
            <span
              class="text-xs px-2.5 py-1 bg-muted/60 rounded-full text-muted-foreground font-mono"
            >
              {{ variant.size }}px
            </span>
          </div>

          <!-- Avatar Preview -->
          <div
            class="flex items-center justify-center bg-muted/30 rounded-2xl overflow-hidden"
            :style="{ minHeight: variant.key === 'small' ? '64px' : '96px' }"
          >
            <img
              :src="variant.url"
              :alt="t(variant.labelKey)"
              :style="{
                width: variant.key === 'small' ? '40px' : '96px',
                height: variant.key === 'small' ? '40px' : '96px',
                objectFit: 'cover',
              }"
              class="rounded-xl transition-all"
              referrerpolicy="no-referrer"
              @error="handleImgError"
              @load="handleImgLoad"
            />
          </div>

          <!-- URL display -->
          <div
            class="text-xs font-mono text-muted-foreground bg-muted/30 rounded-xl px-3 py-2 break-all leading-relaxed"
          >
            {{ variant.url }}
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button
              class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 rounded-xl text-sm font-medium transition-all active:scale-95"
              @click="copyUrl(variant.url)"
            >
              <Copy class="h-4 w-4" />
              {{ t('common.copy') }}
            </button>
            <button
              class="flex items-center justify-center gap-2 px-4 py-2.5 bg-muted/40 text-muted-foreground hover:bg-muted/60 rounded-xl text-sm font-medium transition-all active:scale-95"
              :title="t('qqAvatar.openInBrowser')"
              @click="openUrl(variant.url)"
            >
              <ExternalLink class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>
