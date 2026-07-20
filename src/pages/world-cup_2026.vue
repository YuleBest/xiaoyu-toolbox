<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch, onUnmounted } from 'vue'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import { allTools } from '@/config/tools'

const tool = allTools.find((r) => r.id === 'world-cup_2026')!

interface GroupMatch {
  time: string
  [teamCode: string]: number | string
}
interface KnockoutMatch {
  time: string
  [teamCode: string]: number[] | string
}
interface GroupData {
  winners: string[]
  [groupName: string]: GroupMatch[] | string[]
}
interface KnockoutData {
  [round: string]: KnockoutMatch[]
}
type CodeMap = Record<string, string>

const groupData = ref<GroupData | null>(null)
const knockoutData = ref<KnockoutData | null>(null)
const codeMap = ref<CodeMap>({})
const loading = ref(true)
const activeTab = ref<'group' | 'knockout' | 'bracket'>('group')

const ROUND_NAMES: Record<string, string> = {
  TOP32: '32 强',
  TOP16: '16 强',
  TOP8: '1/4 决赛',
  TOP4: '半决赛',
  THIRD: '三四名决赛',
  FINAL: '决赛',
}

const ROUND_ORDER = ['TOP32', 'TOP16', 'TOP8', 'TOP4', 'FINAL']

const GROUP_NAMES = 'ABCDEFGHIJKLMNOP'.split('')

onMounted(async () => {
  try {
    const [gRes, kRes, cRes] = await Promise.all([
      fetch('/database/world-cup_2026/group.json'),
      fetch('/database/world-cup_2026/knockout.json'),
      fetch('/database/world-cup_2026/_code.json'),
    ])
    groupData.value = await gRes.json()
    knockoutData.value = await kRes.json()
    codeMap.value = await cRes.json()
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
})

function toBeijingTime(utc: string): string {
  const d = new Date(utc)
  d.setHours(d.getHours() + 8)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${m}/${day} ${h}:${min}`
}

function teamName(code: string): string {
  return codeMap.value[code] || code
}

function flagUrl(code: string): string {
  return `https://api.fifa.com/api/v3/picture/flags-sq-1/${code}`
}

function getTeamCodes(match: Record<string, unknown>): string[] {
  return Object.keys(match).filter((k) => k !== 'time' && k !== 'winner')
}

function formatScore(match: KnockoutMatch, code: string): string {
  const score = match[code]
  if (!Array.isArray(score)) return ''
  if (score.length === 2) return `${score[0]} (点球 ${score[1]})`
  return String(score[0])
}

function isKnockoutWinner(match: KnockoutMatch, code: string): boolean {
  const codes = getTeamCodes(match as unknown as Record<string, unknown>)
  const opponent = codes.find((c) => c !== code) || ''
  const myArr = match[code]
  const opArr = match[opponent]
  if (!Array.isArray(myArr) || !Array.isArray(opArr)) return false
  const m0 = myArr[0] ?? 0
  const o0 = opArr[0] ?? 0
  if (m0 > o0) return true
  if (m0 === o0 && myArr.length === 2 && opArr.length === 2) {
    return (myArr[1] ?? 0) > (opArr[1] ?? 0)
  }
  return false
}

function groupScore(match: GroupMatch, code: string): number {
  const val = match[code]
  return typeof val === 'number' ? val : 0
}

function isGroupWinner(match: GroupMatch, code: string): boolean {
  const codes = getTeamCodes(match as unknown as Record<string, unknown>)
  const opponent = codes.find((c) => c !== code) || ''
  return groupScore(match, code) > groupScore(match, opponent)
}

const knockoutRounds = computed(() => {
  if (!knockoutData.value) return []
  return Object.entries(knockoutData.value).filter(([, matches]) => matches.length > 0)
})

const groups = computed(() => {
  if (!groupData.value) return []
  return GROUP_NAMES.filter((g) => groupData.value![g])
})

function groupWinners(group: string): string[] {
  if (!groupData.value) return []
  const start = GROUP_NAMES.indexOf(group) * 2
  return groupData.value.winners.slice(start, start + 2)
}

// ========== 晋级图 ==========
interface BracketTeam {
  code: string
  score: string
  winner: boolean
}

interface BracketMatch {
  teams: BracketTeam[]
  winnerCode: string | null
}

interface BracketRoundData {
  name: string
  matches: BracketMatch[]
}

const bracketRounds = computed<BracketRoundData[]>(() => {
  if (!knockoutData.value) return []
  const kd = knockoutData.value
  const rounds: BracketRoundData[] = []

  for (const roundKey of ROUND_ORDER) {
    const matches = kd[roundKey]
    if (!matches || matches.length === 0) continue
    const bracketMatches: BracketMatch[] = []
    for (const match of matches) {
      const codes = getTeamCodes(match as unknown as Record<string, unknown>)
      const teams: BracketTeam[] = []
      let winnerCode: string | null = null
      for (const code of codes) {
        const w = isKnockoutWinner(match, code)
        if (w) winnerCode = code
        teams.push({ code, score: formatScore(match, code), winner: w })
      }
      bracketMatches.push({ teams, winnerCode })
    }
    rounds.push({ name: ROUND_NAMES[roundKey] || roundKey, matches: bracketMatches })
  }

  // 三四名决赛
  if (kd.THIRD?.length) {
    const bracketMatches: BracketMatch[] = []
    for (const m of kd.THIRD) {
      const codes = getTeamCodes(m as unknown as Record<string, unknown>)
      const teams: BracketTeam[] = []
      let wc: string | null = null
      for (const code of codes) {
        const w = isKnockoutWinner(m, code)
        if (w) wc = code
        teams.push({ code, score: formatScore(m, code), winner: w })
      }
      bracketMatches.push({ teams, winnerCode: wc })
    }
    rounds.push({ name: '三四名', matches: bracketMatches })
  }

  // 重排序：从后往前，使相邻轮次的对阵相邻
  for (let ri = rounds.length - 1; ri > 0; ri--) {
    const nextMatches = rounds[ri]!.matches
    const currentMatches = rounds[ri - 1]!.matches
    const ordered: BracketMatch[] = []

    for (const nextMatch of nextMatches) {
      // 找出下一轮双方队伍各自来自本轮哪场比赛
      const relatedIndices: number[] = []
      for (const team of nextMatch.teams) {
        const idx = currentMatches.findIndex((m) => m.winnerCode === team.code)
        if (idx >= 0 && !relatedIndices.includes(idx)) {
          relatedIndices.push(idx)
        }
      }
      // 将相关的本轮比赛按序加入
      for (const idx of relatedIndices.sort((a, b) => a - b)) {
        if (!ordered.some((m) => m === currentMatches[idx])) {
          ordered.push(currentMatches[idx]!)
        }
      }
    }
    // 补上未被引用的比赛
    for (const m of currentMatches) {
      if (!ordered.includes(m)) ordered.push(m)
    }

    rounds[ri - 1]!.matches = ordered
  }

  return rounds
})

// ========== 连线计算 ==========
interface Connector {
  fromRound: number
  fromMatch: number
  toRound: number
  toMatch: number
  code: string
}

const bracketConnectors = computed<Connector[]>(() => {
  const connectors: Connector[] = []
  for (let ri = 0; ri < bracketRounds.value.length - 1; ri++) {
    const round = bracketRounds.value[ri]!
    const nextRound = bracketRounds.value[ri + 1]!
    for (let mi = 0; mi < round.matches.length; mi++) {
      const match = round.matches[mi]!
      if (!match.winnerCode) continue
      // Find winner in next round
      for (let nmi = 0; nmi < nextRound.matches.length; nmi++) {
        const nm = nextRound.matches[nmi]!
        const found = nm.teams.some((t) => t.code === match.winnerCode)
        if (found) {
          connectors.push({
            fromRound: ri,
            fromMatch: mi,
            toRound: ri + 1,
            toMatch: nmi,
            code: match.winnerCode,
          })
          break
        }
      }
    }
  }
  return connectors
})

// SVG 连线坐标
const bracketEl = ref<HTMLElement | null>(null)
const lineCoords = ref<{ x1: number; y1: number; x2: number; y2: number }[]>([])

function updateLineCoords() {
  if (!bracketEl.value) return
  const container = bracketEl.value
  const coords: { x1: number; y1: number; x2: number; y2: number }[] = []
  const containerRect = container.getBoundingClientRect()

  for (const conn of bracketConnectors.value) {
    const fromRoundEl = container.querySelector(`[data-round="${conn.fromRound}"]`)
    const toRoundEl = container.querySelector(`[data-round="${conn.toRound}"]`)
    if (!fromRoundEl || !toRoundEl) continue

    const fromMatches = fromRoundEl.querySelectorAll('[data-match]')
    const toMatches = toRoundEl.querySelectorAll('[data-match]')
    const fromCard = fromMatches[conn.fromMatch] as HTMLElement | undefined
    const toCard = toMatches[conn.toMatch] as HTMLElement | undefined
    if (!fromCard || !toCard) continue

    const fromRect = fromCard.getBoundingClientRect()
    const toRect = toCard.getBoundingClientRect()

    coords.push({
      x1: fromRect.right - containerRect.left,
      y1: fromRect.top + fromRect.height / 2 - containerRect.top,
      x2: toRect.left - containerRect.left,
      y2: toRect.top + toRect.height / 2 - containerRect.top,
    })
  }
  lineCoords.value = coords
}

watch([bracketConnectors, activeTab], () => {
  if (activeTab.value === 'bracket') {
    nextTick(() => updateLineCoords())
  }
})

onMounted(() => {
  window.addEventListener('resize', updateLineCoords)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateLineCoords)
})
</script>

<template>
  <ToolContainer :tool="tool">
    <div v-if="loading" class="flex items-center justify-center h-48">
      <div class="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>

    <div v-else class="space-y-6">
      <!-- 标签页 -->
      <div class="flex p-1 bg-muted/30 rounded-xl">
        <button
          class="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          :class="
            activeTab === 'group'
              ? 'bg-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="activeTab = 'group'"
        >
          📊 小组赛
        </button>
        <button
          class="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          :class="
            activeTab === 'knockout'
              ? 'bg-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="activeTab = 'knockout'"
        >
          🏆 淘汰赛
        </button>
        <button
          class="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          :class="
            activeTab === 'bracket'
              ? 'bg-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="activeTab = 'bracket'"
        >
          🌳 晋级图
        </button>
      </div>

      <!-- ========== 小组赛 ========== -->
      <div v-if="activeTab === 'group'" class="space-y-4">
        <div
          v-for="group in groups"
          :key="group"
          class="bg-card border rounded-2xl overflow-hidden"
        >
          <div class="px-4 py-3 bg-muted/20 border-b flex items-center justify-between">
            <h3 class="text-sm font-bold">{{ group }} 组</h3>
            <div class="flex items-center gap-2 text-xs text-muted-foreground">
              <span
                v-for="(winner, i) in groupWinners(group)"
                :key="winner"
                class="flex items-center gap-1"
              >
                <img :src="flagUrl(winner)" class="w-4 h-3 object-cover rounded-sm" :alt="winner" />
                {{ teamName(winner) }}
                <span v-if="i === 0" class="text-muted-foreground/50">|</span>
              </span>
            </div>
          </div>
          <div class="divide-y divide-border/30">
            <div
              v-for="(match, mi) in groupData![group] as GroupMatch[]"
              :key="mi"
              class="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/10 transition-colors"
            >
              <span class="text-xs text-muted-foreground w-14 shrink-0">{{
                toBeijingTime(match.time)
              }}</span>
              <template
                v-for="(code, ci) in getTeamCodes(match as unknown as Record<string, unknown>)"
                :key="code"
              >
                <img
                  :src="flagUrl(code)"
                  class="w-5 h-3.5 object-cover rounded-sm shrink-0"
                  :alt="code"
                />
                <span class="w-16 shrink-0 text-xs">{{ teamName(code) }}</span>
                <span
                  class="font-mono font-bold tabular-nums w-6 text-center"
                  :class="isGroupWinner(match, code) ? 'text-green-600' : 'text-muted-foreground'"
                  >{{ groupScore(match, code) }}</span
                >
                <span v-if="ci === 0" class="text-muted-foreground/30 mx-1">-</span>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== 淘汰赛 ========== -->
      <div v-if="activeTab === 'knockout'" class="space-y-4">
        <div
          v-for="[round, matches] in knockoutRounds"
          :key="round"
          class="bg-card border rounded-2xl overflow-hidden"
        >
          <div class="px-4 py-3 bg-muted/20 border-b">
            <h3 class="text-sm font-bold">{{ ROUND_NAMES[round] || round }}</h3>
          </div>
          <div class="divide-y divide-border/30">
            <div
              v-for="(match, mi) in matches"
              :key="mi"
              class="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/10 transition-colors"
            >
              <span class="text-xs text-muted-foreground w-14 shrink-0">{{
                toBeijingTime(match.time)
              }}</span>
              <template
                v-for="(code, ci) in getTeamCodes(match as unknown as Record<string, unknown>)"
                :key="code"
              >
                <img
                  :src="flagUrl(code)"
                  class="w-5 h-3.5 object-cover rounded-sm shrink-0"
                  :alt="code"
                />
                <span class="w-16 shrink-0 text-xs">{{ teamName(code) }}</span>
                <span
                  class="font-mono font-bold tabular-nums text-center"
                  :class="
                    isKnockoutWinner(match, code) ? 'text-green-600' : 'text-muted-foreground'
                  "
                  >{{ formatScore(match, code) }}</span
                >
                <span v-if="ci === 0" class="text-muted-foreground/30 mx-1">-</span>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== 晋级图 ========== -->
      <div v-if="activeTab === 'bracket'" ref="bracketEl" class="overflow-x-auto pb-4 relative">
        <!-- SVG 连线层 -->
        <svg
          v-if="lineCoords.length > 0"
          class="absolute inset-0 pointer-events-none z-10"
          :width="bracketEl?.scrollWidth || 0"
          :height="bracketEl?.scrollHeight || 0"
        >
          <line
            v-for="(l, i) in lineCoords"
            :key="i"
            :x1="l.x1"
            :y1="l.y1"
            :x2="l.x2"
            :y2="l.y2"
            stroke="var(--border)"
            stroke-width="1.5"
            stroke-dasharray="3 2"
          />
        </svg>

        <div class="flex items-stretch gap-0 min-w-max relative z-0">
          <div
            v-for="(round, ri) in bracketRounds"
            :key="round.name"
            :data-round="ri"
            class="flex flex-col justify-around gap-4 px-3 min-w-[160px]"
          >
            <div class="text-[10px] text-muted-foreground font-medium text-center -mb-2">
              {{ round.name }}
            </div>
            <template v-for="(match, mi) in round.matches" :key="mi">
              <div :data-match="mi" class="border border-border/30 rounded-lg overflow-hidden">
                <div
                  v-for="(team, ti) in match.teams"
                  :key="team.code"
                  class="flex items-center gap-1.5 py-1.5 px-2 text-xs"
                  :class="[
                    team.winner ? 'bg-green-500/10' : '',
                    ti === 0 ? 'border-b border-border/20' : '',
                  ]"
                >
                  <img
                    :src="flagUrl(team.code)"
                    class="w-4 h-3 object-cover rounded-sm shrink-0"
                    :alt="team.code"
                  />
                  <span
                    class="font-medium truncate"
                    :class="team.winner ? 'text-green-700 dark:text-green-400' : ''"
                    >{{ teamName(team.code) }}</span
                  >
                  <span
                    class="font-mono tabular-nums ml-auto text-[11px]"
                    :class="team.winner ? 'font-bold text-green-600' : 'text-muted-foreground'"
                    >{{ team.score }}</span
                  >
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>
