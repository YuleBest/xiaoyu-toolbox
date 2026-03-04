<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowRightLeft, ChevronDown, Search, Ruler } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import { allTools } from '@/config/tools'

const { t } = useI18n()
const tool = allTools.find((t) => t.id === 'length')!

// Data
// Conversion rates relative to 1 meter (m)
const conversionRates: Record<string, number> = {
  // Metric (公制)
  m: 1,
  dm: 0.1,
  cm: 0.01,
  mm: 0.001,
  μm: 1e-6,
  pm: 1e-12,
  nm: 1e-9,
  km: 1000,
  ly: 9.4607e15,
  pc: 3.085677581e16,
  AU: 149597870700,
  ld: 3.844e8,
  // Imperial (英制)
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
  nmi: 1852,
  fm: 1.8288,
  fur: 201.168,
  // Traditional (市制)
  li: 500,
  zhang: 10 / 3, // 3.33333333
  chi: 1 / 3, // 0.33333333
  fen: 1 / 30, // 0.03333333
  hao: 1 / 3000, // 0.00033333
}

const unitTypes = {
  metric: ['dm', 'ly', 'mm', 'km', 'cm', 'm', 'μm', 'pc', 'AU', 'ld', 'pm', 'nm'],
  imperial: ['fur', 'fm', 'yd', 'nmi', 'ft', 'mi', 'in'],
  traditional: ['zhang', 'fen', 'hao', 'chi', 'li'],
}

// Flatten unit list for searching and iteration
const unitList = Object.keys(conversionRates)

const getUnitName = (code: string) => {
  for (const [type, units] of Object.entries(unitTypes)) {
    if (units.includes(code)) {
      return t(`length.units.${type}.${code}`)
    }
  }
  return code
}

const getUnitTypeLabel = (code: string) => {
  if (unitTypes.metric.includes(code)) return t('length.types.metric')
  if (unitTypes.imperial.includes(code)) return t('length.types.imperial')
  if (unitTypes.traditional.includes(code)) return t('length.types.traditional')
  return ''
}

const baseUnit = ref('m')
const targetUnit = ref('cm')
const amount = ref<number | string>(1)
const searchQuery = ref('')

const baseDropdownOpen = ref(false)
const targetDropdownOpen = ref(false)
const baseUnitSearch = ref('')
const targetUnitSearch = ref('')

const filteredBaseUnits = computed(() => {
  if (!baseUnitSearch.value) return unitTypes
  const q = baseUnitSearch.value.toLowerCase()
  const filterGroup = (group: string[]) =>
    group.filter((code) => code.toLowerCase().includes(q) || getUnitName(code).includes(q))

  return {
    metric: filterGroup(unitTypes.metric),
    imperial: filterGroup(unitTypes.imperial),
    traditional: filterGroup(unitTypes.traditional),
  }
})

const filteredTargetUnits = computed(() => {
  if (!targetUnitSearch.value) return unitTypes
  const q = targetUnitSearch.value.toLowerCase()
  const filterGroup = (group: string[]) =>
    group.filter((code) => code.toLowerCase().includes(q) || getUnitName(code).includes(q))

  return {
    metric: filterGroup(unitTypes.metric),
    imperial: filterGroup(unitTypes.imperial),
    traditional: filterGroup(unitTypes.traditional),
  }
})

const filteredAllUnits = computed(() => {
  if (!searchQuery.value) return unitList
  const query = searchQuery.value.toLowerCase()
  return unitList.filter(
    (code) => code.toLowerCase().includes(query) || getUnitName(code).includes(query),
  )
})

// 格式化设置
const useScientificNotation = ref(true)

// 计算换算结果
const formatResult = (result: number) => {
  if (result === 0) return '0'

  // 修正常见的浮点数精度问题，如 1/1e-9 变成 999999999.9999999
  const num = parseFloat(result.toPrecision(12))

  // 为了显示效果更好，太小或太大的数使用科学计数法
  if (Math.abs(num) < 1e-6 || Math.abs(num) >= 1e9) {
    if (useScientificNotation.value) {
      const expStr = num.toExponential(4) // e.g., "1.0000e+9"
      const [base = '0', exp = '0'] = expStr.split('e')

      // Trim redundant zeros in the base
      const cleanBase = parseFloat(base).toString()
      // Remove the "+" from positive exponents for cleanliness (e.g., "+9" -> "9")
      const cleanExp = exp.startsWith('+') ? exp.slice(1) : exp

      return `${cleanBase} × 10^${cleanExp}`
    }
    return num.toExponential(4)
  }

  // 配合 toFixed(8) 进一步抹平较小的小数位精度溢出
  return parseFloat(num.toFixed(8)).toString()
}

const convertedValue = computed(() => {
  const numAmount = Number(amount.value)
  if (isNaN(numAmount)) return '0'

  const baseRate = conversionRates[baseUnit.value] || 1
  const targetRate = conversionRates[targetUnit.value] || 1

  // 将基准单位转成米，再除以目标单位相对于米的换算率
  const valueInMeters = numAmount * baseRate
  const result = valueInMeters / targetRate

  return formatResult(result)
})

const getRateForUnit = (code: string) => {
  const numAmount = 1 // display baseline as 1
  const baseRate = conversionRates[baseUnit.value] || 1
  const targetRate = conversionRates[code] || 1
  const valueInMeters = numAmount * baseRate
  const result = valueInMeters / targetRate

  return formatResult(result)
}

const swapUnits = () => {
  const temp = baseUnit.value
  baseUnit.value = targetUnit.value
  targetUnit.value = temp
}

// Ensure targetUnit exists and isn't same as baseUnit optionally
watch(baseUnit, (newBase) => {
  if (targetUnit.value === newBase) {
    targetUnit.value = newBase === 'm' ? 'cm' : 'm'
  }
})
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <!-- Main Converter Card -->
      <div class="bg-card/30 border border-muted/80 rounded-3xl p-4 md:p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-end">
          <!-- From -->
          <div class="space-y-2">
            <label
              class="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1"
            >
              {{ t('length.baseUnit') }}
            </label>
            <div class="flex gap-2">
              <input
                v-model="amount"
                type="number"
                step="any"
                class="flex-1 min-w-0 bg-background border border-muted rounded-2xl px-4 py-3 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-mono"
              />
              <DropdownMenu v-model:open="baseDropdownOpen">
                <DropdownMenuTrigger as-child>
                  <button
                    class="flex items-center gap-2 px-4 py-3 bg-background border border-muted rounded-2xl text-sm font-bold hover:bg-muted/30 transition-all cursor-pointer shrink-0"
                  >
                    {{ getUnitName(baseUnit) }}
                    <ChevronDown
                      class="h-4 w-4 text-muted-foreground transition-transform"
                      :class="{ 'rotate-180': baseDropdownOpen }"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  class="w-56 p-1.5 rounded-xl shadow-xl border-muted/50 backdrop-blur-lg max-h-80 overflow-y-auto"
                >
                  <div class="px-2 pb-2 pt-1 sticky top-0 bg-popover z-10">
                    <input
                      v-model="baseUnitSearch"
                      type="text"
                      :placeholder="t('length.searchUnit')"
                      class="w-full px-3 py-1.5 bg-muted/30 border border-muted/50 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                      @click.stop
                    />
                  </div>

                  <template v-for="(group, key) in filteredBaseUnits" :key="key">
                    <div v-if="group.length > 0">
                      <div
                        class="px-2 py-1.5 text-xs font-semibold text-muted-foreground/70 uppercase"
                      >
                        {{ t(`length.types.${key}`) }}
                      </div>
                      <DropdownMenuItem
                        v-for="code in group"
                        :key="code"
                        class="rounded-lg cursor-pointer flex items-center justify-between py-2 px-3 transition-colors"
                        :class="baseUnit === code ? 'bg-blue-500/10 text-blue-500 font-bold' : ''"
                        @click="((baseUnit = code), (baseUnitSearch = ''))"
                      >
                        <span class="font-medium text-sm truncate">{{ getUnitName(code) }}</span>
                        <span class="font-mono text-xs text-muted-foreground w-8 text-right">{{
                          code
                        }}</span>
                      </DropdownMenuItem>
                    </div>
                  </template>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <!-- To -->
          <div class="space-y-2">
            <label
              class="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1"
            >
              {{ t('length.targetUnit') }}
            </label>
            <div class="flex gap-2">
              <div
                class="flex-1 min-w-0 bg-muted/20 border border-muted/50 rounded-2xl px-4 py-3 text-xl font-bold text-important flex items-center min-h-[52px] font-mono overflow-auto whitespace-nowrap scrollbar-hide"
              >
                <span>{{ convertedValue }}</span>
              </div>
              <DropdownMenu v-model:open="targetDropdownOpen">
                <DropdownMenuTrigger as-child>
                  <button
                    class="flex items-center gap-2 px-4 py-3 bg-background border border-muted rounded-2xl text-sm font-bold hover:bg-muted/30 transition-all cursor-pointer shrink-0"
                  >
                    {{ getUnitName(targetUnit) }}
                    <ChevronDown
                      class="h-4 w-4 text-muted-foreground transition-transform"
                      :class="{ 'rotate-180': targetDropdownOpen }"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  class="w-56 p-1.5 rounded-xl shadow-xl border-muted/50 backdrop-blur-lg max-h-80 overflow-y-auto"
                >
                  <div class="px-2 pb-2 pt-1 sticky top-0 bg-popover z-10">
                    <input
                      v-model="targetUnitSearch"
                      type="text"
                      :placeholder="t('length.searchUnit')"
                      class="w-full px-3 py-1.5 bg-muted/30 border border-muted/50 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                      @click.stop
                    />
                  </div>

                  <template v-for="(group, key) in filteredTargetUnits" :key="key">
                    <div v-if="group.length > 0">
                      <div
                        class="px-2 py-1.5 text-xs font-semibold text-muted-foreground/70 uppercase"
                      >
                        {{ t(`length.types.${key}`) }}
                      </div>
                      <DropdownMenuItem
                        v-for="code in group"
                        :key="code"
                        :disabled="code === baseUnit"
                        class="rounded-lg cursor-pointer flex items-center justify-between py-2 px-3 transition-colors"
                        :class="targetUnit === code ? 'bg-blue-500/10 text-blue-500 font-bold' : ''"
                        @click="((targetUnit = code), (targetUnitSearch = ''))"
                      >
                        <span class="font-medium text-sm truncate">{{ getUnitName(code) }}</span>
                        <span class="font-mono text-xs text-muted-foreground w-8 text-right">{{
                          code
                        }}</span>
                      </DropdownMenuItem>
                    </div>
                  </template>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <!-- Actions Bar -->
        <div class="mt-4 flex flex-wrap items-center gap-3 pt-4 border-t border-muted/30">
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-secondary text-foreground hover:bg-secondary/80 rounded-xl transition-all active:scale-95"
            @click="swapUnits"
          >
            <ArrowRightLeft class="h-4 w-4" />
            {{ t('length.swap') }}
          </button>

          <button
            class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-xl transition-all active:scale-95"
            :class="
              useScientificNotation
                ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            "
            @click="useScientificNotation = !useScientificNotation"
          >
            <!-- 10^x text icon representation -->
            <span
              class="font-mono font-bold leading-none tracking-tighter"
              style="font-size: 0.9em"
            >
              10^x
            </span>
            {{ t('length.scientific') }}
          </button>
        </div>
      </div>

      <!-- Result Grid -->
      <div class="space-y-4">
        <div class="flex items-center justify-between px-1">
          <h3 class="text-lg font-semibold flex items-center gap-2 text-foreground/80">
            <Ruler class="w-5 h-5 text-blue-500" />
            {{ t('length.allRates') }}
          </h3>

          <div class="relative w-48 md:w-64">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
            />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('length.searchUnit')"
              class="w-full pl-9 pr-4 py-2 bg-background border border-muted rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-medium"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div
            v-for="code in filteredAllUnits"
            :key="code"
            class="bg-card border border-muted/60 rounded-xl p-4 hover:border-blue-500/30 hover:bg-muted/30 transition-all cursor-pointer group flex flex-col justify-between min-h-[100px]"
            @click="targetUnit = code"
          >
            <div class="flex items-center justify-between mb-2 text-xs">
              <span class="font-bold text-blue-500" :title="getUnitTypeLabel(code)">
                {{ code }}
              </span>
              <span
                class="text-[10px] text-muted-foreground uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                >Select</span
              >
            </div>

            <div class="flex-1 flex items-center mb-1">
              <div class="text-lg font-mono font-bold text-important leading-none break-all">
                {{ getRateForUnit(code) }}
              </div>
            </div>
            <div class="text-[10px] text-muted-foreground truncate" :title="getUnitName(code)">
              {{ getUnitName(code) }}
            </div>
          </div>
        </div>

        <div
          v-if="filteredAllUnits.length === 0"
          class="bg-card/30 border border-muted/80 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-3"
        >
          <div class="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-2">
            <Search class="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
          <p class="text-lg font-medium text-foreground">
            {{ t('search.emptyTitle') }}
          </p>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>

<style scoped>
/* Standard number input spin buttons removal */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
