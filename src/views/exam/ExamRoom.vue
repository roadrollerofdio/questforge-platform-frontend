<template>
  <div class="fixed inset-0 bg-[#f4f6f8] z-[100] flex flex-col font-sans antialiased">
    <!-- 顶部悬浮头 -->
    <header class="h-16 bg-white shadow-sm flex items-center justify-between px-6 shrink-0 z-20">
      <div class="flex items-center space-x-3">
        <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">考试中</span>
        <h1 class="text-lg font-bold text-gray-800 tracking-wide">{{ paperInfo.title || '载入中...' }}</h1>
      </div>
      <div class="flex items-center space-x-8">
        <div class="flex items-center bg-red-50 px-5 py-2 rounded-full border border-red-100 shadow-inner">
          <i class="fa-solid fa-clock text-red-500 mr-2 text-lg animate-pulse"></i>
          <span class="text-xl font-black text-red-600 font-mono tracking-widest">{{ formattedTime }}</span>
        </div>
        <button @click="confirmSubmit" class="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-all active:scale-95">交卷</button>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden relative">
      <!-- 左侧试卷 -->
      <div class="flex-1 overflow-y-auto p-6 lg:p-10 flex justify-center pb-32 scroll-smooth no-scrollbar">
        <div class="w-full max-w-3xl space-y-8">
          <div class="bg-white p-10 rounded-2xl border border-gray-200 shadow-sm text-center mb-8">
            <h2 class="text-3xl font-black text-gray-800 mb-3 tracking-tight">{{ paperInfo.title }}</h2>
            <p class="text-gray-500 font-medium">共 {{ paperInfo.questions?.length || 0 }} 题，满分 {{ paperInfo.totalScore }} 分。请在规定时间内作答。</p>
          </div>

          <div v-for="(q, index) in paperInfo.questions" :key="q.questionId" :id="`q-${index}`" class="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:border-blue-300 transition-colors">
            <div class="flex mb-5">
              <span class="text-blue-600 font-black text-xl mr-3 mt-0.5">{{ index + 1 }}.</span>
              <h3 class="text-lg text-gray-800 font-bold leading-relaxed">
                <span class="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-md mr-2 align-middle">
                  {{ q.questionType === 1 ? '单选题' : q.questionType === 2 ? '多选题' : '判断题' }} | {{ q.score }}分
                </span>
                <span v-html="q.content"></span>
              </h3>
            </div>

            <div class="space-y-3 pl-8">
              <label v-for="(opt, oIdx) in q.options" :key="opt.key"
                     :class="`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${isOptionSelected(q.questionId, q.questionType, opt.key) ? 'border-blue-500 bg-blue-50/40 shadow-sm' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`"
                     @click="q.questionType === 2 ? handleMultiSelect(q.questionId, opt.key) : handleSingleSelect(q.questionId, opt.key)">
                <div :class="`w-5 h-5 flex items-center justify-center mr-4 ${q.questionType === 2 ? 'rounded' : 'rounded-full'} border-2 ${isOptionSelected(q.questionId, q.questionType, opt.key) ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'}`">
                  <i v-if="isOptionSelected(q.questionId, q.questionType, opt.key)" class="fa-solid fa-check text-[10px]"></i>
                </div>
                <span class="font-bold text-gray-700 w-8 text-lg">{{ opt.key }}.</span>
                <span class="text-gray-700 font-medium">{{ opt.val }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧答题卡 -->
      <div class="w-80 bg-white border-l border-gray-200 shadow-2xl flex flex-col shrink-0 z-10">
        <div class="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 class="text-lg font-bold text-gray-800 flex items-center">
            <i class="fa-solid fa-table-cells text-blue-600 mr-2"></i> 答题卡概览
          </h3>
          <div class="flex space-x-6 mt-4 text-xs font-bold text-gray-500">
            <div class="flex items-center"><div class="w-3.5 h-3.5 bg-green-500 rounded mr-1.5 shadow-sm"></div>已答</div>
            <div class="flex items-center"><div class="w-3.5 h-3.5 bg-white border-2 border-gray-200 rounded mr-1.5"></div>未答</div>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-6">
          <div class="grid grid-cols-5 gap-3">
            <button v-for="(q, index) in paperInfo.questions" :key="q.questionId"
                    @click="scrollToQuestion(index)"
                    :class="`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black transition-all ${isQuestionAnswered(q.questionId) ? 'bg-green-500 text-white shadow-md transform hover:scale-105' : 'bg-white border-2 border-gray-200 text-gray-500 hover:border-blue-400'}`">
              {{ index + 1 }}
            </button>
          </div>
        </div>
        <div class="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-center">
          <div class="flex items-center text-green-600 text-sm font-bold" :class="{'animate-pulse': isSyncing}">
            <i class="fa-solid fa-cloud-arrow-up mr-2 text-lg"></i> {{ isSyncing ? '正在保存...' : '已自动保存于云端' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()
const paperInfo = ref<any>({})
const answers = ref<Record<string, string>>({})
const timeLeft = ref(0)
let timerId: any = null
let heartbeatId: any = null
const isSyncing = ref(false)
let hasSubmitted = false

onMounted(async () => {
  await fetchPaper()
  // 注入硬核防作弊事件
  document.addEventListener('visibilitychange', antiCheat)
  document.addEventListener('contextmenu', prevent)

  // 开始倒计时 (取考试限时与绝对截止时间较小者)
  timerId = setInterval(() => {
    if (timeLeft.value > 0) timeLeft.value--;
    else submitExam(true, "时间到，系统已自动强制交卷！")
  }, 1000)
  heartbeatId = setInterval(() => {}, 10000)
})

onUnmounted(() => {
  clearInterval(timerId); clearInterval(heartbeatId)
  document.removeEventListener('visibilitychange', antiCheat)
  document.removeEventListener('contextmenu', prevent)
})

// 路由离开拦截（如果不允许退出）
onBeforeRouteLeave((to, from, next) => {
  if (!hasSubmitted && !paperInfo.value.allowQuit) {
    ElMessageBox.alert('本次考试严禁中途退出！您试图离开考场的行为已被记录，系统将强制交卷。', '违规警告', { type: 'error', showClose: false }).then(() => {
      submitExam(true, "异常退出考场被强制交卷")
      next()
    })
  } else {
    next()
  }
})

const fetchPaper = async () => {
  try {
    paperInfo.value = await request.get(`/exam/paper/detail/${route.params.id}`) as any
    // 计算剩余秒数
    let maxSeconds = paperInfo.value.durationMins * 60
    if (paperInfo.value.examEndTimeTs) {
      let diffSecs = Math.floor((paperInfo.value.examEndTimeTs - Date.now()) / 1000)
      maxSeconds = Math.min(maxSeconds, diffSecs)
    }
    timeLeft.value = Math.max(maxSeconds, 0)
  } catch (e) { router.back() }
}

const syncCloud = async (qId: string, ans: string) => {
  isSyncing.value = true
  await request.post('/exam/session/heartbeat', { paperId: paperInfo.value.paperId, questionId: qId, userAnswer: ans })
  setTimeout(() => isSyncing.value = false, 500)
}

// 单选与判断逻辑
const handleSingleSelect = (qId: string, key: string) => {
  answers.value[qId] = key
  syncCloud(qId, key)
}

// 多选逻辑
const handleMultiSelect = (qId: string, key: string) => {
  let arr = answers.value[qId] ? answers.value[qId].split(',') : []
  if (arr.includes(key)) arr = arr.filter(k => k !== key)
  else arr.push(key)
  const str = arr.sort().join(',')
  answers.value[qId] = str
  syncCloud(qId, str)
}

// 选项是否被选中判定
const isOptionSelected = (qId: string, type: number, key: string) => {
  if (!answers.value[qId]) return false
  if (type === 2) return answers.value[qId].split(',').includes(key)
  return answers.value[qId] === key
}

const isQuestionAnswered = (qId: string) => !!answers.value[qId]

// 答题卡滚动逻辑
const scrollToQuestion = (index: number) => {
  document.getElementById(`q-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// --- 硬核防切屏逻辑 ---
const antiCheat = () => {
  if (document.hidden && !hasSubmitted) {
    if (!paperInfo.value.allowSwitchScreen) {
      hasSubmitted = true // 防止重复弹窗
      ElMessageBox.alert('您违反了考试纪律：禁止切屏/息屏！系统已将您强制交卷。', '违纪处理', { type: 'error', showClose: false }).then(() => submitExam(true, "切屏作弊被强制交卷"))
    } else {
      ElMessage.warning(`请注意，您的切屏行为已被后台记录。`)
    }
  }
}
const prevent = (e: Event) => e.preventDefault()

const formattedTime = computed(() => {
  const h = Math.floor(timeLeft.value / 3600), m = Math.floor((timeLeft.value % 3600) / 60), s = timeLeft.value % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

const confirmSubmit = () => {
  ElMessageBox.confirm('确认交卷？未答完的题目将记为0分。', '交卷确认', { type: 'warning' })
      .then(() => submitExam(false, "手动交卷")).catch(() => {})
}

const submitExam = async (force: boolean, reason: string) => {
  hasSubmitted = true
  try {
    const res: any = await request.post('/exam/submit', { paperId: paperInfo.value.paperId, forceSubmit: force })
    if(force) ElMessage.warning(reason)
    router.replace(`/exam/report/${res.recordId}?paperId=${paperInfo.value.paperId}`)
  } catch (e) { console.error(e) }
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>