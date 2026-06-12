<template>
  <div class="min-h-screen bg-[#F7F9F4] font-sans">
    <!-- ===== 判分中 ===== -->
    <div v-if="polling" class="min-h-screen flex flex-col items-center justify-center">
      <div class="text-7xl animate-spin-slow mb-6">⏳</div>
      <h1 class="text-2xl font-extrabold text-gray-700 mb-2">正在结算...</h1>
      <p class="text-gray-400 font-bold">AI 判分引擎全力运转中</p>
    </div>

    <!-- ===== 结算结果 ===== -->
    <div v-else class="max-w-2xl mx-auto px-4 py-8 pb-20">
      <!-- 顶部结果横幅 -->
      <div class="text-center mb-8">
        <div class="text-8xl mb-4" :class="result.passed ? 'animate-bounce-slow' : ''">
          {{ result.passed ? '🎉' : '😢' }}
        </div>
        <h1 class="text-3xl font-extrabold mb-1" :class="result.passed ? 'text-[#58CC02]' : 'text-[#FF4B4B]'">
          {{ result.passed ? '通关成功!' : '差一点点...' }}
        </h1>
        <p class="text-gray-500 font-bold">{{ result.stageName }}</p>
      </div>

      <!-- 数据卡片 -->
      <div class="grid grid-cols-3 gap-3 mb-6">
        <div class="bg-white rounded-2xl border-2 border-b-4 border-[#FFC800] p-4 text-center">
          <div class="text-2xl font-extrabold text-[#FF9600]">{{ result.score }}</div>
          <div class="text-xs font-bold text-gray-400 mt-1">得分 / {{ result.totalScore }}</div>
        </div>
        <div class="bg-white rounded-2xl border-2 border-b-4 border-[#58CC02] p-4 text-center">
          <div class="text-2xl font-extrabold text-[#58CC02]">{{ result.correctCount }}</div>
          <div class="text-xs font-bold text-gray-400 mt-1">答对题数</div>
        </div>
        <div class="bg-white rounded-2xl border-2 border-b-4 border-[#FF4B4B] p-4 text-center">
          <div class="text-2xl font-extrabold text-[#FF4B4B]">{{ result.wrongCount }}</div>
          <div class="text-xs font-bold text-gray-400 mt-1">答错题数</div>
        </div>
      </div>

      <!-- 宝石奖励 -->
      <div v-if="result.gemsEarned > 0"
           class="bg-gradient-to-r from-[#DDF4FF] to-[#E7F8D9] rounded-2xl border-2 border-[#1CB0F6] p-5 flex items-center justify-center gap-3 mb-8 animate-pop-in">
        <i class="fas fa-gem text-[#1CB0F6] text-3xl animate-bounce-slow"></i>
        <span class="text-xl font-extrabold text-[#1899D6]">获得 {{ result.gemsEarned }} 宝石!</span>
      </div>

      <!-- ===== 排行榜 ===== -->
      <div class="bg-white rounded-3xl border-2 border-[#E5E5E5] p-5 mb-8">
        <h2 class="font-extrabold text-gray-700 text-lg mb-4 flex items-center gap-2">
          <i class="fas fa-trophy text-[#FFC800]"></i> 项目排行榜
        </h2>

        <div v-if="result.leaderboard?.length === 0" class="text-center text-gray-400 font-bold py-6">
          暂时还没有人上榜
        </div>

        <div v-for="row in result.leaderboard" :key="row.userId"
             class="flex items-center gap-3 py-2.5 px-2 rounded-2xl"
             :class="row.isSelf ? 'bg-[#E7F8D9]' : ''">
          <!-- 名次 -->
          <div class="w-8 text-center font-extrabold"
               :class="row.rank <= 3 ? 'text-xl' : 'text-gray-400'">
            <span v-if="row.rank === 1">🥇</span>
            <span v-else-if="row.rank === 2">🥈</span>
            <span v-else-if="row.rank === 3">🥉</span>
            <span v-else>{{ row.rank }}</span>
          </div>
          <AvatarRender :config="row.avatarConfig" :size="40"/>
          <div class="flex-1 min-w-0">
            <div class="font-extrabold text-gray-700 truncate">
              {{ row.nickname }} <span v-if="row.isSelf" class="text-xs text-[#58CC02]">(我)</span>
            </div>
            <div class="text-xs font-bold text-gray-400">{{ row.score }} 分</div>
          </div>
          <!-- 加好友 -->
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

      <!-- 操作按钮 -->
      <div class="flex gap-3">
        <button @click="goHome"
                class="flex-1 py-3.5 rounded-2xl font-extrabold text-white bg-[#58CC02] shadow-[0_4px_0_#46A302] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all">
          继续学习
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import AvatarRender from '@/components/AvatarRender.vue'
import { useProfileStore } from '@/store/profile'

const route = useRoute()
const router = useRouter()
const profile = useProfileStore()
const progressId = route.params.progressId as string

const polling = ref(true)
const result = ref<any>({ leaderboard: [] })
const requestedIds = ref(new Set<string>())
let pollTimer: any = null
let pollCount = 0

const poll = async () => {
  try {
    const res: any = await request.get(`/user/stage/result/${progressId}`)
    if (res.status === 3) {
      pollCount++
      if (pollCount > 30) {
        clearInterval(pollTimer)
        ElMessage.warning('结算时间较长, 请稍后在主页查看结果')
        router.replace('/user/home')
      }
      return
    }
    clearInterval(pollTimer)
    result.value = res
    polling.value = false
    // 刷新状态栏宝石余额
    profile.fetchProfile()
  } catch (e) {
    clearInterval(pollTimer)
    console.error('拉取结算数据失败', e)
    router.replace('/user/home')
  }
}

const sendFriendRequest = async (row: any) => {
  try {
    await request.post('/user/friend/request', { toUserId: row.userId })
    requestedIds.value.add(row.userId)
    requestedIds.value = new Set(requestedIds.value)
    ElMessage.success(`已向 ${row.nickname} 发送好友申请`)
  } catch (e) { /* 错误消息由拦截器统一弹出 */ }
}

const goHome = () => router.replace('/user/home')

onMounted(() => {
  poll()
  pollTimer = setInterval(poll, 2000)
})
onUnmounted(() => { if (pollTimer) clearInterval(pollTimer) })
</script>

<style scoped>
@keyframes spinSlow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow { animation: spinSlow 2.5s linear infinite; }

@keyframes bounceSlow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
.animate-bounce-slow { animation: bounceSlow 1.6s ease-in-out infinite; }

@keyframes popIn {
  0% { transform: scale(0.6); opacity: 0; }
  70% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}
.animate-pop-in { animation: popIn 0.5s ease-out; }
</style>
