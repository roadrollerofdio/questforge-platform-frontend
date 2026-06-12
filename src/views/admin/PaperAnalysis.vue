<template>
  <div class="space-y-6 max-w-7xl mx-auto animate-fade-in font-sans pb-10">
    <!-- 顶部标题栏 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <button @click="$router.push('/admin/paper')" class="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 mr-3 transition-colors"><i class="fa-solid fa-arrow-left"></i></button>
        <h2 class="text-2xl font-bold text-gray-800">学情分析大盘</h2>
        <span v-if="detail" class="ml-4 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-bold shadow-sm">
          <i class="fa-solid fa-flag mr-2"></i>{{ detail.projectTitle }}
        </span>
      </div>
      <button @click="loadData" class="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-bold text-gray-600 transition-colors">
        <i class="fa-solid fa-rotate-right mr-2"></i>刷新数据
      </button>
    </div>

    <div v-loading="loading">
      <!-- 宏观指标卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
          <p class="text-gray-500 font-bold mb-2">参与学员数</p><p class="text-4xl font-black text-blue-600">{{ detail?.totalParticipants ?? 0 }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
          <p class="text-gray-500 font-bold mb-2">全员平均分</p><p class="text-4xl font-black text-indigo-600">{{ detail?.averageScore ?? 0 }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
          <p class="text-gray-500 font-bold mb-2">最高平均分</p><p class="text-4xl font-black text-green-600">{{ highestScore }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
          <p class="text-gray-500 font-bold mb-2">考核通关率</p><p class="text-4xl font-black text-amber-600">{{ statData?.passRate ?? '0%' }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <!-- 左侧：分布图 + 学员明细 -->
        <div class="xl:col-span-2 space-y-6">
          <!-- 分数段分布 -->
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <h4 class="font-bold text-gray-800 text-lg mb-6 border-l-4 border-blue-600 pl-3">全员分数段分布情况</h4>
            <div class="space-y-5 max-w-3xl mx-auto" v-if="statData">
              <div v-for="(count, range) in statData.scoreDistribution" :key="range" class="flex items-center">
                <span class="w-24 text-right text-sm font-bold text-gray-700 mr-4">{{ range }} 分段</span>
                <div class="flex-1 bg-gray-100 h-6 rounded-full overflow-hidden relative shadow-inner">
                  <div class="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000" :style="{ width: `${distributionTotal ? (count / distributionTotal * 100) : 0}%` }"></div>
                </div>
                <span class="w-16 text-sm font-bold text-gray-600 text-left ml-4">{{ count }} 人</span>
              </div>
            </div>
          </div>

          <!-- 学员学习明细表 -->
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div class="flex items-center justify-between mb-6">
              <h4 class="font-bold text-gray-800 text-lg border-l-4 border-blue-600 pl-3">学员学习明细 (各关卡得分)</h4>
              <span class="text-xs text-gray-400 font-bold">按平均分降序排列</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse whitespace-nowrap">
                <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 sticky left-0 bg-gray-50">学员</th>
                  <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">平均分</th>
                  <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">通关进度</th>
                  <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">错题数</th>
                  <th v-for="st in detail?.stages || []" :key="st.stageId" class="px-4 py-3 text-xs font-bold text-gray-500 border-b border-gray-200 text-center">
                    {{ st.stageName }}
                  </th>
                  <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 text-right">操作</th>
                </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                <tr v-for="stu in detail?.students || []" :key="stu.userId" class="hover:bg-gray-50 transition-colors">
                  <td class="px-4 py-4 sticky left-0 bg-white">
                    <div class="font-bold text-gray-800">{{ stu.realName || '匿名学员' }}</div>
                    <div class="text-xs text-gray-400 font-mono">{{ stu.username }}</div>
                  </td>
                  <td class="px-4 py-4">
                    <span :class="`text-lg font-black ${scoreColor(stu.averageScore)}`">{{ stu.averageScore }}</span>
                  </td>
                  <td class="px-4 py-4">
                    <div class="flex items-center space-x-2">
                      <div class="w-20 bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div class="h-full bg-green-500 transition-all" :style="{ width: `${stu.totalStages ? (stu.passedStages / stu.totalStages * 100) : 0}%` }"></div>
                      </div>
                      <span class="text-xs font-bold text-gray-600">{{ stu.passedStages }}/{{ stu.totalStages }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-4">
                    <span :class="`px-2 py-1 rounded text-xs font-bold ${stu.totalWrongCount > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`">{{ stu.totalWrongCount }} 题</span>
                  </td>
                  <td v-for="sd in stu.stages" :key="sd.stageId" class="px-4 py-4 text-center">
                    <span :class="`inline-block min-w-[3rem] px-2 py-1 rounded-lg text-xs font-bold ${stageChipClass(sd)}`">
                      {{ sd.score != null ? sd.score + '分' : stageStatusText(sd.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-4 text-right">
                    <button @click="openStudentDetail(stu)" class="text-blue-600 hover:underline text-sm font-bold">错题详情</button>
                  </td>
                </tr>
                <tr v-if="!detail?.students?.length"><td :colspan="5 + (detail?.stages?.length || 0)" class="text-center py-10 text-gray-400 font-bold">暂无学员参与该项目</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 右侧：AI 学情分析员 -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col xl:sticky xl:top-0" style="height: 720px;">
          <div class="p-5 border-b border-gray-100 flex items-center space-x-3 shrink-0">
            <div class="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <i class="fa-solid fa-robot text-white"></i>
            </div>
            <div>
              <h4 class="font-bold text-gray-800">AI 学情分析员</h4>
              <p class="text-xs text-gray-400">基于本项目真实学情数据回答问题</p>
            </div>
          </div>

          <div ref="chatBoxRef" class="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
            <div v-if="!chatHistory.length" class="h-full flex flex-col items-center justify-center text-center px-6">
              <i class="fa-solid fa-wand-magic-sparkles text-4xl text-indigo-300 mb-4"></i>
              <p class="text-sm text-gray-500 font-medium mb-6">我可以分析整体掌握情况、薄弱关卡、高频错题知识点，并指出需要重点关注的学员。</p>
              <button @click="askAi('')" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors">
                <i class="fa-solid fa-bolt mr-2"></i>一键全面分析
              </button>
            </div>

            <div v-for="(msg, idx) in chatHistory" :key="idx" :class="`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`">
              <div :class="`max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-700 rounded-bl-sm shadow-sm'}`">
                <span class="whitespace-pre-wrap">{{ msg.content }}</span>
                <span v-if="msg.role === 'ai' && aiStreaming && idx === chatHistory.length - 1" class="inline-block w-2 h-4 bg-indigo-400 ml-1 animate-pulse align-middle"></span>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-gray-100 shrink-0">
            <div class="flex space-x-2">
              <input v-model="aiInput" @keyup.enter="askAi()" :disabled="aiStreaming" type="text" placeholder="向 AI 提问，如：哪个关卡最薄弱？" class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 disabled:bg-gray-50" />
              <button @click="askAi()" :disabled="aiStreaming" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-bold transition-colors">
                <i :class="`fa-solid ${aiStreaming ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 学员错题详情弹窗 -->
    <el-dialog v-model="detailVisible" :title="`${activeStudent?.realName || activeStudent?.username || ''} 的学习明细`" width="720px" top="6vh">
      <div v-if="activeStudent" class="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
        <div class="flex items-center space-x-6 bg-gray-50 rounded-xl p-4 text-sm font-bold text-gray-600">
          <span>平均分: <span :class="scoreColor(activeStudent.averageScore)">{{ activeStudent.averageScore }}</span></span>
          <span>通关: <span class="text-green-600">{{ activeStudent.passedStages }}/{{ activeStudent.totalStages }}</span></span>
          <span>累计错题: <span class="text-red-500">{{ activeStudent.totalWrongCount }}</span> 题</span>
        </div>

        <div v-for="sd in activeStudent.stages" :key="sd.stageId" class="border border-gray-200 rounded-xl overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 bg-gray-50">
            <div class="flex items-center space-x-3">
              <span class="font-bold text-gray-800">{{ sd.stageName }}</span>
              <span :class="`px-2 py-0.5 rounded text-xs font-bold ${stageChipClass(sd)}`">{{ stageStatusText(sd.status) }}</span>
            </div>
            <span class="text-sm font-black" :class="sd.score != null ? scoreColor(sd.score) : 'text-gray-400'">{{ sd.score != null ? sd.score + ' 分' : '暂无成绩' }}</span>
          </div>

          <div v-if="sd.wrongQuestions?.length" class="divide-y divide-gray-100">
            <div v-for="wq in sd.wrongQuestions" :key="wq.questionId" class="px-4 py-3 text-sm">
              <p class="text-gray-800 font-medium mb-2"><i class="fa-solid fa-circle-xmark text-red-400 mr-2"></i>{{ wq.content }}</p>
              <div class="flex flex-wrap gap-x-6 gap-y-1 text-xs pl-6">
                <span class="text-red-500 font-bold">学员答案: {{ wq.userAnswer || '未作答' }}</span>
                <span class="text-green-600 font-bold">标准答案: {{ wq.standardAnswer }}</span>
              </div>
            </div>
          </div>
          <div v-else class="px-4 py-3 text-xs text-gray-400 font-medium">该关卡无错题记录</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'

const route = useRoute()
const projectId = route.params.paperId as string

const statData = ref<any>(null)
const detail = ref<any>(null)
const loading = ref(false)

const detailVisible = ref(false)
const activeStudent = ref<any>(null)

const chatBoxRef = ref<HTMLElement>()
const chatHistory = ref<{ role: 'user' | 'ai'; content: string }[]>([])
const aiInput = ref('')
const aiStreaming = ref(false)
let abortCtrl: AbortController | null = null

onMounted(loadData)
onBeforeUnmount(() => abortCtrl?.abort())

async function loadData() {
  loading.value = true
  try {
    const [stats, learning] = await Promise.all([
      request.get(`/admin/analysis/statistics/${projectId}`),
      request.get(`/admin/analysis/learning-detail/${projectId}`)
    ])
    statData.value = stats
    detail.value = learning
  } finally { loading.value = false }
}

const highestScore = computed(() => {
  const students = detail.value?.students || []
  return students.length ? Math.max(...students.map((s: any) => s.averageScore || 0)) : 0
})

const distributionTotal = computed(() => {
  const dist = statData.value?.scoreDistribution || {}
  return (Object.values(dist) as number[]).reduce((a, b) => a + Number(b), 0)
})

const scoreColor = (score: number) => score >= 90 ? 'text-green-600' : score >= 60 ? 'text-blue-600' : 'text-red-500'

// 关卡状态机: 0-未解锁, 1-已解锁待考, 2-进行中, 3-结算中, 4-已通关, 5-未通关
const stageStatusText = (status: number) => ['未解锁', '待挑战', '进行中', '结算中', '已通关', '未通关'][status] || '未知'

const stageChipClass = (sd: any) => {
  switch (sd.status) {
    case 4: return 'bg-green-50 text-green-600'
    case 5: return 'bg-red-50 text-red-500'
    case 2: case 3: return 'bg-amber-50 text-amber-600'
    default: return 'bg-gray-100 text-gray-400'
  }
}

const openStudentDetail = (stu: any) => {
  activeStudent.value = stu
  detailVisible.value = true
}

const scrollChat = () => nextTick(() => {
  if (chatBoxRef.value) chatBoxRef.value.scrollTop = chatBoxRef.value.scrollHeight
})

/**
 * AI 学情分析 (SSE 流式)。后端要求 POST + JWT，EventSource 无法携带
 * Authorization 头，因此用 fetch 手动读流并解析 SSE 帧。
 */
async function askAi(presetQuestion?: string) {
  if (aiStreaming.value) return
  const question = (presetQuestion !== undefined ? presetQuestion : aiInput.value).trim()
  if (presetQuestion === undefined && !question) return
  aiInput.value = ''

  chatHistory.value.push({ role: 'user', content: question || '请对该项目的整体学习情况做一次全面分析。' })
  chatHistory.value.push({ role: 'ai', content: '' })
  const msgIdx = chatHistory.value.length - 1
  aiStreaming.value = true
  scrollChat()

  abortCtrl = new AbortController()
  try {
    const params = new URLSearchParams({ projectId })
    if (question) params.set('question', question)

    const resp = await fetch(`/api/v1/ai-engine/admin/analysis-chat?${params.toString()}`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('EXAM_TOKEN') || '') },
      signal: abortCtrl.signal
    })
    if (!resp.ok || !resp.body) throw new Error(`HTTP ${resp.status}`)

    const reader = resp.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let sep
      while ((sep = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, sep)
        buffer = buffer.slice(sep + 2)
        const data = frame.split('\n')
            .map(l => l.replace(/\r$/, ''))
            .filter(l => l.startsWith('data:'))
            .map(l => l.replace(/^data: ?/, ''))
            .join('\n')
        if (data) {
          chatHistory.value[msgIdx].content += data
          scrollChat()
        }
      }
    }
  } catch (e) {
    if (!chatHistory.value[msgIdx].content) {
      chatHistory.value[msgIdx].content = 'AI 分析服务暂时不可用，请检查【系统设置】中的 AI 接口配置。'
    }
  } finally {
    aiStreaming.value = false
    scrollChat()
  }
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
