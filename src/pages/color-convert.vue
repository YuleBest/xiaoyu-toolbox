<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import convert from 'color-convert'
import { Copy, Check, ImageUp, RefreshCw } from 'lucide-vue-next'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'
import { allTools } from '@/config/tools'

const tool = allTools.find((item) => item.id === 'color-convert')!

// ========== 颜色转换 ==========
// 单一数据源：RGB；其余格式由它派生，任一格式输入再转回 RGB 更新源
const rgb = ref<[number, number, number]>([255, 77, 79])

const hexText = ref('')
const redText = ref<number | null>(null)
const greenText = ref<number | null>(null)
const blueText = ref<number | null>(null)
const hslH = ref<number | null>(null)
const hslS = ref<number | null>(null)
const hslL = ref<number | null>(null)
const hsvH = ref<number | null>(null)
const hsvS = ref<number | null>(null)
const hsvV = ref<number | null>(null)
const cmykC = ref<number | null>(null)
const cmykM = ref<number | null>(null)
const cmykY = ref<number | null>(null)
const cmykK = ref<number | null>(null)

let applying = false

syncInputs()

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

const parseNum = (text: string | number | null | undefined): number | null => {
  const v = Number.parseFloat(String(text ?? '').trim())
  return Number.isNaN(v) ? null : v
}

function applyRgb(r: number, g: number, b: number) {
  rgb.value = [
    clamp(Math.round(r), 0, 255),
    clamp(Math.round(g), 0, 255),
    clamp(Math.round(b), 0, 255),
  ]
  syncInputs()
}

function syncInputs() {
  applying = true
  const [r, g, b] = rgb.value
  hexText.value = `#${convert.rgb.hex(r, g, b).toLowerCase()}`
  redText.value = r
  greenText.value = g
  blueText.value = b
  const [h, s, l] = convert.rgb.hsl(r, g, b)
  hslH.value = Math.round(h)
  hslS.value = Math.round(s)
  hslL.value = Math.round(l)
  const [hv, sv, vv] = convert.rgb.hsv(r, g, b)
  hsvH.value = Math.round(hv)
  hsvS.value = Math.round(sv)
  hsvV.value = Math.round(vv)
  const [c, m, y, k] = convert.rgb.cmyk(r, g, b)
  cmykC.value = Math.round(c)
  cmykM.value = Math.round(m)
  cmykY.value = Math.round(y)
  cmykK.value = Math.round(k)
  applying = false
}

function onHexInput() {
  const raw = hexText.value.trim().replace(/^#/, '')
  if (!/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw)) return
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  const [r, g, b] = convert.hex.rgb(full)
  applyRgb(r ?? 0, g ?? 0, b ?? 0)
}

function applyHex(value: string) {
  const raw = value.replace(/^#/, '')
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return
  const [r, g, b] = convert.hex.rgb(raw)
  applyRgb(r ?? 0, g ?? 0, b ?? 0)
}

function onRgbInput() {
  const r = parseNum(redText.value)
  const g = parseNum(greenText.value)
  const b = parseNum(blueText.value)
  if (r === null || g === null || b === null) return
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) return
  applyRgb(r, g, b)
}

function onHslInput() {
  const h = parseNum(hslH.value)
  const s = parseNum(hslS.value)
  const l = parseNum(hslL.value)
  if (h === null || s === null || l === null) return
  if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) return
  const [r, g, b] = convert.hsl.rgb(h, s, l)
  applyRgb(r ?? 0, g ?? 0, b ?? 0)
}

function onHsvInput() {
  const h = parseNum(hsvH.value)
  const s = parseNum(hsvS.value)
  const v = parseNum(hsvV.value)
  if (h === null || s === null || v === null) return
  if (h < 0 || h > 360 || s < 0 || s > 100 || v < 0 || v > 100) return
  const [r, g, b] = convert.hsv.rgb(h, s, v)
  applyRgb(r ?? 0, g ?? 0, b ?? 0)
}

function onCmykInput() {
  const c = parseNum(cmykC.value)
  const m = parseNum(cmykM.value)
  const y = parseNum(cmykY.value)
  const k = parseNum(cmykK.value)
  if (c === null || m === null || y === null || k === null) return
  if (c < 0 || c > 100 || m < 0 || m > 100 || y < 0 || y > 100 || k < 0 || k > 100) return
  const [r, g, b] = convert.cmyk.rgb(c, m, y, k)
  applyRgb(r ?? 0, g ?? 0, b ?? 0)
}

function onPickerInput(e: Event) {
  applyHex((e.target as HTMLInputElement).value)
}

// 监听各格式输入变化（flush: sync 确保在 syncInputs 赋值过程中同步触发，applying 标记可拦截程序性更新）
watch(hexText, () => {
  if (applying) return
  onHexInput()
}, { flush: 'sync' })

watch([redText, greenText, blueText], () => {
  if (applying) return
  onRgbInput()
}, { flush: 'sync' })

watch([hslH, hslS, hslL], () => {
  if (applying) return
  onHslInput()
}, { flush: 'sync' })

watch([hsvH, hsvS, hsvV], () => {
  if (applying) return
  onHsvInput()
}, { flush: 'sync' })

watch([cmykC, cmykM, cmykY, cmykK], () => {
  if (applying) return
  onCmykInput()
}, { flush: 'sync' })

// ========== 复制 ==========
const copiedRow = ref('')
let copyTimer: ReturnType<typeof setTimeout> | null = null

function copyFormat(key: 'hex' | 'rgb' | 'hsl' | 'hsv' | 'cmyk') {
  const values: Record<string, string> = {
    hex: hexText.value,
    rgb: `rgb(${redText.value ?? 0}, ${greenText.value ?? 0}, ${blueText.value ?? 0})`,
    hsl: `hsl(${hslH.value ?? 0}, ${hslS.value ?? 0}%, ${hslL.value ?? 0}%)`,
    hsv: `hsv(${hsvH.value ?? 0}, ${hsvS.value ?? 0}%, ${hsvV.value ?? 0}%)`,
    cmyk: `cmyk(${cmykC.value ?? 0}%, ${cmykM.value ?? 0}%, ${cmykY.value ?? 0}%, ${cmykK.value ?? 0}%)`,
  }
  navigator.clipboard?.writeText(values[key] ?? hexText.value)
  copiedRow.value = key
  if (copyTimer) clearTimeout(copyTimer)
  copyTimer = setTimeout(() => (copiedRow.value = ''), 1500)
}

// ========== 颜色板 ==========
const presetColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#64748b',
  '#000000', '#ffffff',
]

// ========== 图片取色 ==========
const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref('')
const imageEl = ref<HTMLImageElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
const magnifierEl = ref<HTMLCanvasElement | null>(null)
const imgReady = ref(false)
const picked = ref<{ x: number; y: number; left: number; top: number } | null>(null)

function handleFile(file: File | undefined) {
  if (!file || !file.type.startsWith('image/')) return
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
  imgReady.value = false
  picked.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function onFileChange(e: Event) {
  handleFile((e.target as HTMLInputElement).files?.[0])
}

function onDrop(e: DragEvent) {
  handleFile(e.dataTransfer?.files?.[0])
}

function clearImage() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
  imgReady.value = false
  picked.value = null
}

onUnmounted(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

function onImageLoaded() {
  const img = imageEl.value
  const canvas = canvasEl.value
  if (!img || !canvas) return
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  canvas.getContext('2d')?.drawImage(img, 0, 0)
  imgReady.value = true
}

function onImageClick(e: MouseEvent) {
  const img = imageEl.value
  const canvas = canvasEl.value
  if (!img || !canvas || !imgReady.value || canvas.width === 0 || canvas.height === 0) return
  const rect = img.getBoundingClientRect()
  const scale = Math.min(rect.width / canvas.width, rect.height / canvas.height)
  const contentW = canvas.width * scale
  const contentH = canvas.height * scale
  const offsetX = (rect.width - contentW) / 2
  const offsetY = (rect.height - contentH) / 2
  const px = (e.clientX - rect.left - offsetX) / scale
  const py = (e.clientY - rect.top - offsetY) / scale
  const x = clamp(Math.floor(px), 0, canvas.width - 1)
  const y = clamp(Math.floor(py), 0, canvas.height - 1)
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const data = ctx.getImageData(x, y, 1, 1).data
  applyRgb(data[0] ?? 0, data[1] ?? 0, data[2] ?? 0)
  picked.value = { x, y, left: (x / canvas.width) * 100, top: (y / canvas.height) * 100 }
  drawMagnifier(x, y)
}

function drawMagnifier(x: number, y: number) {
  const canvas = canvasEl.value
  const mag = magnifierEl.value
  if (!canvas || !mag) return
  const ctx = mag.getContext('2d')
  if (!ctx) return
  const half = 12
  const size = 128
  const sx = clamp(x - half, 0, Math.max(0, canvas.width - half * 2))
  const sy = clamp(y - half, 0, Math.max(0, canvas.height - half * 2))
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, size, size)
  ctx.drawImage(canvas, sx, sy, half * 2, half * 2, 0, 0, size, size)
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(size / 2 - 8, size / 2)
  ctx.lineTo(size / 2 + 8, size / 2)
  ctx.moveTo(size / 2, size / 2 - 8)
  ctx.lineTo(size / 2, size / 2 + 8)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'
  ctx.strokeRect(0.5, 0.5, size - 1, size - 1)
}

// ========== 样式常量 ==========
const hexClass =
  'flex-1 min-w-0 h-9 px-3 rounded-lg bg-muted/30 border border-transparent focus:bg-background focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none font-mono text-sm transition-all'
const copyBtnClass = 'shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors'
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="max-w-5xl mx-auto flex flex-col gap-6 md:gap-8">
      <!-- 预览 + 转换输入 -->
      <section class="bg-card border rounded-2xl p-5 md:p-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
        <div class="flex flex-col gap-3">
          <div class="h-40 rounded-xl border" :style="{ backgroundColor: hexText }"></div>
          <div class="flex items-center gap-2">
            <code class="font-mono text-sm flex-1">{{ hexText }}</code>
            <button :class="copyBtnClass" :title="$t('colorConvert.copy')" @click="copyFormat('hex')">
              <Check v-if="copiedRow === 'hex'" class="h-4 w-4 text-green-500" />
              <Copy v-else class="h-4 w-4" />
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <!-- HEX -->
          <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span class="w-12 shrink-0 text-xs font-semibold text-muted-foreground">{{
              $t('colorConvert.hex')
            }}</span>
            <input v-model="hexText" type="text" :class="hexClass" />
            <button :class="copyBtnClass" :title="$t('colorConvert.copy')" @click="copyFormat('hex')">
              <Check v-if="copiedRow === 'hex'" class="h-4 w-4 text-green-500" />
              <Copy v-else class="h-4 w-4" />
            </button>
          </div>

          <!-- RGB -->
          <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span class="w-12 shrink-0 text-xs font-semibold text-muted-foreground">{{
              $t('colorConvert.rgb')
            }}</span>
            <div class="flex flex-wrap gap-1 items-end">
              <div class="flex flex-col items-center gap-1">
                <span class="text-[10px] text-muted-foreground">{{ $t('colorConvert.r') }}</span>
                <NumberField v-model="redText" :min="0" :max="255" :step="1" class="w-24">
              <NumberFieldContent>
                <NumberFieldDecrement class="p-1" />
                <NumberFieldInput />
                <NumberFieldIncrement class="p-1" />
              </NumberFieldContent>
            </NumberField>
              </div>
              <div class="flex flex-col items-center gap-1">
                <span class="text-[10px] text-muted-foreground">{{ $t('colorConvert.g') }}</span>
                <NumberField v-model="greenText" :min="0" :max="255" :step="1" class="w-24">
              <NumberFieldContent>
                <NumberFieldDecrement class="p-1" />
                <NumberFieldInput />
                <NumberFieldIncrement class="p-1" />
              </NumberFieldContent>
            </NumberField>
              </div>
              <div class="flex flex-col items-center gap-1">
                <span class="text-[10px] text-muted-foreground">{{ $t('colorConvert.b') }}</span>
                <NumberField v-model="blueText" :min="0" :max="255" :step="1" class="w-24">
              <NumberFieldContent>
                <NumberFieldDecrement class="p-1" />
                <NumberFieldInput />
                <NumberFieldIncrement class="p-1" />
              </NumberFieldContent>
            </NumberField>
              </div>
            </div>
            <button :class="copyBtnClass" :title="$t('colorConvert.copy')" @click="copyFormat('rgb')">
              <Check v-if="copiedRow === 'rgb'" class="h-4 w-4 text-green-500" />
              <Copy v-else class="h-4 w-4" />
            </button>
          </div>

          <!-- HSL -->
          <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span class="w-12 shrink-0 text-xs font-semibold text-muted-foreground">{{
              $t('colorConvert.hsl')
            }}</span>
            <div class="flex flex-wrap gap-1 items-end">
              <div class="flex flex-col items-center gap-1">
                <span class="text-[10px] text-muted-foreground">{{ $t('colorConvert.h') }}</span>
                <NumberField v-model="hslH" :min="0" :max="360" :step="1" class="w-24">
              <NumberFieldContent>
                <NumberFieldDecrement class="p-1" />
                <NumberFieldInput />
                <NumberFieldIncrement class="p-1" />
              </NumberFieldContent>
            </NumberField>
              </div>
              <div class="flex flex-col items-center gap-1">
                <span class="text-[10px] text-muted-foreground">{{ $t('colorConvert.s') }}</span>
                <NumberField v-model="hslS" :min="0" :max="100" :step="1" class="w-24">
              <NumberFieldContent>
                <NumberFieldDecrement class="p-1" />
                <NumberFieldInput />
                <NumberFieldIncrement class="p-1" />
              </NumberFieldContent>
            </NumberField>
              </div>
              <div class="flex flex-col items-center gap-1">
                <span class="text-[10px] text-muted-foreground">{{ $t('colorConvert.l') }}</span>
                <NumberField v-model="hslL" :min="0" :max="100" :step="1" class="w-24">
              <NumberFieldContent>
                <NumberFieldDecrement class="p-1" />
                <NumberFieldInput />
                <NumberFieldIncrement class="p-1" />
              </NumberFieldContent>
            </NumberField>
              </div>
            </div>
            <button :class="copyBtnClass" :title="$t('colorConvert.copy')" @click="copyFormat('hsl')">
              <Check v-if="copiedRow === 'hsl'" class="h-4 w-4 text-green-500" />
              <Copy v-else class="h-4 w-4" />
            </button>
          </div>

          <!-- HSV -->
          <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span class="w-12 shrink-0 text-xs font-semibold text-muted-foreground">{{
              $t('colorConvert.hsv')
            }}</span>
            <div class="flex flex-wrap gap-1 items-end">
              <div class="flex flex-col items-center gap-1">
                <span class="text-[10px] text-muted-foreground">{{ $t('colorConvert.h') }}</span>
                <NumberField v-model="hsvH" :min="0" :max="360" :step="1" class="w-24">
              <NumberFieldContent>
                <NumberFieldDecrement class="p-1" />
                <NumberFieldInput />
                <NumberFieldIncrement class="p-1" />
              </NumberFieldContent>
            </NumberField>
              </div>
              <div class="flex flex-col items-center gap-1">
                <span class="text-[10px] text-muted-foreground">{{ $t('colorConvert.s') }}</span>
                <NumberField v-model="hsvS" :min="0" :max="100" :step="1" class="w-24">
              <NumberFieldContent>
                <NumberFieldDecrement class="p-1" />
                <NumberFieldInput />
                <NumberFieldIncrement class="p-1" />
              </NumberFieldContent>
            </NumberField>
              </div>
              <div class="flex flex-col items-center gap-1">
                <span class="text-[10px] text-muted-foreground">{{ $t('colorConvert.v') }}</span>
                <NumberField v-model="hsvV" :min="0" :max="100" :step="1" class="w-24">
              <NumberFieldContent>
                <NumberFieldDecrement class="p-1" />
                <NumberFieldInput />
                <NumberFieldIncrement class="p-1" />
              </NumberFieldContent>
            </NumberField>
              </div>
            </div>
            <button :class="copyBtnClass" :title="$t('colorConvert.copy')" @click="copyFormat('hsv')">
              <Check v-if="copiedRow === 'hsv'" class="h-4 w-4 text-green-500" />
              <Copy v-else class="h-4 w-4" />
            </button>
          </div>

          <!-- CMYK -->
          <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span class="w-12 shrink-0 text-xs font-semibold text-muted-foreground">{{
              $t('colorConvert.cmyk')
            }}</span>
            <div class="flex flex-wrap gap-1 items-end">
              <div class="flex flex-col items-center gap-1">
                <span class="text-[10px] text-muted-foreground">{{ $t('colorConvert.c') }}</span>
                <NumberField v-model="cmykC" :min="0" :max="100" :step="1" class="w-24">
              <NumberFieldContent>
                <NumberFieldDecrement class="p-1" />
                <NumberFieldInput />
                <NumberFieldIncrement class="p-1" />
              </NumberFieldContent>
            </NumberField>
              </div>
              <div class="flex flex-col items-center gap-1">
                <span class="text-[10px] text-muted-foreground">{{ $t('colorConvert.m') }}</span>
                <NumberField v-model="cmykM" :min="0" :max="100" :step="1" class="w-24">
              <NumberFieldContent>
                <NumberFieldDecrement class="p-1" />
                <NumberFieldInput />
                <NumberFieldIncrement class="p-1" />
              </NumberFieldContent>
            </NumberField>
              </div>
              <div class="flex flex-col items-center gap-1">
                <span class="text-[10px] text-muted-foreground">{{ $t('colorConvert.y') }}</span>
                <NumberField v-model="cmykY" :min="0" :max="100" :step="1" class="w-24">
              <NumberFieldContent>
                <NumberFieldDecrement class="p-1" />
                <NumberFieldInput />
                <NumberFieldIncrement class="p-1" />
              </NumberFieldContent>
            </NumberField>
              </div>
              <div class="flex flex-col items-center gap-1">
                <span class="text-[10px] text-muted-foreground">{{ $t('colorConvert.k') }}</span>
                <NumberField v-model="cmykK" :min="0" :max="100" :step="1" class="w-24">
              <NumberFieldContent>
                <NumberFieldDecrement class="p-1" />
                <NumberFieldInput />
                <NumberFieldIncrement class="p-1" />
              </NumberFieldContent>
            </NumberField>
              </div>
            </div>
            <button :class="copyBtnClass" :title="$t('colorConvert.copy')" @click="copyFormat('cmyk')">
              <Check v-if="copiedRow === 'cmyk'" class="h-4 w-4 text-green-500" />
              <Copy v-else class="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <!-- 颜色板 -->
      <section class="bg-card border rounded-2xl p-5 md:p-6 flex flex-col gap-4">
        <h2 class="text-base font-semibold">{{ $t('colorConvert.palette') }}</h2>
        <div class="flex items-center gap-3">
          <input
            type="color"
            :value="hexText"
            class="size-10 rounded-lg border cursor-pointer bg-background"
            @input="onPickerInput"
          />
          <span class="text-sm text-muted-foreground">{{ $t('colorConvert.picker') }}</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="c in presetColors"
            :key="c"
            class="size-8 rounded-lg border border-border/50 hover:scale-110 transition-transform"
            :style="{ backgroundColor: c }"
            :title="c"
            @click="applyHex(c)"
          />
        </div>
      </section>

      <!-- 图片取色 -->
      <section
        class="bg-card border rounded-2xl p-5 md:p-6 flex flex-col gap-4"
        @dragover.prevent
        @drop.prevent="onDrop"
      >
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-base font-semibold">{{ $t('colorConvert.imagePick') }}</h2>
          <button
            v-if="previewUrl"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-muted/50 transition-colors"
            @click="clearImage"
          >
            <RefreshCw class="h-3.5 w-3.5" />
            {{ $t('colorConvert.replace') }}
          </button>
        </div>

        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
        <canvas ref="canvasEl" class="hidden"></canvas>

        <div v-if="previewUrl" class="flex flex-col gap-4">
          <div
            class="relative rounded-xl overflow-hidden border bg-muted/20 cursor-crosshair"
            @click="onImageClick"
          >
            <img
              ref="imageEl"
              :src="previewUrl"
              alt="uploaded"
              class="w-full max-h-96 object-contain"
              @load="onImageLoaded"
            />
            <div
              v-if="picked"
              class="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow ring-1 ring-black/30"
              :style="{ left: picked.left + '%', top: picked.top + '%' }"
            ></div>
          </div>
          <div class="flex flex-wrap items-center gap-4">
            <canvas ref="magnifierEl" width="128" height="128" class="size-32 rounded-xl border bg-background"></canvas>
            <div class="flex flex-col gap-2">
              <span class="text-xs text-muted-foreground">{{ $t('colorConvert.picked') }}</span>
              <div class="flex items-center gap-2">
                <div class="size-8 rounded-lg border" :style="{ backgroundColor: hexText }"></div>
                <code class="font-mono text-sm">{{ hexText }}</code>
              </div>
            </div>
          </div>
          <p class="text-xs text-muted-foreground">{{ $t('colorConvert.pickHint') }}</p>
        </div>

        <button
          v-else
          class="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/60 py-12 text-muted-foreground hover:border-blue-500/40 hover:text-foreground transition-colors"
          @click="fileInput?.click()"
        >
          <ImageUp class="h-10 w-10 opacity-40" />
          <span class="text-sm font-medium">{{ $t('colorConvert.uploadHint') }}</span>
        </button>
      </section>
    </div>
  </ToolContainer>
</template>
