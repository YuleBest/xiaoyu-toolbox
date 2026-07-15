<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { Send, Swords, User, Sparkles } from 'lucide-vue-next'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import { allTools } from '@/config/tools'

const tool = allTools.find((r) => r.id === 'ai-nitpicker')!

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<Message[]>([])
const inputText = ref('')
const loading = ref(false)
const msgId = ref(0)
const chatContainer = ref<HTMLElement | null>(null)

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || loading.value) return

  // 添加用户消息
  const userMsg: Message = { id: ++msgId.value, role: 'user', content: text }
  messages.value.push(userMsg)
  inputText.value = ''
  scrollToBottom()

  loading.value = true

  try {
    // 构建消息历史（只发送 user/assistant 消息）
    const history = messages.value
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }))

    const res = await fetch('/api/nitpicker/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    })

    const data = await res.json()

    const aiMsg: Message = {
      id: ++msgId.value,
      role: 'assistant',
      content: data.error || data.content || '……',
    }
    messages.value.push(aiMsg)
  } catch {
    messages.value.push({
      id: ++msgId.value,
      role: 'assistant',
      content: '网络错误，杠精断网了',
    })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

onMounted(() => {
  // 初始欢迎消息
  messages.value.push({
    id: ++msgId.value,
    role: 'assistant',
    content: '来吧，说点什么。不过我提前告诉你——你说的每句话我都能找到槽点 😏',
  })
})
</script>

<template>
  <ToolContainer :tool="tool">
    <!-- 消息列表 -->
    <div ref="chatContainer" class="space-y-4 px-1 py-4 pb-24">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex gap-3"
        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <!-- AI 头像 -->
        <div
          v-if="msg.role === 'assistant'"
          class="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0"
        >
          <Swords class="h-4 w-4 text-rose-500" />
        </div>

        <!-- 消息气泡 -->
        <div
          class="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
          :class="
            msg.role === 'user'
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted/50 border rounded-bl-md'
          "
        >
          {{ msg.content }}
        </div>

        <!-- 用户头像 -->
        <div
          v-if="msg.role === 'user'"
          class="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0"
        >
          <User class="h-4 w-4 text-blue-500" />
        </div>
      </div>

      <!-- 加载指示器 -->
      <div v-if="loading" class="flex gap-3 justify-start">
        <div
          class="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0"
        >
          <Swords class="h-4 w-4 text-rose-500" />
        </div>
        <div class="bg-muted/50 border rounded-2xl rounded-bl-md px-4 py-2.5">
          <span class="flex gap-1">
            <span
              class="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce"
              style="animation-delay: 0ms"
            />
            <span
              class="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce"
              style="animation-delay: 150ms"
            />
            <span
              class="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce"
              style="animation-delay: 300ms"
            />
          </span>
        </div>
      </div>
    </div>

    <!-- 输入区域（浮在底部，固定不动） -->
    <div
      class="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm pt-3 pb-4 px-4 md:left-64"
    >
      <div class="flex gap-2 max-w-2xl mx-auto">
        <input
          v-model="inputText"
          type="text"
          placeholder="说点什么让杠精来杠..."
          class="flex-1 h-10 px-4 text-sm bg-muted/30 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all"
          :disabled="loading"
          @keydown="handleKeydown"
        />
        <button
          class="inline-flex items-center gap-1.5 px-4 h-10 text-sm font-medium rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors disabled:opacity-50"
          :disabled="loading || !inputText.trim()"
          @click="sendMessage"
        >
          <Sparkles v-if="loading" class="h-4 w-4 animate-spin" />
          <Send v-else class="h-4 w-4" />
        </button>
      </div>
      <p class="text-[10px] text-muted-foreground mt-2 text-center">
        AI 会从刁钻角度抬杠 · 内容仅供娱乐
      </p>
    </div>
  </ToolContainer>
</template>
