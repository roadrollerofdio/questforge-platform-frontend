<template>
  <div class="flex flex-col h-[calc(100vh-180px)]">
    <div class="flex items-center gap-3 mb-4">
      <div class="text-4xl">🤖</div>
      <div>
        <h1 class="text-2xl font-extrabold text-gray-700">AI 教师</h1>
        <p class="text-sm font-bold text-gray-400">和 AI 老师对话, 边聊边学</p>
      </div>
    </div>

    <!-- 对话区 -->
    <div ref="chatBox" class="flex-1 overflow-y-auto bg-white rounded-3xl border-2 border-[#E5E5E5] p-4 space-y-4 mb-4">
      <!-- 欢迎语 -->
      <div v-if="messages.length === 0" class="text-center py-10">
        <div class="text-6xl mb-4 animate-bounce-slow">🦉</div>
        <p class="text-gray-600 font-extrabold mb-1">你好呀! 我是你的专属 AI 教师</p>
        <p class="text-sm text-gray-400 font-bold mb-5">告诉我你想学什么, 我来引导你一步步掌握~</p>
        <div class="flex flex-wrap justify-center gap-2">
          <button v-for="s in suggestions" :key="s" @click="send(s)"
                  class="px-4 py-2 rounded-2xl border-2 border-b-4 border-[#E5E5E5] bg-white text-sm font-extrabold text-[#CE82FF] hover:bg-[#F3E5FF] active:border-b-2 active:translate-y-0.5 transition-all">
            {{ s }}
          </button>
        </div>
      </div>

      <div v-for="(msg, idx) in messages" :key="idx"
           class="flex gap-3" :class="msg.role === 'user' ? 'flex-row-reverse' : ''">
        <div class="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-xl"
             :class="msg.role === 'user' ? 'bg-[#E7F8D9]' : 'bg-[#F3E5FF]'">
          <template v-if="msg.role === 'user'">
            <AvatarRender :config="profile.avatarConfig" :size="40"/>
          </template>
          <template v-else>🤖</template>
        </div>
        <div class="max-w-[75%] rounded-2xl px-4 py-3 font-medium leading-relaxed whitespace-pre-wrap"
             :class="msg.role === 'user' ? 'bg-[#58CC02] text-white' : 'bg-[#F7F9F4] text-gray-700'">
          {{ msg.content || '...' }}
        </div>
      </div>

      <div v-if="streaming" class="flex gap-1 pl-14">
        <span class="w-2 h-2 bg-[#CE82FF] rounded-full animate-bounce"></span>
        <span class="w-2 h-2 bg-[#CE82FF] rounded-full animate-bounce" style="animation-delay: 0.15s"></span>
        <span class="w-2 h-2 bg-[#CE82FF] rounded-full animate-bounce" style="animation-delay: 0.3s"></span>
      </div>
    </div>

    <!-- 输入框 -->
    <div class="flex gap-3">
      <input v-model="input" @keydown.enter="send()"
             :disabled="streaming"
             placeholder="向 AI 老师提问..."
             class="flex-1 px-5 py-3.5 rounded-2xl border-2 border-[#E5E5E5] bg-white font-bold text-gray-700 focus:outline-none focus:border-[#CE82FF] transition-colors disabled:opacity-60"/>
      <button @click="send()" :disabled="streaming || !input.trim()"
              class="px-6 py-3.5 rounded-2xl font-extrabold text-white bg-[#CE82FF] shadow-[0_4px_0_#A767CC] hover:brightness-105 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:shadow-[0_4px_0_#A767CC] transition-all">
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { streamSse } from '@/utils/sse'
import { useProfileStore } from '@/store/profile'
import AvatarRender from '@/components/AvatarRender.vue'

const profile = useProfileStore()

const messages = ref<{ role: 'user' | 'assistant'; content: string }[]>([])
const input = ref('')
const streaming = ref(false)
const chatBox = ref<HTMLElement>()

const suggestions = [
  '带我复习一下今天的知识点',
  '出一道题考考我',
  '用类比给我讲个难懂的概念'
]

const scrollToBottom = async () => {
  await nextTick()
  if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight
}

const send = (preset?: string) => {
  const text = (preset ?? input.value).trim()
  if (!text || streaming.value) return

  messages.value.push({ role: 'user', content: text })
  input.value = ''
  streaming.value = true
  scrollToBottom()

  // 携带历史上下文
  const history = messages.value.map(m => ({ role: m.role, content: m.content }))
  const aiMsg = { role: 'assistant' as const, content: '' }
  messages.value.push(aiMsg)

  streamSse('/api/v1/ai-engine/tutor/free-chat', {
    method: 'POST',
    body: { history: JSON.stringify(history) },
    onMessage: (chunk) => {
      aiMsg.content += chunk
      messages.value = [...messages.value]
      scrollToBottom()
    },
    onDone: () => { streaming.value = false },
    onError: () => {
      streaming.value = false
      if (!aiMsg.content) aiMsg.content = 'AI 老师暂时离开了, 请检查网络或稍后再试~'
    }
  })
}
</script>

<style scoped>
@keyframes bounceSlow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-bounce-slow { animation: bounceSlow 2s ease-in-out infinite; }
</style>
