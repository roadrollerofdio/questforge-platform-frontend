<template>
  <div class="min-h-full bg-gray-50 flex flex-col absolute inset-0 overflow-y-auto font-sans antialiased">
    <header class="bg-white shadow-sm h-16 flex justify-between items-center px-8 shrink-0 z-10 sticky top-0">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <i class="fa-solid fa-award text-white text-lg"></i>
        </div>
        <span class="text-xl font-bold tracking-tight text-slate-800">ExamPro 学习平台</span>
      </div>
      <div class="flex items-center space-x-8">
        <button class="text-sm font-bold text-blue-600 border-b-2 border-blue-600 py-5">我的考试</button>
        <div class="flex items-center space-x-3 border-l border-gray-200 pl-8">
          <div class="w-9 h-9 bg-gray-200 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center bg-blue-100 text-blue-700 font-bold">
            {{ userStore.userInfo.realName?.charAt(0) || 'U' }}
          </div>
          <span class="text-sm font-bold text-gray-700 mr-4">{{ userStore.userInfo.realName }}</span>
          <button @click="handleLogout" class="text-sm text-red-500 hover:text-red-700 font-bold" title="退出登录"><i class="fa-solid fa-power-off"></i></button>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto w-full py-10 px-6 flex-1 animate-fade-in" v-loading="loading">
      <h2 class="text-2xl font-black text-gray-800 mb-8">我的考试任务</h2>

      <div class="flex space-x-8 border-b border-gray-200 mb-8">
        <button @click="activeTab = 'pending'" :class="`pb-4 text-base font-bold relative transition-colors ${activeTab === 'pending' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`">
          待参加考试 ({{ pendingPapers.length }})
          <span v-if="activeTab === 'pending'" class="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></span>
        </button>
        <button @click="activeTab = 'completed'" :class="`pb-4 text-base font-bold relative transition-colors ${activeTab === 'completed' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`">
          考试记录簿 ({{ completedRecords.length }})
          <span v-if="activeTab === 'completed'" class="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 待考列表 -->
        <template v-if="activeTab === 'pending'">
          <el-empty v-if="!pendingPapers.length" description="暂无待考任务" class="col-span-2" />
          <div v-for="paper in pendingPapers" :key="paper.paperId" class="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col relative">
            <div class="h-1.5 w-full bg-blue-500"></div>
            <div class="p-8 flex-1 flex flex-col">
              <div class="flex justify-between items-start mb-4">
                <span class="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-black rounded">必修考核</span>
                <div class="flex space-x-2">
                  <span v-if="!paper.allowQuit" class="text-[10px] bg-red-50 text-red-500 px-2 py-1 rounded border border-red-100 font-bold" title="禁止中途退出"><i class="fa-solid fa-person-walking-arrow-right"></i></span>
                  <span v-if="!paper.allowSwitchScreen" class="text-[10px] bg-red-50 text-red-500 px-2 py-1 rounded border border-red-100 font-bold" title="防切屏监控"><i class="fa-solid fa-desktop"></i></span>
                </div>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-4 leading-tight">{{ paper.title }}</h3>
              <div class="mt-auto space-y-3">
                <div class="text-xs text-gray-500 font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <!-- 统一使用 formatTime 处理日期防止数组崩溃 -->
                  <p class="mb-1"><i class="fa-solid fa-calendar-days mr-2"></i>开放: {{ formatTime(paper.examStartTime) }}</p>
                  <p><i class="fa-solid fa-hourglass-end mr-2 text-red-400"></i>截止: {{ formatTime(paper.examEndTime) }}</p>
                </div>
              </div>
            </div>
            <div class="px-8 py-5 bg-gray-50 border-t border-gray-100">
              <button v-if="paper.isStarted" @click="enterExam(paper)" class="w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 shadow-md transition-transform active:scale-[0.98]">进入考场 (限时{{paper.durationMins}}分)</button>
              <button v-else disabled class="w-full py-3 bg-gray-200 text-gray-500 font-bold rounded-xl text-sm cursor-not-allowed">未到开放时间</button>
            </div>
          </div>
        </template>

        <!-- 已完成列表 -->
        <template v-else>
          <el-empty v-if="!completedRecords.length" description="暂无考试记录" class="col-span-2" />
          <div v-for="record in completedRecords" :key="record.recordId || record.paperId" class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col relative transition-opacity group">
            <div :class="`h-1.5 w-full ${record.isMissed ? 'bg-red-400' : 'bg-gray-300'}`"></div>
            <!-- 右上角快捷操作栏 -->
            <div class="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" v-if="record.recordId">
              <button @click="toggleFav(record)" class="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:scale-110 transition-transform">
                <i :class="`fa-star text-lg ${record.isFavorited ? 'fa-solid text-amber-400' : 'fa-regular text-gray-400'}`"></i>
              </button>
              <button @click="deleteRecord(record.recordId)" class="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:scale-110 transition-transform">
                <i class="fa-solid fa-trash text-red-500"></i>
              </button>
            </div>

            <div class="p-8 flex-1 flex flex-col relative">
              <!-- 利用后端返回的动态 tag 控制颜色 -->
              <span :class="`px-3 py-1 text-xs font-black rounded w-fit mb-4 ${record.isMissed ? 'bg-red-100 text-red-700' : (record.tag === '强制收卷' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700')}`">
                  {{ record.tag || '已交卷' }}
              </span>
              <h3 class="text-xl font-bold text-gray-900 mb-2 leading-tight pr-16">{{ record.title }}</h3>
              <p class="text-sm text-gray-500 mb-6 font-medium">{{ record.isMissed ? '截止时间' : '交卷时间' }}: {{ formatTime(record.submitTime) }}</p>
              <div class="mt-auto border-t border-gray-100 pt-6">
                <span class="text-xs font-bold text-gray-400 block mb-1 uppercase">得分</span>
                <span :class="`text-4xl font-black ${record.isMissed ? 'text-red-500' : 'text-slate-800'}`">{{ record.totalScore }}<span class="text-lg font-bold text-gray-400 ml-1">/{{ record.paperScore }}</span></span>
              </div>
            </div>
            <div class="px-8 py-5 bg-gray-50 border-t border-gray-100">
              <button v-if="!record.isMissed" @click="$router.push(`/exam/report/${record.recordId}?paperId=${record.paperId}`)" class="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-100 transition-all">查看成绩与私教解析</button>
              <button v-else disabled class="w-full py-3 bg-gray-50 border border-gray-100 text-gray-400 font-bold rounded-xl text-sm cursor-not-allowed">无成绩单</button>
            </div>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import request from '@/utils/request'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref('pending'); const loading = ref(false)
const pendingPapers = ref<any[]>([]); const completedRecords = ref<any[]>([])

onMounted(() => fetchData())

const fetchData = async () => {
  loading.value = true
  try {
    pendingPapers.value = await request.get('/exam/paper/pending') as any || []
    completedRecords.value = await request.get('/exam/paper/completed') as any || []
  } finally { loading.value = false }
}

const formatTime = (time: any) => {
  if (!time) return '-'
  if (typeof time === 'string') return time.replace('T', ' ')
  if (Array.isArray(time)) {
    const pad = (n: number) => n < 10 ? '0' + n : n
    return `${time[0]}-${pad(time[1] || 1)}-${pad(time[2] || 1)} ${pad(time[3] || 0)}:${pad(time[4] || 0)}:${pad(time[5] || 0)}`
  }
  return String(time)
}

const enterExam = (paper: any) => {
  let warnMsg = '进入考场将开始倒计时。'
  if (!paper.allowQuit) warnMsg += '<br><b class="text-red-500">本场考试禁止中途退出，离开视为交卷！</b>'
  if (!paper.allowSwitchScreen) warnMsg += '<br><b class="text-red-500">本场考试开启防切屏监控，切屏立即交卷！</b>'

  ElMessageBox.confirm(warnMsg, '考前须知', { dangerouslyUseHTMLString: true, confirmButtonText: '我已准备好，开考', type: 'warning' })
      .then(() => router.push(`/exam/room/${paper.paperId}`)).catch(() => {})
}

const toggleFav = async (record: any) => {
  record.isFavorited = !record.isFavorited
  await request.put(`/exam/record/${record.recordId}/favorite?favorite=${record.isFavorited}`)
  ElMessage.success(record.isFavorited ? '已收藏到记录簿' : '已取消收藏')
}

const deleteRecord = (recordId: string) => {
  ElMessageBox.confirm('删除后此记录将不再显示，确定删除吗？', '提示').then(async () => {
    await request.delete(`/exam/record/${recordId}`)
    ElMessage.success('删除成功'); fetchData()
  }).catch(()=>{})
}

const handleLogout = () => { userStore.clearUserInfo(); router.replace('/login') }
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>