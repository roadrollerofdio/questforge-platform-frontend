<template>
  <div class="min-h-screen bg-[#0a0f1c] text-gray-200 overflow-hidden relative font-sans selection:bg-blue-500/30">
    <!-- 背景雷达/光效点缀 -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      <div class="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      <div class="absolute top-1/4 -left-32 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 -right-32 w-64 h-64 bg-green-600/10 rounded-full blur-3xl"></div>
    </div>

    <div v-if="loading" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0f1c]">
      <div class="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
      <p class="text-blue-400 font-mono tracking-widest text-sm">INITIALIZING STAGE DATA...</p>
    </div>

    <!-- 主体内容区 -->
    <div v-else class="relative z-10 h-screen flex flex-col">
      <!-- 顶栏 HUD -->
      <header class="flex justify-between items-center p-6 border-b border-white/5 backdrop-blur-sm bg-[#0f172a]/80">
        <div class="flex items-center space-x-4">
          <button @click="handleQuit" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10">
            <i class="fas fa-chevron-left text-gray-400"></i>
          </button>
          <div>
            <div class="text-xs text-blue-400 font-mono mb-1">STAGE #{{ stageId }}</div>
            <h1 class="text-xl font-bold tracking-wide">{{ stageData?.stageName || '未知挑战' }}</h1>
          </div>
        </div>

        <div class="flex items-center space-x-8">
          <div class="flex flex-col items-end">
            <div class="text-xs text-gray-500 font-mono mb-1">TIME REMAINING</div>
            <div class="text-2xl font-mono font-bold" :class="isTimeWarning ? 'text-red-500 animate-pulse' : 'text-green-400'">
              {{ formattedTime }}
            </div>
          </div>
          <button @click="submitExam(false)" class="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 rounded-tl-xl rounded-br-xl hover:from-blue-500 hover:to-blue-700 transition-all font-bold tracking-widest border border-blue-400/30 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            交 卷
          </button>
        </div>
      </header>

      <main class="flex-1 flex overflow-hidden">
        <!-- 左侧雷达地图 (答题卡) -->
        <aside class="w-20 md:w-64 border-r border-white/5 bg-black/20 p-4 overflow-y-auto flex flex-col items-center md:items-start">
          <div class="text-xs text-gray-500 font-mono mb-6 hidden md:block">MISSION MAP</div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
            <div v-for="(q, index) in questions" :key="q.id"
                 @click="jumpToQuestion(index)"
                 class="aspect-square flex items-center justify-center rounded cursor-pointer font-mono text-sm transition-all border"
                 :class="[
                    currentQuestionIndex === index ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]' :
                    (answers[q.id] ? 'bg-green-900/30 border-green-700/50 text-green-500' : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30')
                  ]">
              {{ index + 1 }}
            </div>
          </div>
        </aside>

        <!-- 中央答题区 -->
        <section class="flex-1 flex flex-col relative overflow-hidden">
          <div class="flex-1 overflow-y-auto p-8 md:p-16">
            <transition name="fade" mode="out-in">
              <div :key="currentQuestionIndex" class="max-w-4xl mx-auto">
                <div class="flex items-start mb-8">
                  <span class="text-5xl font-black text-white/10 mr-4 font-mono leading-none">{{ String(currentQuestionIndex + 1).padStart(2, '0') }}</span>
                  <div class="pt-2">
                    <span class="px-2 py-1 text-xs rounded bg-blue-900/50 text-blue-400 border border-blue-700/50 mr-3 align-middle font-mono">
                      {{ getQuestionTypeLabel(currentQuestion?.type) }}
                    </span>
                    <h2 class="text-2xl leading-relaxed inline align-middle font-medium">{{ currentQuestion?.content }}</h2>
                  </div>
                </div>

                <div class="space-y-4 ml-16">
                  <label v-for="(opt, idx) in currentQuestion?.options" :key="idx"
                         class="group flex items-center p-5 rounded-xl border transition-all cursor-pointer relative overflow-hidden"
                         :class="isOptionSelected(opt.value) ? 'bg-blue-900/30 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'">
                    <!-- 选中特效背景 -->
                    <div v-if="isOptionSelected(opt.value)" class="absolute left-0 top-0 w-1 h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>

                    <div class="w-8 h-8 rounded border flex items-center justify-center mr-4 font-mono transition-colors"
                         :class="isOptionSelected(opt.value) ? 'border-blue-400 bg-blue-500/20 text-blue-300' : 'border-gray-600 text-gray-400 group-hover:border-gray-400'">
                      {{ String.fromCharCode(65 + idx) }}
                    </div>
                    <input :type="currentQuestion?.type === 2 ? 'checkbox' : 'radio'"
                           :value="opt.value"
                           v-model="currentOptionModel"
                           @change="handleAnswerSelect"
                           class="hidden">
                    <span class="text-lg text-gray-300 group-hover:text-white transition-colors">{{ opt.text }}</span>
                  </label>
                </div>
              </div>
            </transition>
          </div>

          <!-- 底部控制栏 -->
          <div class="p-6 border-t border-white/5 bg-black/40 flex justify-between items-center backdrop-blur-md">
            <button @click="prev" :disabled="currentQuestionIndex === 0"
                    class="px-6 py-2 rounded border border-white/10 text-gray-400 hover:text-white hover:border-white/30 disabled:opacity-30 transition-all flex items-center font-mono text-sm">
              <i class="fas fa-arrow-left mr-2"></i> PREV
            </button>

            <!-- 呼出 AI 导师 -->
            <button @click="toggleAiTutor" class="group relative px-6 py-2 rounded-full border border-blue-500/50 bg-blue-900/20 text-blue-400 hover:bg-blue-600/20 transition-all flex items-center overflow-hidden">
              <div class="absolute inset-0 bg-blue-500/10 blur-md group-hover:bg-blue-500/30 transition-all"></div>
              <i class="fas fa-robot mr-2 relative z-10"></i>
              <span class="font-mono text-sm tracking-widest relative z-10">AI TUTOR</span>
            </button>

            <button @click="next" :disabled="currentQuestionIndex === questions.length - 1"
                    class="px-6 py-2 rounded border border-white/10 text-gray-400 hover:text-white hover:border-white/30 disabled:opacity-30 transition-all flex items-center font-mono text-sm">
              NEXT <i class="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </section>
      </main>
    </div>

    <!-- AI 伴学面板组件 -->
    <AiChat
        :isOpen="showAiTutor"
        :currentQuestion="currentQuestion"
        :currentAnswer="answers[currentQuestion?.id]"
        @close="toggleAiTutor"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import request from '@/utils/request'
import AiChat from '@/components/AiChat.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const stageId = route.params.id

// 状态
const loading = ref(true)
const stageData = ref<any>(null)
const questions = ref<any[]>([])
const currentQuestionIndex = ref(0)
const answers = ref<Record<string, string | string[]>>({}) // 暂存用户答案
const showAiTutor = ref(false)

// 倒计时逻辑
const timeLeftSeconds = ref(0)
const timer = ref<any>(null)

const formattedTime = computed(() => {
  const m = Math.floor(timeLeftSeconds.value / 60)
  const s = timeLeftSeconds.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})
const isTimeWarning = computed(() => timeLeftSeconds.value > 0 && timeLeftSeconds.value <= 300) // 最后5分钟

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

// v-model 绑定的中间变量，处理单选(string)和多选(array)的差异
const currentOptionModel = computed({
  get() {
    if (!currentQuestion.value) return null;
    const qId = currentQuestion.value.id;
    if (currentQuestion.value.type === 2) {
      // 多选返回数组
      return answers.value[qId] ? (answers.value[qId] as string).split(',') : [];
    }
    return answers.value[qId] || '';
  },
  set(val: any) {
    if (!currentQuestion.value) return;
    const qId = currentQuestion.value.id;
    if (currentQuestion.value.type === 2) {
      answers.value[qId] = (val as string[]).sort().join(',');
    } else {
      answers.value[qId] = val;
    }
  }
})

onMounted(async () => {
  await initStage()
})

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})

const initStage = async () => {
  try {
    loading.value = true
    // 调用我们在 UserStageServiceImpl 中实现的进入关卡逻辑
    const res: any = await request.post(`/user/stage/${stageId}/enter`)
    stageData.value = res.data

    // 解析题目，假设后端 Redis 中存的是 { questions: [...] }
    if (res.data.questions && res.data.questions.length > 0) {
      questions.value = res.data.questions
      // 初始化倒计时，假设关卡有 duration 字段（分钟）
      timeLeftSeconds.value = (stageData.value.duration || 60) * 60
      startTimer()
    } else {
      alert('未拉取到题目信息')
    }
  } catch (error) {
    console.error('进入关卡失败', error)
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
      submitExam(true) // 倒计时结束强制交卷
    }
  }, 1000)
}

const isOptionSelected = (val: string) => {
  if (currentQuestion.value?.type === 2) {
    return (currentOptionModel.value as string[]).includes(val)
  }
  return currentOptionModel.value === val
}

const handleAnswerSelect = async () => {
  if (!currentQuestion.value) return
  const qId = currentQuestion.value.id
  const ansStr = answers.value[qId] as string

  // 发送心跳包到 Redis，我们在后端写了 saveHeartbeat 接口
  try {
    await request.post('/user/stage/heartbeat', {
      stageId: stageId,
      questionId: qId,
      userAnswer: ansStr
    })
  } catch (e) {
    console.warn('心跳同步失败', e)
  }
}

const jumpToQuestion = (index: number) => { currentQuestionIndex.value = index }
const prev = () => { if (currentQuestionIndex.value > 0) currentQuestionIndex.value-- }
const next = () => { if (currentQuestionIndex.value < questions.value.length - 1) currentQuestionIndex.value++ }

const toggleAiTutor = () => { showAiTutor.value = !showAiTutor.value }

const submitExam = async (force: boolean = false) => {
  if (!force) {
    const unAnswered = questions.value.filter(q => !answers.value[q.id]).length
    if (unAnswered > 0) {
      if (!confirm(`还有 ${unAnswered} 道题未作答，确定要交卷吗？`)) return
    } else {
      if (!confirm('确定要提交当前考卷吗？')) return
    }
  }

  try {
    loading.value = true
    // 调用异步交卷接口
    const res: any = await request.post('/user/stage/submit', {
      stageId: stageId,
      forceSubmit: force ? 1 : 0
    })

    // 返回的是 progressId，跳转到结算报告页
    router.replace(`/exam/report/${res.data}`)
  } catch (error: any) {
    alert(error.message || '交卷失败')
    loading.value = false
  }
}

const handleQuit = () => {
  if (confirm('正在挑战中，退出可能导致成绩作废，是否确认？')) {
    router.push('/paper/list')
  }
}

const getQuestionTypeLabel = (type: number) => {
  switch(type) {
    case 1: return 'SINGLE'
    case 2: return 'MULTIPLE'
    case 3: return 'JUDGE'
    default: return 'UNKNOWN'
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from { opacity: 0; transform: translateY(10px); }
.fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>