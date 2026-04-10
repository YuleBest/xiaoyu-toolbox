<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Brain, ChevronLeft, RotateCcw, Share2 } from 'lucide-vue-next'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import { allTools } from '@/config/tools'

const { t } = useI18n()
const tool = allTools.find((t) => t.id === 'mbti')!

// =============== 类型数据 ===============
interface TypeInfo {
  name: string
  tagline: string
  desc: string
  color: string
  bg: string
}

const TYPE_INFO: Record<string, TypeInfo> = {
  INTJ: {
    name: '建筑师',
    tagline: '战略性的思考者',
    desc: '想象力丰富且充满意志力，在任何事情上都能凭借自己的创造力和强大的脑力制定并执行计划。',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/30',
  },
  INTP: {
    name: '逻辑学家',
    tagline: '创新的发明家',
    desc: '对知识充满渴望，尤其热爱抽象理论。善于发现万物中的规律，总是探寻新的思路和可能性。',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/30',
  },
  ENTJ: {
    name: '指挥官',
    tagline: '天生的领袖',
    desc: '大胆、富有想象力且意志坚定。总能找到或创造出解决一切障碍的方法，善于带领团队实现目标。',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/30',
  },
  ENTP: {
    name: '辩论家',
    tagline: '热爱挑战规则的智者',
    desc: '聪明好奇，无法抵抗任何智识上的挑战。喜欢从不同角度看问题，享受激烈又有深度的思辨。',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/30',
  },
  INFJ: {
    name: '提倡者',
    tagline: '稀有的理想主义者',
    desc: '安静而神秘，同时鼓舞人心且不知疲倦。对人类的本质有深刻洞察，始终坚持自己的原则。',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
  },
  INFP: {
    name: '调停者',
    tagline: '诗意的理想主义者',
    desc: '充满诗意，善良而利他。总是渴望站在好的一面，并为世界做出独特而有意义的贡献。',
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-500/10 border-teal-500/30',
  },
  ENFJ: {
    name: '主人公',
    tagline: '有魅力的引路人',
    desc: '富有魅力和鼓舞人心，充满同理心的领袖，能激励他人实现最佳状态，乐于看到周围人成长与进步。',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-500/10 border-green-500/30',
  },
  ENFP: {
    name: '竞选者',
    tagline: '热情洋溢的创意人',
    desc: '热情、有创造力的社交型人，总能从生活中找到机会与联系，享受探索各种人生可能性。',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/30',
  },
  ISTJ: {
    name: '物流师',
    tagline: '务实可靠的守护者',
    desc: '脚踏实地，有条理且可靠，对规则和传统充满尊重，默默地用实际行动维护各种关系和事业。',
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-500/10 border-slate-500/30',
  },
  ISFJ: {
    name: '守卫者',
    tagline: '奉献精神的保护者',
    desc: '非常体贴，对身边的人十分奉献，随时准备好保护自己关心的人，是团队里最可靠的后盾。',
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/30',
  },
  ESTJ: {
    name: '总裁',
    tagline: '秩序与规则的守护者',
    desc: '出色的管理者，擅长组织和管理人员及事务，以强烈的责任感维护社会结构和传统价值观。',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/30',
  },
  ESFJ: {
    name: '执政官',
    tagline: '关怀他人的社交达人',
    desc: '极具关怀心，善于与人相处，喜欢成为人群中和谐氛围的核心，尽心帮助周围的每一个人。',
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/30',
  },
  ISTP: {
    name: '鉴赏家',
    tagline: '勇敢的冒险实干家',
    desc: '大胆而务实，擅长各种工具与技艺，热爱亲手探索世界的运作方式，解决实际问题是他们的天赋。',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30',
  },
  ISFP: {
    name: '探险家',
    tagline: '灵活的艺术探索者',
    desc: '富有魅力，喜欢独辟蹊径、突破界限，以开放的心态拥抱各种体验，生活本身就是艺术作品。',
    color: 'text-lime-600 dark:text-lime-400',
    bg: 'bg-lime-500/10 border-lime-500/30',
  },
  ESTP: {
    name: '企业家',
    tagline: '充满活力的行动派',
    desc: '充满智慧与活力，喜欢生活在刀锋上，擅长将想法付诸实践，是把握当下机遇的高手。',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-500/10 border-red-500/30',
  },
  ESFP: {
    name: '表演者',
    tagline: '生活的热爱者',
    desc: '自发而充满活力，享受他人的陪伴和新鲜刺激，善于活跃气氛，把欢乐带给周围的每一个人。',
    color: 'text-fuchsia-600 dark:text-fuchsia-400',
    bg: 'bg-fuchsia-500/10 border-fuchsia-500/30',
  },
}

// =============== 状态 ===============
interface Question {
  id: number
  question: string
  optionA: string
  optionB: string
  pos: string
  neg: string
}

type Phase = 'intro' | 'quiz' | 'result'
type Answer = 'A' | 'B' | null

const phase = ref<Phase>('intro')
const questions = ref<Question[]>([])
const currentIndex = ref(0)
const answers = ref<Answer[]>([])
const loading = ref(true)

onMounted(async () => {
  const res = await fetch('/database/mbti/mbti-parsed.json')
  const data: Question[] = await res.json()
  // Fisher-Yates 洗牌，保持每次顺序不同
  for (let i = data.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[data[i], data[j]] = [data[j]!, data[i]!]
  }
  questions.value = data
  answers.value = Array.from<Answer>({ length: data.length }).fill(null)
  loading.value = false
})

const currentQuestion = computed(() => questions.value[currentIndex.value])
const progress = computed(() =>
  questions.value.length ? (currentIndex.value / questions.value.length) * 100 : 0,
)
const answeredCount = computed(() => answers.value.filter((a) => a !== null).length)

// =============== 作答逻辑 ===============
const selectAnswer = (choice: Answer) => {
  answers.value[currentIndex.value] = choice
  if (currentIndex.value < questions.value.length - 1) {
    // 自动前进到下一题（有小延迟感）
    setTimeout(() => {
      currentIndex.value++
    }, 180)
  } else {
    setTimeout(() => {
      phase.value = 'result'
    }, 300)
  }
}

const goBack = () => {
  if (currentIndex.value > 0) currentIndex.value--
}

// =============== 结果计算 ===============
const scores = computed(() => {
  const s: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
  questions.value.forEach((q, i) => {
    const ans = answers.value[i]
    if (ans === 'A' && s[q.pos] !== undefined) s[q.pos]!++
    else if (ans === 'B' && s[q.neg] !== undefined) s[q.neg]!++
  })
  return s
})

const mbtiType = computed(() => {
  const s = scores.value
  return (
    ((s['E'] ?? 0) >= (s['I'] ?? 0) ? 'E' : 'I') +
    ((s['S'] ?? 0) >= (s['N'] ?? 0) ? 'S' : 'N') +
    ((s['T'] ?? 0) >= (s['F'] ?? 0) ? 'T' : 'F') +
    ((s['J'] ?? 0) >= (s['P'] ?? 0) ? 'J' : 'P')
  )
})

const typeDetail = computed(() => TYPE_INFO[mbtiType.value] ?? TYPE_INFO['INTJ']!)

interface DimBar {
  leftKey: string
  rightKey: string
  leftLabel: string
  rightLabel: string
  leftPct: number
  rightPct: number
  winner: string
}

const dimBars = computed((): DimBar[] => {
  const s = scores.value
  const calc = (a: string, b: string): DimBar => {
    const av = s[a] ?? 0
    const bv = s[b] ?? 0
    const total = av + bv || 1
    const aLabel: Record<string, string> = {
      E: '外向',
      I: '内向',
      S: '实感',
      N: '直觉',
      T: '思维',
      F: '情感',
      J: '判断',
      P: '知觉',
    }
    return {
      leftKey: a,
      rightKey: b,
      leftLabel: aLabel[a] ?? a,
      rightLabel: aLabel[b] ?? b,
      leftPct: Math.round((av / total) * 100),
      rightPct: Math.round((bv / total) * 100),
      winner: av >= bv ? a : b,
    }
  }
  return [calc('E', 'I'), calc('S', 'N'), calc('T', 'F'), calc('J', 'P')]
})

const restart = () => {
  // 重新洗牌
  const data = [...questions.value]
  for (let i = data.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[data[i], data[j]] = [data[j]!, data[i]!]
  }
  questions.value = data
  answers.value = Array.from<Answer>({ length: data.length }).fill(null)
  currentIndex.value = 0
  phase.value = 'intro'
}

const copyResult = async () => {
  const type = mbtiType.value
  const info = typeDetail.value
  const text = `我的 MBTI 类型是 ${type}（${info.name}）—— ${info.tagline}`
  await navigator.clipboard.writeText(text)
}

// 维度颜色
const dimColorClass: Record<string, string> = {
  E: 'bg-blue-500',
  I: 'bg-blue-300',
  S: 'bg-amber-500',
  N: 'bg-amber-300',
  T: 'bg-violet-500',
  F: 'bg-violet-300',
  J: 'bg-emerald-500',
  P: 'bg-emerald-300',
}
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 pt-4">
      <!-- ===== 加载中 ===== -->
      <div v-if="loading" class="flex justify-center items-center py-24 text-muted-foreground">
        <div
          class="animate-spin w-8 h-8 border-2 border-current border-t-transparent rounded-full"
        />
      </div>

      <!-- ===== 介绍页 ===== -->
      <div v-else-if="phase === 'intro'" class="flex flex-col items-center gap-8 py-8 text-center">
        <div class="p-5 rounded-3xl bg-violet-500/10 border-2 border-violet-500/20">
          <Brain class="h-16 w-16 text-violet-500" />
        </div>

        <div class="space-y-3">
          <h1 class="text-3xl font-bold">{{ t('mbti.introTitle') }}</h1>
          <p class="text-muted-foreground text-lg">{{ t('mbti.introSubtitle') }}</p>
        </div>

        <div class="flex gap-6 text-sm text-muted-foreground">
          <div class="flex flex-col items-center gap-1">
            <span class="text-2xl font-bold text-foreground">100</span>
            <span>{{ t('mbti.statQuestions') }}</span>
          </div>
          <div class="w-px bg-border" />
          <div class="flex flex-col items-center gap-1">
            <span class="text-2xl font-bold text-foreground">~10</span>
            <span>{{ t('mbti.statMinutes') }}</span>
          </div>
          <div class="w-px bg-border" />
          <div class="flex flex-col items-center gap-1">
            <span class="text-2xl font-bold text-foreground">16</span>
            <span>{{ t('mbti.statTypes') }}</span>
          </div>
        </div>

        <p class="text-muted-foreground text-sm leading-relaxed max-w-md">
          {{ t('mbti.introDesc') }}
        </p>

        <button
          class="px-10 py-4 bg-violet-500 hover:bg-violet-600 text-white text-lg font-semibold rounded-2xl transition-all active:scale-95"
          @click="phase = 'quiz'"
        >
          {{ t('mbti.start') }}
        </button>
      </div>

      <!-- ===== 答题页 ===== -->
      <div v-else-if="phase === 'quiz'" class="space-y-6">
        <!-- 进度区 -->
        <div class="space-y-2">
          <div class="flex justify-between text-sm text-muted-foreground">
            <span>{{
              t('mbti.questionNum', { n: currentIndex + 1, total: questions.length })
            }}</span>
            <span>{{ answeredCount }} {{ t('mbti.answered') }}</span>
          </div>
          <div class="h-2 bg-muted/40 rounded-full overflow-hidden">
            <div
              class="h-full bg-violet-500 rounded-full transition-all duration-300"
              :style="{ width: progress + '%' }"
            />
          </div>
        </div>

        <!-- 题目卡片 -->
        <div
          v-if="currentQuestion"
          class="bg-card/40 border-2 border-muted/40 rounded-3xl p-8 space-y-6"
        >
          <!-- 题号 + 题目 -->
          <div class="space-y-4">
            <div
              class="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-semibold"
            >
              Q{{ currentIndex + 1 }}
            </div>
            <p class="text-xl font-medium leading-relaxed">
              {{ currentQuestion.question }}
            </p>
          </div>

          <!-- 选项 -->
          <div class="flex flex-col gap-3">
            <button
              class="group flex items-start gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all active:scale-[0.99]"
              :class="
                answers[currentIndex] === 'A'
                  ? 'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-300'
                  : 'border-muted/50 hover:border-violet-400/60 hover:bg-violet-500/5'
              "
              @click="selectAnswer('A')"
            >
              <span
                class="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2"
                :class="
                  answers[currentIndex] === 'A'
                    ? 'border-violet-500 bg-violet-500 text-white'
                    : 'border-muted-foreground/40 text-muted-foreground group-hover:border-violet-400'
                "
                >A</span
              >
              <span class="pt-0.5 leading-relaxed">{{ currentQuestion.optionA }}</span>
            </button>

            <button
              class="group flex items-start gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all active:scale-[0.99]"
              :class="
                answers[currentIndex] === 'B'
                  ? 'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-300'
                  : 'border-muted/50 hover:border-violet-400/60 hover:bg-violet-500/5'
              "
              @click="selectAnswer('B')"
            >
              <span
                class="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2"
                :class="
                  answers[currentIndex] === 'B'
                    ? 'border-violet-500 bg-violet-500 text-white'
                    : 'border-muted-foreground/40 text-muted-foreground group-hover:border-violet-400'
                "
                >B</span
              >
              <span class="pt-0.5 leading-relaxed">{{ currentQuestion.optionB }}</span>
            </button>
          </div>
        </div>

        <!-- 底部导航 -->
        <div class="flex justify-between items-center">
          <button
            :disabled="currentIndex === 0"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            @click="goBack"
          >
            <ChevronLeft class="h-4 w-4" />
            {{ t('mbti.prev') }}
          </button>

          <span class="text-xs text-muted-foreground">
            {{ t('mbti.hint') }}
          </span>
        </div>
      </div>

      <!-- ===== 结果页 ===== -->
      <div v-else-if="phase === 'result'" class="space-y-6">
        <!-- 类型 Hero -->
        <div class="rounded-3xl border-2 p-8 text-center space-y-4" :class="typeDetail.bg">
          <p class="text-sm font-medium text-muted-foreground">{{ t('mbti.resultYourType') }}</p>
          <div class="text-7xl font-black tracking-widest" :class="typeDetail.color">
            {{ mbtiType }}
          </div>
          <div>
            <div class="text-2xl font-bold">{{ typeDetail.name }}</div>
            <div class="text-muted-foreground mt-1">{{ typeDetail.tagline }}</div>
          </div>
          <p class="text-sm leading-relaxed max-w-md mx-auto text-muted-foreground">
            {{ typeDetail.desc }}
          </p>
        </div>

        <!-- 维度分析 -->
        <div class="bg-card/40 border-2 border-muted/40 rounded-3xl p-6 space-y-4">
          <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {{ t('mbti.dimensionTitle') }}
          </h3>
          <div class="space-y-4">
            <div v-for="dim in dimBars" :key="dim.leftKey" class="space-y-1.5">
              <div class="flex justify-between text-sm">
                <span
                  class="font-semibold"
                  :class="dim.winner === dim.leftKey ? 'text-foreground' : 'text-muted-foreground'"
                >
                  {{ dim.leftLabel }} <span class="font-mono ml-1 text-xs">{{ dim.leftKey }}</span>
                </span>
                <span
                  class="font-semibold"
                  :class="dim.winner === dim.rightKey ? 'text-foreground' : 'text-muted-foreground'"
                >
                  <span class="font-mono mr-1 text-xs">{{ dim.rightKey }}</span>
                  {{ dim.rightLabel }}
                </span>
              </div>
              <div class="flex h-3 rounded-full overflow-hidden gap-0.5">
                <div
                  class="rounded-l-full transition-all duration-700"
                  :class="dimColorClass[dim.leftKey]"
                  :style="{ width: dim.leftPct + '%' }"
                />
                <div
                  class="rounded-r-full transition-all duration-700"
                  :class="dimColorClass[dim.rightKey]"
                  :style="{ width: dim.rightPct + '%' }"
                />
              </div>
              <div class="flex justify-between text-xs text-muted-foreground font-mono">
                <span>{{ dim.leftPct }}%</span>
                <span>{{ dim.rightPct }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-3">
          <button
            class="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-2xl transition-all active:scale-95"
            @click="restart"
          >
            <RotateCcw class="h-4 w-4" />
            {{ t('mbti.restart') }}
          </button>
          <button
            class="flex items-center justify-center gap-2 px-5 py-4 bg-muted/40 hover:bg-muted/60 text-muted-foreground hover:text-foreground rounded-2xl font-medium transition-all active:scale-95"
            :title="t('mbti.copyResult')"
            @click="copyResult"
          >
            <Share2 class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>
