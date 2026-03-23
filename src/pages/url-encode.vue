<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
import { Copy, Check, Trash2, ArrowRightLeft } from 'lucide-vue-next'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import { allTools } from '@/config/tools'

const tool = allTools.find((t) => t.id === 'url-encode')!

const sourceText = ref('')
const encodedText = ref('')
const copiedSource = ref(false)
const copiedEncoded = ref(false)
const encodeMode = ref<'component' | 'uri'>('component')

// Encode: Text -> URL Encoded
const encode = (text: string): string => {
  try {
    return encodeMode.value === 'component'
      ? encodeURIComponent(text)
      : encodeURI(text)
  } catch {
    return t('urlEncode.encodeError')
  }
}

// Decode: URL Encoded -> Text
const decode = (encoded: string): string => {
  try {
    // Try decodeURIComponent first, fallback to decodeURI
    try {
      return decodeURIComponent(encoded)
    } catch {
      return decodeURI(encoded)
    }
  } catch {
    return t('urlEncode.decodeError')
  }
}

watch(sourceText, (newVal) => {
  if (newVal === '') {
    encodedText.value = ''
    return
  }
  encodedText.value = encode(newVal)
})

watch(encodeMode, () => {
  if (sourceText.value) {
    encodedText.value = encode(sourceText.value)
  }
})

const handleEncodedInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  const val = target.value
  encodedText.value = val
  if (val === '') {
    sourceText.value = ''
    return
  }
  sourceText.value = decode(val)
}

const copyToClipboard = async (text: string, type: 'source' | 'encoded') => {
  if (!text) return
  await navigator.clipboard.writeText(text)
  if (type === 'source') {
    copiedSource.value = true
    setTimeout(() => (copiedSource.value = false), 2000)
  } else {
    copiedEncoded.value = true
    setTimeout(() => (copiedEncoded.value = false), 2000)
  }
}

const clearAll = () => {
  sourceText.value = ''
  encodedText.value = ''
}
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

    <div class="space-y-6">
      <!-- Mode Toggle -->
      <div class="flex items-center gap-4">
        <span class="text-sm text-muted-foreground">{{ $t('urlEncode.mode') }}:</span>
        <div class="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
          <button
            class="px-3 py-1.5 text-sm rounded-md transition-colors"
            :class="encodeMode === 'component' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'"
            @click="encodeMode = 'component'"
          >
            {{ $t('urlEncode.modeComponent') }}
          </button>
          <button
            class="px-3 py-1.5 text-sm rounded-md transition-colors"
            :class="encodeMode === 'uri' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'"
            @click="encodeMode = 'uri'"
          >
            {{ $t('urlEncode.modeUri') }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 relative">
        <!-- Source Text -->
        <div class="flex flex-col space-y-2 md:space-y-3">
          <div class="flex items-center justify-between px-2 shrink-0">
            <div class="flex items-center gap-2">
              <span class="label-uppercase">{{ $t('urlEncode.source') }}</span>
              <span
                v-if="sourceText"
                class="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground/70 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
              >
                {{ sourceText.length.toLocaleString() }} {{ $t('common.chars') }}
              </span>
            </div>
            <button
              class="btn-icon"
              :title="$t('urlEncode.copySource')"
              :disabled="!sourceText"
              @click="copyToClipboard(sourceText, 'source')"
            >
              <Check v-if="copiedSource" class="h-4 w-4 text-green-500" />
              <Copy v-else class="h-4 w-4 opacity-50 hover:opacity-100" />
            </button>
          </div>

          <textarea
            v-model="sourceText"
            :placeholder="$t('urlEncode.inputPlaceholder')"
            class="flex-1 min-h-[160px] h-[28vh] md:h-80"
          ></textarea>
        </div>

        <!-- Intersection Icon (Desktop Only) -->
        <div
          class="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-2 h-10 w-10 bg-background border rounded-full items-center justify-center z-10 text-muted-foreground"
        >
          <ArrowRightLeft class="h-5 w-5" />
        </div>

        <!-- URL Encoded Output/Input -->
        <div class="flex flex-col space-y-2 md:space-y-3">
          <div class="flex items-center justify-between px-2 shrink-0">
            <div class="flex items-center gap-2">
              <span class="label-uppercase">{{ $t('urlEncode.encoded') }}</span>
              <span
                v-if="encodedText"
                class="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground/70 font-medium"
              >
                {{ encodedText.length.toLocaleString() }} {{ $t('common.chars') }}
              </span>
            </div>
            <button
              class="btn-icon"
              :title="$t('urlEncode.copyEncoded')"
              :disabled="!encodedText"
              @click="copyToClipboard(encodedText, 'encoded')"
            >
              <Check v-if="copiedEncoded" class="h-4 w-4 text-green-500" />
              <Copy v-else class="h-4 w-4 opacity-50 hover:opacity-100" />
            </button>
          </div>

          <textarea
            :value="encodedText"
            :placeholder="$t('urlEncode.encodedPlaceholder')"
            class="h-[28vh] md:h-80"
            @input="handleEncodedInput"
          ></textarea>
        </div>
      </div>

      <!-- Quick Tips -->
      <div class="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 md:p-5 mt-4">
        <p class="text-blue-600/80 font-medium leading-relaxed">
          {{ $t('urlEncode.tip') }}
        </p>
        <p class="text-blue-600/60 text-sm mt-2 leading-relaxed">
          {{ $t('urlEncode.modeTip') }}
        </p>
      </div>
    </div>
  </ToolContainer>
</template>
