<template>
  <div class="min-h-screen bg-[#F7F9F4] font-sans">
    <!-- ===== 顶部栏 ===== -->
    <header class="sticky top-0 z-30 bg-[#F7F9F4]/90 backdrop-blur px-4 py-3 border-b-2 border-[#E5E5E5]">
      <div class="max-w-2xl mx-auto flex items-center gap-3">
        <button @click="goBack"
                class="w-10 h-10 rounded-2xl bg-white border-2 border-[#E5E5E5] border-b-4 flex items-center justify-center text-gray-400 hover:text-gray-600">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-bold text-gray-400 uppercase tracking-wider">关卡详情</div>
          <div class="font-extrabold text-gray-700 text-lg leading-tight truncate">
            {{ stageName || '加载中...' }}
          </div>
        </div>
        <span v-if="loaded" class="px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap"
              :class="passed ? 'bg-[#E7F8D9] text-[#58CC02]' : 'bg-[#FFE5E5] text-[#FF4B4B]'">
          {{ passed ? '已通关' : '未通关' }}
        </span>
      </div>
    </header>

    <!-- ===== 加载中 ===== -->
    <div v-if="loading" v-loading="true" class="h-[60vh]"></div>

    <template v-else-if="loaded">
      <!-- ===== 成绩卡片 ===== -->
      <section class="max-w-2xl mx-auto px-4 pt-4">
        <div class="bg-gradient-to-br from-[#E7F8D9] to-[#DDF4FF] rounded-3xl border-2 border-[#58CC02] border-b-4 p-5">
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 rounded-3xl bg-white shadow flex flex-col items-center justify-center">
              <div class="text-3xl font-black" :class="passed ? 'text-[#58CC02]' : 'text-[#FF4B4B]'">{{ score }}</div>
              <div class="text-[10px] font-bold text-gray-400 mt-0.5">/ {{ totalScore }} 分</div>
            </div>
            <div class="flex-1 grid grid-cols-2 gap-3">
              <div class="bg-white/70 rounded-2xl p-2.5 text-center">
                <div class="text-lg font-extrabold text-[#58CC02]">{{ correctCount }}</div>
                <div class="text-[11px] font-bold text-gray-400">答对</div>
              </div>
              <div class="bg-white/70 rounded-2xl p-2.5 text-center">
                <div class="text-lg font-extrabold text-[#FF4B4B]">{{ wrongCount }}</div>
                <div class="text-[11px] font-bold text-gray-400">答错</div>
              </div>
              <div v-if="gemsEarned > 0" class="col-span-2 bg-white/70 rounded-2xl p-2 flex items-center justify-center gap-2">
                <i class="fas fa-gem text-[#1CB0F6]"></i>
                <span class="font-extrabold text-gray-700 text-sm">获得 {{ gemsEarned }} 宝石</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== Tab 切换 ===== -->
      <section class="max-w-2xl mx-auto px-4 mt-5">
        <div class="bg-white rounded-2xl border-2 border-[#E5E5E5] p-1 flex">
          <button v-for="t in tabs" :key="t.key"
                  @click="activeTab = t.key"
                  class="flex-1 py-2.5 rounded-xl font-extrabold text-sm transition-all"
                  :class="activeTab === t.key
                    ? 'bg-[#58CC02] text-white shadow-[0_3px_0_#46A302]'
                    : 'text-gray-400 hover:bg-[#F7F9F4]'">
            <i :class="t.icon" class="mr-1.5"></i>{{ t.label }}
            <span v-if="t.badge" class="ml-1 text-xs">({{ t.badge }})</span>
          </button>
        </div>
      </section>

      <!-- ===== 排行榜 Tab ===== -->
      <section v-if="activeTab === 'leaderboard'" class="max-w-2xl mx-auto px-4 py-5">
        <div class="bg-white rounded-3xl border-2 border-[#E5E5E5] p-5">
          <h2 class="font-extrabold text-gray-700 text-lg mb-4 flex items-center gap-2">
            <i class="fas fa-trophy text-[#FFC800]"></i> 项目排行榜
          </h2>

          <div v-if="!leaderboard.length" class="text-center text-gray-400 font-bold py-8">
            暂时还没有人上榜
          </div>

          <div v-for="row in leaderboard" :key="row.userId"
               class="flex items-center gap-3 py-2.5 px-2 rounded-2xl"
               :class="row.isSelf ? 'bg-[#E7F8D9]' : ''">
            <div class="w-8 text-center font-extrabold"
                 :class="row.rank <= 3 ? 'text-xl' : 'text-gray-400'">
              <span v-if="row.rank === 1">🥇</span>
              <span v-else-if="row.rank === 2">🥈</span>
              <span v-else-if="row.rank === 3">🥉</span>
              <span v-else>{{ row.rank }}</span>
            </div>
            <AvatarRender :config="row.avatarConfig" :size="40" />
            <div class="flex-1 min-w-0">
              <div class="font-extrabold text-gray-700 truncate">
                {{ row.nickname }} <span v-if="row.isSelf" class="text-xs text-[#58CC02]">(我)</span>
              </div>
              <div class="text-xs font-bold text-gray-400">{{ row.score }} 分</div>
            </div>
            <button v-if="!row.isSelf"
                    @click="sendFriendRequest(row)"
                    :disabled="requestedIds.has(row.userId)"
                    class="px-3 py-1.5 rounded-xl text-xs font-extrabold border-2 border-b-4 transition-all"
                    :class="requestedIds.has(row.userId)
                      ? 'border-[#E5E5E5] text-gray-300 cursor-not-allowed'
                      : 'border-[#1CB0F6] text-[#1CB0F6] hover:bg-[#DDF4FF] active:border-b-2 active:translate-y-0.5'">
              <i class="fas fa-user-plus mr-1"></i>{{ requestedIds.has(row.userId) ? '已申请' : '加好友' }}
            </button>
          </div>
        </div>
      </section>

      <!-- ===== 错题精讲 Tab ===== -->
      <section v-else-if="activeTab === 'wrong'" class="max-w-2xl mx-auto px-4 py-5 space-y-4">
        <div v-if="!wrongList.length"
             class="bg-white rounded-3xl border-2 border-[#E5E5E5] p-8 text-center">
          <div class="text-6xl mb-3">🏆</div>
          <p class="font-extrabold text-[#58CC02] text-lg">完美作答, 没有错题!</p>
          <p class="text-gray-400 font-bold mt-1">继续保持这股势头 ✨</p>
        </div>

        <div v-for="(q, idx) in wrongList" :key="q.questionId"
             class="bg-white rounded-3xl border-2 border-[#E5E5E5] overflow-hidden">
          <!-- 题干 -->
          <div class="p-5">
            <div class="flex items-start gap-3 mb-3">
              <span class="w-8 h-8 shrink-0 rounded-xl bg-[#FFE5E5] text-[#FF4B4B] flex items-center justify-center font-extrabold text-sm">
                {{ idx + 1 }}
              </span>
              <h3 class="text-base font-extrabold text-gray-700 leading-relaxed flex-1">
                {{ q.content }}
              </h3>
            </div>

            <!-- 答案对比 -->
            <div class="grid grid-cols-2 gap-3 mb-3">
              <div class="p-3 rounded-2xl border-2 border-[#FF4B4B] bg-[#FFF5F5]">
                <div class="text-[11px] font-bold text-[#FF4B4B] mb-1">你的答案</div>
                <div class="font-extrabold text-[#FF4B4B] text-sm break-all">{{ q.userAnswer || '未作答' }}</div>
              </div>
              <div class="p-3 rounded-2xl border-2 border-[#58CC02] bg-[#F0FBE5]">
                <div class="text-[11px] font-bold text-[#58CC02] mb-1">正确答案</div>
                <div class="font-extrabold text-[#58CC02] text-sm break-all">{{ q.standardAnswer || '-' }}</div>
              </div>
            </div>

            <!-- 官方解析 -->
            <div v-if="q.analysis" class="bg-[#DDF4FF] rounded-2xl p-3 border border-[#1CB0F6]/30">
              <div class="text-[11px] font-extrabold text-[#1899D6] mb-1 flex items-center gap-1">
                <i class="fas fa-lightbulb text-[#FF9600]"></i> 官方解析
              </div>
              <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{{ q.analysis }}</p>
            </div>
          </div>

          <!-- AI 私教 -->
          <div class="border-t-2 border-[#E5E5E5] bg-[#F7F9F4] p-4">
            <div v-if="!aiState[q.questionId]" class="text-center">
              <button @click="summonAiTutor(q)"
                      class="px-5 py-2.5 rounded-2xl font-extrabold text-sm border-2 border-b-4 border-[#CE82FF] text-[#CE82FF] bg-white hover:bg-[#F3E5FF] active:border-b-2 active:translate-y-0.5 transition-all">
                <i class="fas fa-robot mr-1.5"></i>召唤 AI 私教
              </button>
            </div>
            <div v-else class="bg-white rounded-2xl border-2 border-[#CE82FF]/30 p-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 rounded-full bg-[#F3E5FF] flex items-center justify-center">🤖</div>
                <div class="font-extrabold text-[#CE82FF] text-sm">AI 私教</div>
                <div v-if="aiState[q.questionId].streaming" class="flex gap-1 ml-auto">
                  <span class="w-1.5 h-1.5 bg-[#CE82FF] rounded-full animate-bounce"></span>
                  <span class="w-1.5 h-1.5 bg-[#CE82FF] rounded-full animate-bounce" style="animation-delay: 0.15s"></span>
                  <span class="w-1.5 h-1.5 bg-[#CE82FF] rounded-full animate-bounce" style="animation-delay: 0.3s"></span>
                </div>
              </div>
              <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[2.5em]">
                {{ aiState[q.questionId].content || (aiState[q.questionId].streaming ? '正在思考...' : ' ') }}
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- ===== 错误状态 ===== -->
    <div v-else-if="errMsg" class="max-w-2xl mx-auto px-4 py-16 text-center">
      <div class="text-6xl mb-3">😢</div>
      <p class="text-gray-500 font-bold">{{ errMsg }}</p>
      <button @click="goBack"
              class="mt-4 px-6 py-2.5 rounded-2xl font-extrabold text-white bg-[#58CC02] shadow-[0_3px_0_#46A302]">
        返回学习地图
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import AvatarRender from '@/components/AvatarRender.vue'
import { streamSse } from '@/utils/sse'

const route = useRoute()
const router = useRouter()
const stageId = route.params.stageId as string

const loading = ref(true)
const loaded = ref(false)
const errMsg = ref('')

// 基础数据
const stageName = ref('')
const projectId = ref('')
const progressId = ref('')
const score = ref(0)
const totalScore = ref(0)
const correctCount = ref(0)
const wrongCount = ref(0)
const gemsEarned = ref(0)
const passed = ref(false)
const leaderboard = ref<any[]>([])
const wrongList = ref<any[]>([])
const requestedIds = ref(new Set<string>())

// Tab
const activeTab = ref<'leaderboard' | 'wrong'>('leaderboard')
const tabs = computed(() => [
  { key: 'leaderboard', label: '排行榜', icon: 'fas fa-trophy', badge: 0 },
  { key: 'wrong', label: '错题精讲', icon: 'fas fa-book-open', badge: wrongList.value.length }
])

// AI 私教: 每个错题一份独立状态
interface AiState { streaming: boolean; content: string }
const aiState = reactive<Record<string, AiState>>({})
const aiAborters: Record<string, AbortController> = {}

/**
 * 1) 拉取路线图, 找到当前 stage 对应的 progressId
 * 2) 拉取 result 与 wrong-questions
 */
onMounted(async () => {
  try {
    const saved = localStorage.getItem('CURRENT_PROJECT')
    if (!saved) {
      errMsg.value = '未找到当前学习项目, 请回到学习地图'
      loading.value = false
      return
    }
    const project = JSON.parse(saved)
    projectId.value = project.id

    // 步骤 1: 拿到 progressId
    const path: any[] = await request.get(`/user/stage/path/${project.id}`)
    const node = path.find(s => s.stageId === stageId)
    if (!node) {
      errMsg.value = '该关卡不存在'
      return
    }
    if (!node.progressId) {
      errMsg.value = '该关卡还没有挑战记录'
      return
    }
    progressId.value = node.progressId

    // 步骤 2: 并行拉取 result 与 wrong
    const [result, wrong] = await Promise.all([
      request.get(`/user/stage/result/${node.progressId}`),
      request.get(`/user/stage/${node.progressId}/wrong-questions`)
    ])

    stageName.value = result.stageName || wrong.stageName
    score.value = result.score || 0
    totalScore.value = result.totalScore || 0
    correctCount.value = result.correctCount || 0
    wrongCount.value = result.wrongCount || (wrong.wrongQuestions || []).length
    gemsEarned.value = result.gemsEarned || 0
    passed.value = !!result.passed
    leaderboard.value = result.leaderboard || []
    wrongList.value = wrong.wrongQuestions || []

    // 默认聚焦到错题精讲 (有错题时)
    if (wrongList.value.length > 0) activeTab.value = 'wrong'
    loaded.value = true
  } catch (e: any) {
    console.error('加载关卡详情失败', e)
    errMsg.value = e?.message || '加载关卡详情失败'
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  Object.values(aiAborters).forEach(c => c?.abort())
})

const sendFriendRequest = async (row: any) => {
  try {
    await request.post('/user/friend/request', { toUserId: row.userId })
    requestedIds.value.add(row.userId)
    requestedIds.value = new Set(requestedIds.value)
    ElMessage.success(`已向 ${row.nickname} 发送好友申请`)
  } catch (e) { /* 拦截器统一弹错 */ }
}

const summonAiTutor = (q: any) => {
  aiState[q.questionId] = { streaming: true, content: '' }
  const params = new URLSearchParams({
    questionId: q.questionId,
    wrongUserAnswer: q.userAnswer || ''
  })
  const url = `/api/v1/ai-engine/tutor/chat?${params.toString()}`
  aiAborters[q.questionId] = streamSse(url, {
    method: 'GET',
    onMessage: (chunk) => {
      aiState[q.questionId].content += chunk
    },
    onDone: () => { aiState[q.questionId].streaming = false },
    onError: () => {
      aiState[q.questionId].streaming = false
      if (!aiState[q.questionId].content) {
        aiState[q.questionId].content = 'AI 私教暂时离开了, 请稍后再试~'
      }
    }
  })
}

const goBack = () => router.replace('/user/home')
</script>

<style scoped>
.animate-bounce { animation: bounce 1.4s ease-in-out infinite; }
@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-5px); opacity: 1; }
}
</style>
