<template>
  <div class="min-h-full bg-gray-50 flex flex-col absolute inset-0 overflow-y-auto font-sans antialiased">
    <header class="bg-white shadow-sm h-16 flex items-center px-8 shrink-0 z-10 sticky top-0">
      <button @click="router.push('/user/paper-list')" class="flex items-center text-gray-500 hover:text-blue-600 text-sm font-bold transition-colors">
        <i class="fa-solid fa-chevron-left mr-2"></i> 返回我的考试
      </button>
    </header>

    <main class="max-w-5xl mx-auto w-full py-10 px-6 flex-1">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 分数大字报 -->
        <div class="col-span-2 bg-white rounded-3xl p-10 border border-gray-100 shadow-md flex items-center justify-between relative overflow-hidden">
          <div class="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
          <div class="relative z-10" v-if="reportData.totalScore !== undefined">
            <span :class="`inline-block px-3 py-1 font-black rounded-lg text-sm mb-5 shadow-sm ${isPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`">
              {{ isPass ? '考核通过' : '未能及格' }}
            </span>
            <h2 class="text-2xl font-black text-gray-800 mb-6">成绩报告单</h2>
            <div class="flex items-baseline space-x-2">
              <span class="text-8xl font-black text-blue-600 tracking-tighter">{{ reportData.totalScore }}</span>
              <span class="text-2xl font-bold text-gray-400">分</span>
            </div>
            <p class="mt-6 text-gray-500 font-medium">您的成绩领先了同组 <strong>{{ reportData.beatPercentage }}</strong> 的考生</p>
          </div>
          <div class="relative flex items-center justify-center w-48 h-48 z-10">
            <i class="fa-solid fa-award text-9xl text-blue-100"></i>
            <span class="absolute text-3xl font-black text-blue-600">{{ isPass ? 'PASS' : 'FAIL' }}</span>
          </div>
        </div>

        <!-- 排行榜 -->
        <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-md flex flex-col h-[320px]">
          <h3 class="font-black text-gray-800 flex items-center mb-5">
            <i class="fa-solid fa-trophy text-amber-500 mr-2 text-xl"></i> 本次排行榜 Top 20
          </h3>
          <div class="flex-1 overflow-y-auto pr-2 space-y-2 no-scrollbar" v-loading="boardLoading">
            <el-empty v-if="!leaderboard.length" description="暂无榜单数据" :image-size="60" />
            <div v-for="user in leaderboard" :key="user.userId" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
              <div class="flex items-center space-x-3">
                <span :class="`w-6 text-center font-black text-base ${user.rank === 1 ? 'text-amber-500' : user.rank === 2 ? 'text-gray-400' : user.rank === 3 ? 'text-amber-700' : 'text-gray-300'}`">{{ user.rank }}</span>
                <span class="text-sm font-bold text-gray-700">{{ user.realName }}</span>
              </div>
              <span class="font-black text-gray-800">{{ user.score }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 错题解析 -->
      <div class="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden mt-8">
        <div class="px-8 py-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 class="font-black text-gray-800 text-lg">错题分析与私教诊断</h3>
        </div>
        <div class="p-8 space-y-8">
          <div v-if="!reportData.wrongQuestions?.length" class="text-center py-10 text-green-600 font-bold text-lg">
            🏆 完美作答，本次评测未发现错题记录！
          </div>

          <div v-for="(q, index) in reportData.wrongQuestions" :key="q.questionId" class="border-2 border-red-200 bg-red-50/30 rounded-2xl p-8 relative shadow-sm">
            <div class="absolute top-0 right-0 bg-red-500 text-white text-xs font-black px-4 py-1.5 rounded-bl-xl rounded-tr-xl shadow-sm">回答错误</div>
            <div class="flex mb-5">
              <span class="text-gray-500 font-black text-xl mr-3 mt-0.5">{{ index + 1 }}.</span>
              <h4 class="text-lg text-gray-900 font-bold leading-relaxed" v-html="q.content"></h4>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="p-4 rounded-xl border-2 border-red-300 bg-red-50 flex flex-col relative shadow-inner">
                <span class="text-xs text-red-400 font-bold mb-1">你的答案</span>
                <span class="font-bold text-red-700 text-lg">{{ q.userAnswer || '未作答' }}</span>
                <i class="fa-solid fa-xmark text-red-500 absolute right-5 top-1/2 -translate-y-1/2 text-2xl"></i>
              </div>
              <div class="p-4 rounded-xl border-2 border-green-300 bg-green-50 flex flex-col relative shadow-inner">
                <span class="text-xs text-green-500 font-bold mb-1">正确答案</span>
                <span class="font-bold text-green-700 text-lg">{{ q.standardAnswer }}</span>
                <i class="fa-solid fa-check text-green-500 absolute right-5 top-1/2 -translate-y-1/2 text-2xl"></i>
              </div>
            </div>

            <div class="ml-8 bg-blue-50/80 rounded-xl p-6 border border-blue-100 mb-4">
              <h5 class="font-black text-blue-800 mb-2 flex items-center"><i class="fa-solid fa-lightbulb mr-2 text-amber-500"></i> 通用解析</h5>
              <p class="text-sm text-blue-900 leading-relaxed font-medium">{{ q.analysis || '暂无详细录入。' }}</p>
            </div>

            <!-- AI 诊断挂载 -->
            <div class="ml-8">
              <AiChat :question-id="q.questionId" :wrong-answer="q.userAnswer" />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request'
import AiChat from '@/components/AiChat.vue'

const route = useRoute()
const router = useRouter()
const recordId = route.params.recordId

const reportData = ref<any>({})
const leaderboard = ref<any[]>([])
const boardLoading = ref(false)

const isPass = computed(() => (reportData.value.totalScore || 0) >= 60) // 假设60分及格

onMounted(() => {
  fetchReport()
  const paperId = route.query.paperId as string
  if (paperId) fetchLeaderboard(paperId)
})

const fetchReport = async () => {
  try { reportData.value = await request.get(`/exam/analysis/report/${recordId}`) as any } catch (e) { console.error(e) }
}

const fetchLeaderboard = async (paperId: string) => {
  boardLoading.value = true
  try { leaderboard.value = await request.get('/exam/analysis/leaderboard', { params: { paperId } }) as any } finally { boardLoading.value = false }
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>