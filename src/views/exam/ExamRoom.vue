<template>
  <div class="min-h-screen bg-[#F7F9F4] flex flex-col font-sans">
    <!-- 加载中 -->
    <div v-if="loading" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F7F9F4]">
      <div class="text-6xl animate-bounce mb-4">🦉</div>
      <p class="text-[#58CC02] font-extrabold tracking-wide">正在进入关卡...</p>
    </div>

    <template v-else>
      <!-- ===== 顶栏: 退出 + 进度条 + 倒计时 ===== -->
      <header class="sticky top-0 z-40 bg-[#F7F9F4] px-4 pt-4 pb-2">
        <div class="max-w-2xl mx-auto flex items-center gap-4">
          <button @click="handleQuit" class="text-gray-400 hover:text-gray-600 text-xl">
            <i class="fas fa-xmark"></i>
          </button>
          <!-- 答题进度条 -->
          <div class="flex-1 h-4 bg-[#E5E5E5] rounded-full overflow-hidden">
            <div class="h-full bg-[#58CC02] rounded-full transition-all duration-500 relative"
                 :style="{ width: progressPercent + '%' }">
              <div class="absolute inset-x-2 top-0.5 h-1 bg-white/40 rounded-full"></div>
            </div>
          </div>
          <!-- 倒计时 -->
          <div class="flex items-center gap-1.5 font-extrabold"
               :class="isTimeWarning ? 'text-[#FF4B4B] animate-pulse' : 'text-[#FF9600]'">
            <i class="fas fa-clock"></i>
            <span class="font-mono">{{ formattedTime }}</span>
          </div>
        </div>
      </header>

      <!-- ===== 题目区 ===== -->
      <main class="flex-1 w-full max-w-2xl mx-auto px-4 py-6 pb-40">
        <transition name="slide-fade" mode="out-in">
          <div :key="currentQuestionIndex">
            <div class="flex items-center gap-2 mb-4">
              <span class="px-3 py-1 rounded-xl text-xs font-extrabold"
                    :class="typeBadgeClass(currentQuestion?.type)">
                {{ getQuestionTypeLabel(currentQuestion?.type) }}
              </span>
              <span class="text-sm font-bold text-gray-400">第 {{ currentQuestionIndex + 1 }} / {{ questions.length }} 题</span>
            </div>

            <h2 class="text-xl font-extrabold text-gray-700 leading-relaxed mb-6">{{ currentQuestion?.content }}</h2>

            <div class="space-y-3">
              <button v-for="(opt, idx) in currentQuestion?.options" :key="idx"
                      @click="toggleOption(opt.value)"
                      class="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-b-4 text-left transition-all bg-white"
                      :class="isOptionSelected(opt.value)
                        ? 'border-[#1CB0F6] bg-[#DDF4FF] text-[#1899D6]'
                        : 'border-[#E5E5E5] text-gray-600 hover:bg-[#F7F9F4] active:border-b-2 active:translate-y-0.5'">
                <span class="w-9 h-9 shrink-0 rounded-xl border-2 flex items-center justify-center font-extrabold"
                      :class="isOptionSelected(opt.value) ? 'border-[#1CB0F6] text-[#1CB0F6] bg-white' : 'border-[#E5E5E5] text-gray-400'">
                  {{ String.fromCharCode(65 + idx) }}
                </span>
                <span class="font-bold text-base">{{ opt.text }}</span>
              </button>
            </div>
          </div>
        </transition>

        <!-- 题目导航点 -->
        <div class="flex flex-wrap gap-2 justify-center mt-8">
          <button v-for="(q, index) in questions" :key="q.id"
                  @click="currentQuestionIndex = index"
                  class="w-8 h-8 rounded-xl text-xs font-extrabold border-2 border-b-4 transition-all"
                  :class="currentQuestionIndex === index
                    ? 'bg-[#58CC02] border-[#46A302] text-white'
                    : (answers[q.id] ? 'bg-[#E7F8D9] border-[#B8E29A] text-[#58CC02]' : 'bg-white border-[#E5E5E5] text-gray-400')">
            {{ index + 1 }}
          </button>
        </div>
      </main>

      <!-- ===== 底部操作栏 ===== -->
      <footer class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-[#E5E5E5]">
        <div class="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <button @click="prev" :disabled="currentQuestionIndex === 0"
                  class="px-6 py-3 rounded-2xl font-extrabold border-2 border-b-4 border-[#E5E5E5] text-gray-500 bg-white disabled:opacity-40 hover:bg-[#F7F9F4] active:border-b-2 active:translate-y-0.5 transition-all">
            上一题
          </button>

          <button v-if="currentQuestionIndex < questions.length - 1" @click="next"
                  class="flex-1 max-w-[220px] px-6 py-3 rounded-2xl font-extrabold text-white bg-[#58CC02] shadow-[0_4px_0_#46A302] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all">
            下一题
          </button>
          <button v-else @click="submitExam(false)"
                  class="flex-1 max-w-[220px] px-6 py-3 rounded-2xl font-extrabold text-white bg-[#FF9600] shadow-[0_4px_0_#CC7800] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all">
            提交关卡
          </button>
        </div>
      </footer>

      <!-- ===== AI 教师悬浮窗 ===== -->
      <button @click="openAiDialog"
              class="fixed right-5 bottom-24 z-40 w-16 h-16 rounded-full bg-[#CE82FF] shadow-[0_5px_0_#A767CC] flex items-center justify-center text-3xl hover:brightness-105 active:translate-y-1 active:shadow-none transition-all animate-wiggle">
        🤖
      </button>

      <!-- AI 对话框 -->
      <transition name="pop">
        <div v-if="showAiDialog" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" @click.self="showAiDialog = false">
          <div class="w-full max-w-lg bg-white rounded-3xl p-6 max-h-[75vh] flex flex-col">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-[#F3E5FF] flex items-center justify-center text-2xl">🤖</div>
                <div>
                  <div class="font-extrabold text-gray-700">AI 教师</div>
                  <div class="text-xs font-bold" :class="aiMode === 'hint' ? 'text-[#FF9600]' : 'text-[#58CC02]'">
                    {{ aiMode === 'hint' ? '你还没作答, 给你一点提示 💡' : '你已作答, 来看看解析 📖' }}
                  </div>
                </div>
              </div>
              <button @click="showAiDialog = false" class="text-gray-400 hover:text-gray-600 text-xl">
                <i class="fas fa-xmark"></i>
              </button>
            </div>

            <div class="flex-1 overflow-y-auto bg-[#F7F9F4] rounded-2xl p-4 min-h-[160px]">
              <p class="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">{{ aiContent || ' ' }}</p>
              <div v-if="aiStreaming" class="flex gap-1 mt-2">
                <span class="w-2 h-2 bg-[#CE82FF] rounded-full animate-bounce"></span>
                <span class="w-2 h-2 bg-[#CE82FF] rounded-full animate-bounce" style="animation-delay: 0.15s"></span>
                <span class="w-2 h-2 bg-[#CE82FF] rounded-full animate-bounce" style="animation-delay: 0.3s"></span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { streamSse } from '@/utils/sse'

const route = useRoute()
const router = useRouter()
const stageId = route.params.id as string

const loading = ref(true)
const stageData = ref<any>(null)
const questions = ref<any[]>([])
const currentQuestionIndex = ref(0)
const answers = ref<Record<string, string>>({})

// AI 悬浮窗
const showAiDialog = ref(false)
const aiContent = ref('')
const aiStreaming = ref(false)
const aiMode = ref<'hint' | 'analysis'>('hint')

// 倒计时
const timeLeftSeconds = ref(0)
const timer = ref<any>(null)

const formattedTime = computed(() => {
  const m = Math.floor(timeLeftSeconds.value / 60)
  const s = timeLeftSeconds.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})
const isTimeWarning = computed(() => timeLeftSeconds.value > 0 && timeLeftSeconds.value <= 300)
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const progressPercent = computed(() => {
  if (questions.value.length === 0) return 0
  const answered = questions.value.filter(q => answers.value[q.id]).length
  return Math.round(answered / questions.value.length * 100)
})

onMounted(async () => { await initStage() })
onUnmounted(() => { if (timer.value) clearInterval(timer.value) })

const initStage = async () => {
  try {
    loading.value = true
    const res: any = await request.post(`/user/stage/${stageId}/enter`)
    stageData.value = res
    if (res.questions && res.questions.length > 0) {
      questions.value = res.questions
      timeLeftSeconds.value = (res.duration || 60) * 60
      startTimer()
    } else {
      ElMessage.warning('该关卡还没有配置题目')
    }
  } catch (error) {
    console.error('进入关卡失败', error)
    setTimeout(() => router.replace('/user/home'), 1200)
  } finally {
    loading.value = false
  }
}

const startTimer = () => {
  timer.value = setInterval(() => {
    if (timeLeftSeconds.value > 0) {
      timeLeftSeconds.value--
    } else {
      clearInterval(timer.value)
      submitExam(true)
    }
  }, 1000)
}

// 选项点击: 单选/判断直接选中, 多选切换
const toggleOption = (val: string) => {
  const q = currentQuestion.value
  if (!q) return
  if (q.type === 2) {
    const selected = answers.value[q.id] ? answers.value[q.id].split(',') : []
    const idx = selected.indexOf(val)
    if (idx >= 0) selected.splice(idx, 1)
    else selected.push(val)
    answers.value[q.id] = selected.sort().join(',')
  } else {
    answers.value[q.id] = val
  }
  syncHeartbeat(q.id)
}

const isOptionSelected = (val: string) => {
  const q = currentQuestion.value
  if (!q) return false
  const ans = answers.value[q.id] || ''
  return q.type === 2 ? ans.split(',').includes(val) : ans === val
}

const syncHeartbeat = async (questionId: string) => {
  try {
    await request.post('/user/stage/heartbeat', {
      stageId: stageId,
      questionId: questionId,
      userAnswer: answers.value[questionId] || ''
    })
  } catch (e) {
    console.warn('心跳同步失败', e)
  }
}

const prev = () => { if (currentQuestionIndex.value > 0) currentQuestionIndex.value-- }
const next = () => { if (currentQuestionIndex.value < questions.value.length - 1) currentQuestionIndex.value++ }

// ===== AI 教师: 未作答给提示 / 已作答给解析 =====
const openAiDialog = () => {
  const q = currentQuestion.value
  if (!q) return
  const userAnswer = answers.value[q.id] || ''
  aiMode.value = userAnswer ? 'analysis' : 'hint'
  aiContent.value = ''
  aiStreaming.value = true
  showAiDialog.value = true

  const params = new URLSearchParams({
    questionId: q.id,
    userAnswer: userAnswer,
    mode: aiMode.value
  })
  streamSse(`/api/v1/ai-engine/tutor/stage-chat?${params.toString()}`, {
    method: 'GET',
    onMessage: (chunk) => { aiContent.value += chunk },
    onDone: () => { aiStreaming.value = false },
    onError: () => {
      aiStreaming.value = false
      if (!aiContent.value) aiContent.value = 'AI 教师暂时离开了, 请稍后再试~'
    }
  })
}

const submitExam = async (force = false) => {
  if (!force) {
    const unAnswered = questions.value.filter(q => !answers.value[q.id]).length
    const tip = unAnswered > 0 ? `还有 ${unAnswered} 道题未作答, 确定要提交吗?` : '确定提交本关卡吗?'
    try {
      await ElMessageBox.confirm(tip, '提交关卡', { confirmButtonText: '提交', cancelButtonText: '再想想' })
    } catch (e) {
      return
    }
  }

  try {
    loading.value = true
    const res: any = await request.post('/user/stage/submit', {
      stageId: stageId,
      forceSubmit: force ? 1 : 0
    })
    router.replace(`/exam/result/${res.progressId}`)
  } catch (error: any) {
    ElMessage.error(error.message || '提交失败')
    loading.value = false
  }
}

const handleQuit = async () => {
  try {
    await ElMessageBox.confirm('正在挑战中, 现在退出进度会保留, 确认退出吗?', '退出关卡', {
      confirmButtonText: '退出', cancelButtonText: '继续挑战'
    })
    router.push('/user/home')
  } catch (e) { /* 取消 */ }
}

const getQuestionTypeLabel = (type: number) => {
  switch (type) {
    case 1: return '单选题'
    case 2: return '多选题'
    case 3: return '判断题'
    default: return '题目'
  }
}

const typeBadgeClass = (type: number) => {
  switch (type) {
    case 1: return 'bg-[#DDF4FF] text-[#1CB0F6]'
    case 2: return 'bg-[#F3E5FF] text-[#CE82FF]'
    case 3: return 'bg-[#FFF0D9] text-[#FF9600]'
    default: return 'bg-gray-100 text-gray-400'
  }
}
</script>

<style scoped>
.slide-fade-enter-active, .slide-fade-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.slide-fade-enter-from { opacity: 0; transform: translateX(20px); }
.slide-fade-leave-to { opacity: 0; transform: translateX(-20px); }

.pop-enter-active, .pop-leave-active { transition: opacity 0.2s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; }

@keyframes wiggle {
  0%, 88%, 100% { transform: rotate(0deg); }
  92% { transform: rotate(-8deg); }
  96% { transform: rotate(8deg); }
}
.animate-wiggle { animation: wiggle 4s ease-in-out infinite; }
</style>
