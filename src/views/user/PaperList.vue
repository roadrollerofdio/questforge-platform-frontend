<template>
  <div class="min-h-screen bg-[#050B14] text-gray-200 overflow-hidden relative font-sans">
    <!-- 背景特效 -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-30"></div>
      <div class="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px]"></div>
      <div class="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-800/20 rounded-full blur-[100px]"></div>
    </div>

    <!-- 顶部个人状态 HUD -->
    <header class="relative z-10 flex justify-between items-center p-6 border-b border-cyan-900/30 bg-black/40 backdrop-blur-md">
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 rounded-full border-2 border-cyan-500/50 flex items-center justify-center bg-cyan-900/30 overflow-hidden relative shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <i class="fas fa-user-astronaut text-cyan-400 text-xl z-10"></i>
          <div class="absolute bottom-0 w-full h-1/3 bg-cyan-500/20 animate-pulse"></div>
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-widest text-white uppercase">{{ userStore.userInfo.realName || userStore.userInfo.username }}</h1>
          <div class="text-xs text-cyan-400 font-mono mt-0.5 flex items-center">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            NEURAL LINK ACTIVE
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-6">
        <div class="text-right">
          <div class="text-[10px] text-gray-500 font-mono">GLOBAL RANKING</div>
          <div class="text-lg font-mono font-bold text-white tracking-wider"># 1,402</div>
        </div>
        <button @click="logout" class="px-4 py-2 border border-red-500/30 text-red-400 rounded hover:bg-red-900/30 transition-colors font-mono text-xs">
          <i class="fas fa-power-off mr-1"></i> DISCONNECT
        </button>
      </div>
    </header>

    <main class="relative z-10 p-8 md:p-12 h-[calc(100vh-89px)] overflow-y-auto">

      <div class="max-w-6xl mx-auto">
        <div class="mb-10">
          <h2 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 uppercase tracking-widest">Available Missions</h2>
          <p class="text-cyan-600/60 font-mono text-sm mt-2">选择一个考核行动以接入神经训练网络</p>
        </div>

        <div v-if="loading" class="flex flex-col items-center justify-center py-20">
          <div class="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(6,182,212,0.5)]"></div>
          <p class="text-cyan-400 font-mono tracking-widest text-sm animate-pulse">SCANNING SATELLITE DATA...</p>
        </div>

        <!-- 路线图/项目卡片区域 -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <div v-for="proj in projects" :key="proj.id"
               class="group relative bg-gray-900/40 border border-gray-700/50 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all duration-500">
            <!-- 卡片动态流光 -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none"></div>

            <div class="p-8">
              <div class="flex justify-between items-start mb-6">
                <div>
                  <div class="inline-block px-2 py-1 rounded bg-cyan-900/40 text-cyan-400 text-[10px] font-mono border border-cyan-700/50 mb-3">MISSION ID: {{ proj.id }}</div>
                  <h3 class="text-2xl font-bold text-white tracking-wide group-hover:text-cyan-300 transition-colors">{{ proj.title }}</h3>
                </div>
                <!-- 状态指示灯 -->
                <div class="w-12 h-12 rounded-full border border-gray-600 flex items-center justify-center bg-black/50 group-hover:border-cyan-500 transition-colors">
                  <i class="fas fa-satellite-dish text-gray-400 group-hover:text-cyan-400 group-hover:animate-pulse"></i>
                </div>
              </div>

              <!-- 模拟关卡节点显示 (实际需对接后端获取该 project 下的 stage 进度) -->
              <div class="mt-8 relative">
                <div class="text-xs text-gray-500 font-mono mb-4">MISSION STAGES</div>
                <!-- 连接线 -->
                <div class="absolute top-[42px] left-6 right-6 h-[2px] bg-gray-700/50 z-0"></div>

                <div class="flex justify-between relative z-10">
                  <!-- 假设后端返回包含3个关卡的进度信息，此处前端写死3个节点用于样式呈现 -->

                  <!-- 节点 1：已完成 (金星/高亮) -->
                  <div class="flex flex-col items-center">
                    <div class="w-12 h-12 rounded-full bg-green-900/80 border-2 border-green-500 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)] mb-2 cursor-pointer hover:scale-110 transition-transform">
                      <i class="fas fa-check text-green-400"></i>
                    </div>
                    <span class="text-[10px] font-mono text-green-400">STAGE 1</span>
                  </div>

                  <!-- 节点 2：当前可挑战 (发光脉冲) -->
                  <div class="flex flex-col items-center">
                    <div @click="enterStage(proj.id, 2002)" class="w-12 h-12 rounded-full bg-cyan-900/60 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.6)] mb-2 cursor-pointer hover:scale-110 transition-transform relative">
                      <div class="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-50"></div>
                      <i class="fas fa-play text-cyan-200 ml-1"></i>
                    </div>
                    <span class="text-[10px] font-mono text-cyan-300">STAGE 2</span>
                  </div>

                  <!-- 节点 3：锁定状态 -->
                  <div class="flex flex-col items-center opacity-50">
                    <div class="w-12 h-12 rounded-full bg-gray-900 border-2 border-gray-600 flex items-center justify-center mb-2 cursor-not-allowed">
                      <i class="fas fa-lock text-gray-500 text-sm"></i>
                    </div>
                    <span class="text-[10px] font-mono text-gray-500">STAGE 3</span>
                  </div>

                </div>
              </div>

              <!-- 底部操作与时效信息 -->
              <div class="mt-8 flex justify-between items-end border-t border-gray-700/50 pt-6">
                <div>
                  <div class="text-[10px] text-gray-500 font-mono mb-1">OPERATION WINDOW</div>
                  <div class="text-xs text-gray-400 font-mono">
                    {{ proj.endTime ? new Date(proj.endTime).toLocaleDateString() + ' CLOSE' : 'NO TIME LIMIT' }}
                  </div>
                </div>
                <!-- 虽然节点可以直接点，也可以提供一个主控按钮 -->
                <button class="px-6 py-2 bg-transparent border border-cyan-600 text-cyan-400 rounded hover:bg-cyan-900/40 transition-colors font-mono text-sm tracking-widest">
                  ACCESS
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import request from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const projects = ref<any[]>([])

onMounted(async () => {
  // 模拟请求延迟，展示科技感 Loading
  setTimeout(async () => {
    try {
      // 获取当前可参与的学习路线图
      // 后端应支持 user/project/list 接口，仅返回已发布状态的 project
      const res: any = await request.get('/admin/project/page', { params: { pageNo: 1, pageSize: 20 }})
      // 前端做一下简单过滤模拟
      projects.value = res.data.records.filter((p:any) => p.status === 1)
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }, 800)
})

const enterStage = (projectId: number, stageId: number) => {
  // 跳转到 ExamRoom，携带目标关卡 ID
  // 假设后端 stageId = 2002 是固定用来测试打通的
  router.push(`/exam/room/${stageId}`)
}

const logout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style>
/* 添加扫光动画 */
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>