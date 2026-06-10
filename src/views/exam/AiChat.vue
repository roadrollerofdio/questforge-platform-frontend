<template>
  <div class="fixed right-0 top-0 h-full w-96 bg-[#0f172a]/95 backdrop-blur-2xl border-l border-blue-900/50 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-40"
       :class="isOpen ? 'translate-x-0' : 'translate-x-full'">

    <!-- 头部 -->
    <div class="header p-5 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-transparent">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
          <i class="fas fa-brain text-white text-sm"></i>
        </div>
        <div>
          <h3 class="font-bold text-gray-200 tracking-wide text-sm">Quest AI</h3>
          <p class="text-[10px] text-blue-400 font-mono">NEURAL TUTOR ONLINE</p>
        </div>
      </div>
      <button @click="$emit('close')" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- 对话区 -->
    <div class="flex-1 p-4 overflow-y-auto space-y-6 scrollbar-hide" ref="chatBody">
      <div class="flex items-start">
        <div class="w-6 h-6 mt-1 rounded-md border border-blue-500/50 flex items-center justify-center bg-blue-900/30 text-blue-400 flex-shrink-0">
          <i class="fas fa-robot text-xs"></i>
        </div>
        <div class="ml-3 p-3 rounded-2xl rounded-tl-none bg-white/5 border border-white/5 text-sm text-gray-300 leading-relaxed shadow-inner">
          <p>我是你的伴学导师。遇到难题了吗？你可以直接点击下方按钮让我分析当前题目，或者输入你的疑惑。</p>
        </div>
      </div>

      <div v-for="(msg, index) in chatHistory" :key="index" class="flex items-start" :class="msg.role === 'user' ? 'flex-row-reverse' : ''">
        <div class="w-6 h-6 mt-1 rounded-md flex items-center justify-center flex-shrink-0"
             :class="msg.role === 'user' ? 'border border-green-500/50 bg-green-900/30 text-green-400 ml-3' : 'border border-blue-500/50 bg-blue-900/30 text-blue-400 mr-3'">
          <i :class="msg.role === 'user' ? 'fas fa-user' : 'fas fa-robot'" class="text-xs"></i>
        </div>
        <div class="p-3 rounded-2xl text-sm leading-relaxed max-w-[85%]"
             :class="msg.role === 'user' ? 'rounded-tr-none bg-green-900/20 border border-green-700/30 text-green-100' : 'rounded-tl-none bg-white/5 border border-white/5 text-gray-300'">
          <p class="whitespace-pre-wrap font-mono text-[13px]">{{ msg.content }}</p>
        </div>
      </div>

      <!-- Loading 状态 -->
      <div v-if="isAnalyzing" class="flex items-start">
        <div class="w-6 h-6 mt-1 rounded-md border border-blue-500/50 flex items-center justify-center bg-blue-900/30 text-blue-400 flex-shrink-0">
          <i class="fas fa-robot text-xs animate-pulse"></i>
        </div>
        <div class="ml-3 p-3 rounded-2xl rounded-tl-none bg-white/5 border border-white/5 text-sm text-blue-400">
          <span class="flex space-x-1 items-center h-5">
            <span class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0s"></span>
            <span class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
            <span class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
            <span class="ml-2 font-mono text-xs">ANALYZING...</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 底部输入区 -->
    <div class="p-4 bg-black/20 border-t border-white/5">
      <div class="flex space-x-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
        <button @click="requestAnalysis" :disabled="isAnalyzing || !currentQuestion"
                class="whitespace-nowrap px-3 py-1.5 bg-blue-900/30 border border-blue-700/50 rounded-full text-xs text-blue-300 hover:bg-blue-800/40 hover:text-blue-200 transition-colors disabled:opacity-50 flex items-center">
          <i class="fas fa-magic mr-1.5"></i> 分析当前题目
        </button>
      </div>

      <div class="relative flex items-center">
        <input v-model="userInput" @keyup.enter="sendMessage" type="text" :disabled="isAnalyzing"
               class="w-full bg-black/40 border border-gray-600/50 rounded-xl py-3 pl-4 pr-12 text-gray-200 text-sm focus:outline-none focus:border-blue-500/70 focus:bg-gray-900/60 transition-all font-mono"
               placeholder="System.in.read()...">
        <button @click="sendMessage" :disabled="isAnalyzing || !userInput.trim()"
                class="absolute right-2 w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <i class="fas fa-paper-plane text-sm"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 引入 PropType 以规范化 TypeScript 类型断言
import { ref, watch, nextTick, PropType } from 'vue'

// 使用 PropType 彻底消除 "(StringConstructor | ArrayConstructor)[]" 类型错误
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  currentQuestion: {
    type: Object as PropType<any>,
    default: undefined
  },
  currentAnswer: {
    type: [String, Array] as PropType<string | string[]>,
    default: undefined
  }
})

const emit = defineEmits(['close'])

const chatHistory = ref<{role: 'user' | 'ai', content: string}[]>([])
const userInput = ref('')
const isAnalyzing = ref(false)
const chatBody = ref<HTMLElement | null>(null)

const scrollToBottom = async () => {
  await nextTick()
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight
  }
}

watch(() => chatHistory.value.length, scrollToBottom)

const sendMessage = () => {
  if (!userInput.value.trim() || isAnalyzing.value) return
  chatHistory.value.push({ role: 'user', content: userInput.value })
  const query = userInput.value
  userInput.value = ''

  isAnalyzing.value = true
  setTimeout(() => {
    isAnalyzing.value = false
    chatHistory.value.push({ role: 'ai', content: `收到你的问题：${query}。不过我现在的主要任务是辅助你解题，你可以点击"分析当前题目"让我帮忙哦。` })
  }, 1000)
}

const requestAnalysis = async () => {
  if (!props.currentQuestion || isAnalyzing.value) return

  let uAnsStr = '未作答'
  if (props.currentAnswer) {
    uAnsStr = Array.isArray(props.currentAnswer) ? props.currentAnswer.join(',') : props.currentAnswer
  }

  chatHistory.value.push({
    role: 'user',
    content: `请帮我分析第这道题目：\n${props.currentQuestion.content}\n我的作答是：${uAnsStr}`
  })
  isAnalyzing.value = true

  try {
    const qId = props.currentQuestion.id
    const url = `/api/v1/ai/tutor/stream?questionId=${qId}&wrongUserAnswer=${encodeURIComponent(uAnsStr)}`

    const eventSource = new EventSource(url)

    chatHistory.value.push({ role: 'ai', content: '' })
    const targetMsgIndex = chatHistory.value.length - 1

    eventSource.onmessage = (event) => {
      isAnalyzing.value = false
      if (event.data === '[DONE]') {
        eventSource.close()
      } else {
        chatHistory.value[targetMsgIndex].content += event.data.replace(/\\n/g, '\n')
        scrollToBottom()
      }
    }

    eventSource.onerror = (err) => {
      isAnalyzing.value = false
      eventSource.close()
      chatHistory.value[targetMsgIndex].content = "网络连接异常，AI 引擎暂时离线。"
    }

  } catch (error) {
    isAnalyzing.value = false
    chatHistory.value.push({ role: 'ai', content: '抱歉，神经计算引擎连接超时，请稍后重试。' })
  }
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>