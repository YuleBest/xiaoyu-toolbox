<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Mic, MicOff, RotateCcw } from 'lucide-vue-next'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import { allTools } from '@/config/tools'

const { t } = useI18n()
const tool = allTools.find((t) => t.id === 'decibel')!

const isListening = ref(false)
const db = ref(0)
const peakDb = ref(0)
const avgDb = ref(0)
const permissionDenied = ref(false)

let audioCtx: AudioContext | null = null
let analyser: AnalyserNode | null = null
let stream: MediaStream | null = null
let animFrameId: number | null = null
let sampleCount = 0
let sumDb = 0

// --- 实时统计图 ---
const chartCanvas = ref<HTMLCanvasElement | null>(null)
const HISTORY_SIZE = 150
const history: number[] = []

const drawChart = () => {
  const canvas = chartCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 同步 canvas 分辨率到显示尺寸
  if (canvas.offsetWidth > 0 && canvas.offsetWidth !== canvas.width) {
    canvas.width = canvas.offsetWidth
  }
  const W = canvas.width
  const H = canvas.height

  ctx.clearRect(0, 0, W, H)

  const isDark = document.documentElement.classList.contains('dark')
  const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
  const labelColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'

  // 等级色带背景
  const bands = [
    [0, 30, 'rgba(34,197,94,0.06)'],
    [30, 50, 'rgba(132,204,22,0.05)'],
    [50, 65, 'rgba(234,179,8,0.05)'],
    [65, 80, 'rgba(249,115,22,0.05)'],
    [80, 100, 'rgba(239,68,68,0.07)'],
  ] as const
  for (const [lo, hi, color] of bands) {
    ctx.fillStyle = color
    ctx.fillRect(0, H - (hi / 100) * H, W, ((hi - lo) / 100) * H)
  }

  // 水平网格线 + 标签
  ctx.strokeStyle = gridColor
  ctx.lineWidth = 1
  for (const mark of [25, 50, 75]) {
    const y = H - (mark / 100) * H
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
    ctx.fillStyle = labelColor
    ctx.font = '10px monospace'
    ctx.fillText(mark + ' dB', 4, y - 3)
  }

  if (history.length < 2) return

  const stepX = W / HISTORY_SIZE
  const offsetX = (HISTORY_SIZE - history.length) * stepX

  // 填充区梯度
  const fillGrad = ctx.createLinearGradient(0, 0, 0, H)
  fillGrad.addColorStop(0, 'rgba(99,102,241,0.28)')
  fillGrad.addColorStop(1, 'rgba(99,102,241,0)')
  ctx.beginPath()
  ctx.moveTo(offsetX, H)
  for (let i = 0; i < history.length; i++) {
    const x = offsetX + i * stepX
    const y = H - (Math.min(history[i]!, 100) / 100) * H
    ctx.lineTo(x, y)
  }
  ctx.lineTo(offsetX + (history.length - 1) * stepX, H)
  ctx.closePath()
  ctx.fillStyle = fillGrad
  ctx.fill()

  // 折线
  ctx.beginPath()
  for (let i = 0; i < history.length; i++) {
    const x = offsetX + i * stepX
    const y = H - (Math.min(history[i]!, 100) / 100) * H
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.strokeStyle = isDark ? 'rgba(129,140,248,0.95)' : 'rgba(79,70,229,0.85)'
  ctx.lineWidth = 2
  ctx.lineJoin = 'round'
  ctx.stroke()

  // 当前值圆点（带描边）
  const lastX = offsetX + (history.length - 1) * stepX
  const lastVal = history[history.length - 1]!
  const lastY = H - (Math.min(lastVal, 100) / 100) * H
  ctx.beginPath()
  ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2)
  ctx.fillStyle = isDark ? '#818cf8' : '#4f46e5'
  ctx.fill()
  ctx.strokeStyle = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // 峰值线（橙红色虚线 + 右侧标签）
  const peakVal = peakDb.value
  if (peakVal > 0) {
    const peakY = H - (Math.min(peakVal, 100) / 100) * H
    ctx.save()
    ctx.setLineDash([4, 3])
    ctx.strokeStyle = isDark ? 'rgba(251,146,60,0.85)' : 'rgba(234,88,12,0.75)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(0, peakY)
    ctx.lineTo(W, peakY)
    ctx.stroke()
    ctx.restore()
    ctx.fillStyle = isDark ? 'rgba(251,146,60,0.9)' : 'rgba(234,88,12,0.85)'
    ctx.font = 'bold 10px monospace'
    ctx.textAlign = 'right'
    ctx.fillText('↑' + peakVal + ' dB', W - 4, peakY - 3)
    ctx.textAlign = 'left'
  }

  // 平均值线（蓝绿色虚线 + 右侧标签）
  const avgVal = avgDb.value
  if (avgVal > 0) {
    const avgY = H - (Math.min(avgVal, 100) / 100) * H
    ctx.save()
    ctx.setLineDash([6, 4])
    ctx.strokeStyle = isDark ? 'rgba(34,211,238,0.7)' : 'rgba(8,145,178,0.65)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(0, avgY)
    ctx.lineTo(W, avgY)
    ctx.stroke()
    ctx.restore()
    ctx.fillStyle = isDark ? 'rgba(34,211,238,0.9)' : 'rgba(8,145,178,0.85)'
    ctx.font = 'bold 10px monospace'
    ctx.textAlign = 'right'
    // 若峰值线与平均值线过近，向下偏移标签避免重叠
    const peakY2 = peakVal > 0 ? H - (Math.min(peakVal, 100) / 100) * H : -999
    const labelY = Math.abs(avgY - peakY2) < 14 ? avgY + 11 : avgY - 3
    ctx.fillText('~' + avgVal + ' dB', W - 4, labelY)
    ctx.textAlign = 'left'
  }
}

// 分贝等级定义
const levels = [
  { max: 30, label: 'decibel.levelQuiet', color: '#22c55e', bg: 'bg-emerald-500' },
  { max: 50, label: 'decibel.levelNormal', color: '#84cc16', bg: 'bg-lime-400' },
  { max: 65, label: 'decibel.levelMedium', color: '#eab308', bg: 'bg-yellow-400' },
  { max: 80, label: 'decibel.levelLoud', color: '#f97316', bg: 'bg-orange-400' },
  { max: 95, label: 'decibel.levelVeryLoud', color: '#ef4444', bg: 'bg-red-500' },
  { max: 120, label: 'decibel.levelDangerous', color: '#dc2626', bg: 'bg-red-700' },
]

const currentLevel = computed(() => {
  for (const lvl of levels) {
    if (db.value <= lvl.max) return lvl
  }
  return levels[levels.length - 1]!
})

const meterPercent = computed(() => Math.min(100, Math.max(0, (db.value / 100) * 100)))
const peakPercent = computed(() => Math.min(100, Math.max(0, (peakDb.value / 100) * 100)))

// 将 RMS 线性能量值转换为 dB（相对满量程）
const rmsToDb = (rms: number): number => {
  if (rms === 0) return 0
  const db = 20 * Math.log10(rms)
  // 映射到 0-100 dB 范围（-100 dBFS → 0 dB, 0 dBFS → 100 dB）
  return Math.max(0, Math.round(db + 100))
}

const tick = () => {
  if (!analyser) return
  const bufferLength = analyser.fftSize
  const dataArray = new Float32Array(bufferLength)
  analyser.getFloatTimeDomainData(dataArray)

  // 计算 RMS
  let sum = 0
  for (let i = 0; i < bufferLength; i++) {
    const s = dataArray[i] ?? 0
    sum += s * s
  }
  const rms = Math.sqrt(sum / bufferLength)
  const currentDb = rmsToDb(rms)

  db.value = currentDb
  if (currentDb > peakDb.value) peakDb.value = currentDb

  sampleCount++
  sumDb += currentDb
  avgDb.value = Math.round(sumDb / sampleCount)

  // 写入历史并刷新图表
  history.push(currentDb)
  if (history.length > HISTORY_SIZE) history.shift()
  drawChart()

  animFrameId = requestAnimationFrame(tick)
}

const start = async () => {
  permissionDenied.value = false
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    audioCtx = new AudioContext()
    analyser = audioCtx.createAnalyser()
    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.6

    const source = audioCtx.createMediaStreamSource(stream)
    source.connect(analyser)

    isListening.value = true
    peakDb.value = 0
    sampleCount = 0
    sumDb = 0
    avgDb.value = 0
    history.length = 0
    drawChart()
    tick()
  } catch (e: unknown) {
    if (
      e instanceof Error &&
      (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError')
    ) {
      permissionDenied.value = true
    }
  }
}

const stop = () => {
  if (animFrameId !== null) {
    cancelAnimationFrame(animFrameId)
    animFrameId = null
  }
  if (stream) {
    stream.getTracks().forEach((t) => t.stop())
    stream = null
  }
  if (audioCtx) {
    audioCtx.close()
    audioCtx = null
  }
  analyser = null
  isListening.value = false
  db.value = 0
}

const reset = () => {
  peakDb.value = 0
  avgDb.value = 0
  sampleCount = 0
  sumDb = 0
  history.length = 0
  drawChart()
}

const toggle = () => {
  if (isListening.value) stop()
  else start()
}

onUnmounted(() => {
  stop()
})
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 pt-4">
      <!-- 权限拒绝提示（跨全宽） -->
      <div
        v-if="permissionDenied"
        class="flex items-start gap-3 px-5 py-4 mb-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-600 dark:text-rose-400 text-sm"
      >
        <MicOff class="h-5 w-5 shrink-0 mt-0.5" />
        {{ t('decibel.permissionDenied') }}
      </div>

      <div class="flex flex-col lg:flex-row gap-5">
        <!-- ===== 左侧：主仪表盘 + 操作按钮 ===== -->
        <div class="flex flex-col gap-5 lg:w-80 shrink-0">
          <!-- 主显示区 -->
          <div
            class="bg-card/40 border-2 border-muted/40 rounded-3xl p-8 flex flex-col items-center gap-5"
          >
            <!-- dB 数值 -->
            <div class="text-center space-y-1">
              <div
                class="text-8xl font-bold font-mono tabular-nums leading-none transition-all duration-100"
                :style="{ color: currentLevel.color }"
              >
                {{ db }}
              </div>
              <div class="text-lg text-muted-foreground font-medium">dB</div>
            </div>

            <!-- 等级标签 -->
            <div
              class="px-4 py-1.5 rounded-full text-sm font-semibold text-white transition-all duration-300"
              :class="currentLevel.bg"
            >
              {{ t(currentLevel.label) }}
            </div>

            <!-- 电平条 -->
            <div class="w-full space-y-2">
              <div class="relative h-5 bg-muted/40 rounded-full overflow-hidden">
                <div
                  class="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
                  :style="{
                    width: meterPercent + '%',
                    background:
                      'linear-gradient(to right, #22c55e, #84cc16, #eab308, #f97316, #ef4444)',
                  }"
                />
                <div
                  class="absolute top-0 bottom-0 w-0.5 bg-white/80 transition-all duration-200"
                  :style="{ left: peakPercent + '%' }"
                />
              </div>
              <div class="flex justify-between text-xs text-muted-foreground font-mono">
                <span>0</span>
                <span>20</span>
                <span>40</span>
                <span>60</span>
                <span>80</span>
                <span>100+</span>
              </div>
            </div>

            <!-- 统计卡片 -->
            <div class="w-full grid grid-cols-2 gap-3">
              <div class="bg-muted/30 rounded-2xl px-4 py-3 text-center">
                <div class="text-xs text-muted-foreground mb-1">{{ t('decibel.peak') }}</div>
                <div class="text-2xl font-bold font-mono">{{ peakDb }}</div>
                <div class="text-xs text-muted-foreground">dB</div>
              </div>
              <div class="bg-muted/30 rounded-2xl px-4 py-3 text-center">
                <div class="text-xs text-muted-foreground mb-1">{{ t('decibel.average') }}</div>
                <div class="text-2xl font-bold font-mono">{{ avgDb }}</div>
                <div class="text-xs text-muted-foreground">dB</div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-3">
            <button
              class="flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium rounded-2xl transition-all active:scale-95 text-white"
              :class="
                isListening ? 'bg-rose-500 hover:bg-rose-600' : 'bg-blue-500 hover:bg-blue-600'
              "
              @click="toggle"
            >
              <MicOff v-if="isListening" class="h-5 w-5" />
              <Mic v-else class="h-5 w-5" />
              {{ isListening ? t('decibel.stop') : t('decibel.start') }}
            </button>
            <button
              :disabled="!isListening"
              class="flex items-center justify-center gap-2 px-5 py-4 bg-muted/40 text-muted-foreground hover:bg-muted/60 rounded-2xl font-medium transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              :title="t('common.reset')"
              @click="reset"
            >
              <RotateCcw class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- ===== 右侧：统计图 + 等级参考表 ===== -->
        <div class="flex flex-col gap-5 flex-1 min-w-0">
          <!-- 实时统计图 -->
          <div class="bg-card/40 border-2 border-muted/40 rounded-3xl p-5 space-y-3">
            <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {{ t('decibel.chart') }}
            </h3>
            <canvas ref="chartCanvas" class="w-full block rounded-xl" height="140" />
          </div>

          <!-- 等级参考表 -->
          <div class="bg-card/40 border-2 border-muted/40 rounded-3xl p-5 space-y-3">
            <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {{ t('decibel.reference') }}
            </h3>
            <div class="grid sm:grid-cols-2 gap-x-6 gap-y-2">
              <div v-for="(lvl, i) in levels" :key="i" class="flex items-center gap-3 text-sm">
                <div class="w-2.5 h-2.5 rounded-full shrink-0" :class="lvl.bg" />
                <span class="w-24 font-mono text-muted-foreground text-xs shrink-0">
                  {{ i === 0 ? '≤ 30' : (levels[i - 1]?.max ?? 0) + 1 + ' – ' + lvl.max }} dB
                </span>
                <span class="shrink-0">{{ t(lvl.label) }}</span>
                <span class="text-muted-foreground text-xs ml-auto truncate">
                  {{ t(lvl.label + 'Eg') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>
