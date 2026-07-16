<script setup lang="ts">
import { ref, watch } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import 'katex/contrib/mhchem'
import { FlaskConical, Equal, Eraser, Copy, Check } from 'lucide-vue-next'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import { allTools } from '@/config/tools'

import { parseEquation, balanceEquation } from '@/lib/balance-engine'
import type { Compound } from '@/lib/balance-engine'

const tool = allTools.find((r) => r.id === 'balance')!

const input = ref('')
const balanced = ref('')
const latexHtml = ref('')
const error = ref('')
const copied = ref(false)

interface DetailRow {
  element: string
  leftBefore: number
  rightBefore: number
  leftAfter: number
  rightAfter: number
}

const detailRows = ref<DetailRow[]>([])
const isBalanced = ref(false)

function doBalance() {
  error.value = ''
  balanced.value = ''
  latexHtml.value = ''
  detailRows.value = []
  isBalanced.value = false

  const raw = input.value.trim()
  if (!raw) return

  // 统一箭头和等号
  const normalized = raw
    .replace(/->/g, '=')
    .replace(/→/g, '=')
    .replace(/⟶/g, '=')
    .replace(/-->/g, '=')

  const parsed = parseEquation(normalized)
  if (!parsed) {
    error.value = '无法解析方程式，请检查格式。注意：方程式前不要加系数，双原子单质需写为 O₂、H₂ 等'
    return
  }

  const coeffs = balanceEquation(parsed.reactants, parsed.products)
  if (!coeffs) {
    error.value = '无法配平此方程式，请检查化学式是否正确'
    return
  }

  // 验证质量守恒
  const allElems = new Set<string>()
  for (const c of [...parsed.reactants, ...parsed.products]) {
    for (const e of Object.keys(c.elements)) allElems.add(e)
  }
  for (const elem of allElems) {
    let left = 0
    let right = 0
    for (let i = 0; i < parsed.reactants.length; i++) {
      left += (parsed.reactants[i]!.elements[elem] || 0) * coeffs[i]!
    }
    for (let i = 0; i < parsed.products.length; i++) {
      right += (parsed.products[i]!.elements[elem] || 0) * coeffs[parsed.reactants.length + i]!
    }
    if (left !== right) {
      error.value = '原子不守恒，请检查化学式是否书写正确'
      return
    }
  }

  // 构建配平后的方程式字符串
  const formatCompound = (c: Compound, coeff: number) => (coeff === 1 ? c.raw : `${coeff} ${c.raw}`)

  const leftSide = parsed.reactants.map((c, i) => formatCompound(c, coeffs[i]!)).join(' + ')
  const rightSide = parsed.products
    .map((c, i) => formatCompound(c, coeffs[parsed.reactants.length + i]!))
    .join(' + ')

  const result = `${leftSide} = ${rightSide}`
  balanced.value = result.replace(/ = /g, ' → ')

  // 渲染 LaTeX（mhchem 中裸 + 会被解析为正电荷上标，转义为 {+}）
  const latex = result
    .replace(/ = /g, ' \\rightarrow ')
    .replace(/\+/g, ' {+} ')
    .replace(/\s+/g, ' ')
    .trim()
  latexHtml.value = katex.renderToString(`\\ce{${latex}}`, {
    throwOnError: false,
    displayMode: true,
  })

  // 生成元素计数详情
  isBalanced.value = true
  const detailElems = new Set<string>()
  for (const c of [...parsed.reactants, ...parsed.products]) {
    for (const e of Object.keys(c.elements)) detailElems.add(e)
  }
  detailRows.value = [...detailElems].map((elem) => {
    let lb = 0,
      rb = 0,
      la = 0,
      ra = 0
    for (let i = 0; i < parsed.reactants.length; i++) {
      const raw = parsed.reactants[i]!.elements[elem] || 0
      lb += raw
      la += raw * coeffs[i]!
    }
    for (let i = 0; i < parsed.products.length; i++) {
      const raw = parsed.products[i]!.elements[elem] || 0
      rb += raw
      ra += raw * coeffs[parsed.reactants.length + i]!
    }
    return { element: elem, leftBefore: lb, rightBefore: rb, leftAfter: la, rightAfter: ra }
  })
}

watch(input, () => {
  if (input.value.trim()) {
    doBalance()
  } else {
    balanced.value = ''
    latexHtml.value = ''
    detailRows.value = []
    error.value = ''
  }
})

function clearAll() {
  input.value = ''
  balanced.value = ''
  latexHtml.value = ''
  detailRows.value = []
  error.value = ''
}

function copyResult() {
  if (!balanced.value) return
  navigator.clipboard.writeText(balanced.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

// 示例
const examples = [
  'C2H5OH + O2 = CO2 + H2O',
  'Fe + Cl2 = FeCl3',
  'Al + O2 = Al2O3',
  'NaOH + HCl = NaCl + H2O',
  'Al + H2SO4 = Al2(SO4)3 + H2',
]

function loadExample(example: string) {
  input.value = example
}
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="space-y-6">
      <!-- 输入区域 -->
      <div class="bg-card border rounded-2xl p-4 md:p-6 space-y-4">
        <div class="flex items-center gap-2">
          <FlaskConical class="h-5 w-5 text-primary" />
          <h2 class="text-sm font-semibold">输入化学方程式</h2>
        </div>

        <div class="flex gap-2">
          <input
            v-model="input"
            type="text"
            placeholder="例如：C2H5OH + O2 = CO2 + H2O"
            class="flex-1 h-10 px-4 text-sm font-mono bg-muted/30 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            @keydown.enter="doBalance"
          />
          <button
            class="inline-flex items-center gap-1.5 px-3 h-10 text-sm font-medium rounded-xl bg-muted/50 border hover:bg-muted transition-colors"
            @click="clearAll"
          >
            <Eraser class="h-4 w-4" />
          </button>
        </div>

        <!-- 示例 -->
        <div>
          <p class="text-xs text-muted-foreground mb-2">试试这些例子：</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="ex in examples"
              :key="ex"
              class="px-2.5 py-1 text-xs rounded-lg border bg-muted/20 hover:bg-muted/50 hover:border-primary/30 transition-all font-mono"
              @click="loadExample(ex)"
            >
              {{ ex }}
            </button>
          </div>
        </div>
      </div>

      <!-- 错误提示 -->
      <div
        v-if="error"
        class="flex items-start gap-2 bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3"
      >
        <FlaskConical class="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
        <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
      </div>

      <!-- 结果区域 -->
      <div v-if="latexHtml" class="bg-card border rounded-2xl p-4 md:p-6 space-y-4">
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-sm font-semibold flex items-center gap-2">
            <Equal class="h-4 w-4 text-green-500" />
            配平结果
          </h3>
          <button
            class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted/50 transition-colors"
            @click="copyResult"
          >
            <Check v-if="copied" class="h-3.5 w-3.5 text-green-500" />
            <Copy v-else class="h-3.5 w-3.5" />
            {{ copied ? '已复制' : '复制' }}
          </button>
        </div>

        <!-- LaTeX 渲染 -->
        <div
          class="flex justify-center py-6 bg-muted/10 rounded-xl overflow-x-auto max-w-full"
          style="scrollbar-width: none"
          v-html="latexHtml"
        />

        <!-- 元素原子数详情 -->
        <div v-if="detailRows.length > 0" class="border-t pt-4">
          <h4 class="text-xs font-semibold text-muted-foreground mb-3">
            各元素原子数核对（左 = 反应物，右 = 生成物）
          </h4>
          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead>
                <tr class="border-b bg-muted/20">
                  <th class="px-2 py-1.5 text-left font-medium">元素</th>
                  <th class="px-2 py-1.5 text-right font-medium">配平前左</th>
                  <th class="px-2 py-1.5 text-right font-medium">配平前右</th>
                  <th class="px-2 py-1.5 text-right font-medium">配平后左</th>
                  <th class="px-2 py-1.5 text-right font-medium">配平后右</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in detailRows"
                  :key="row.element"
                  class="border-b border-border/30"
                  :class="
                    row.leftBefore === row.rightBefore
                      ? 'text-muted-foreground/50'
                      : 'text-amber-600 dark:text-amber-400'
                  "
                >
                  <td class="px-2 py-1 font-mono font-medium">{{ row.element }}</td>
                  <td class="px-2 py-1 text-right font-mono">{{ row.leftBefore }}</td>
                  <td class="px-2 py-1 text-right font-mono">{{ row.rightBefore }}</td>
                  <td
                    class="px-2 py-1 text-right font-mono font-bold text-green-600 dark:text-green-400"
                  >
                    {{ row.leftAfter }}
                  </td>
                  <td
                    class="px-2 py-1 text-right font-mono font-bold text-green-600 dark:text-green-400"
                  >
                    {{ row.rightAfter }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-[10px] text-muted-foreground mt-2">
            配平前黄色行表示左右原子数不等；配平后绿色列表示两侧相等，方程式已配平。
          </p>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>

<style>
/* LaTeX 长公式适配 */
.katex-display {
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.katex-display::-webkit-scrollbar {
  display: none;
}

@media (max-width: 640px) {
  .katex {
    font-size: 0.9em;
  }
}
</style>
