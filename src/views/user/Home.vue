<template>
  <div class="relative">
    <!-- ===== 项目选择框 ===== -->
    <button @click="$router.push('/user/projects')"
            class="w-full bg-white rounded-2xl border-2 border-[#E5E5E5] border-b-4 p-4 flex items-center justify-between hover:bg-[#F7F9F4] transition-colors mb-6">
      <div class="flex items-center gap-3 text-left">
        <div class="w-12 h-12 rounded-2xl bg-[#58CC02] flex items-center justify-center shadow-[0_3px_0_#46A302]">
          <i class="fas fa-map text-white text-xl"></i>
        </div>
        <div>
          <div class="text-xs font-bold text-gray-400 uppercase tracking-wider">当前项目</div>
          <div class="font-extrabold text-gray-700 text-lg leading-tight">
            {{ currentProject ? currentProject.title : '点击选择学习项目' }}
          </div>
        </div>
      </div>
      <i class="fas fa-chevron-right text-gray-300 text-lg"></i>
    </button>

    <!-- ===== 无项目提示 ===== -->
    <div v-if="!currentProject" class="text-center py-16">
      <div class="text-6xl mb-4 animate-bounce-slow">🗺️</div>
      <p class="text-gray-500 font-bold mb-4">还没有选择学习项目哦</p>
      <button @click="$router.push('/user/projects')"
              class="px-8 py-3 bg-[#58CC02] text-white font-extrabold rounded-2xl shadow-[0_4px_0_#46A302] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all">
        去选择项目
      </button>
    </div>

    <!-- ===== 线路图 ===== -->
    <div v-else class="relative min-h-[400px]" v-loading="loading">
      <!-- 两侧装饰动画 -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="absolute left-0 top-12 text-4xl animate-float-1">☁️</div>
        <div class="absolute right-2 top-40 text-3xl animate-float-2">🌟</div>
        <div class="absolute left-2 top-72 text-3xl animate-float-3">🎈</div>
        <div class="absolute right-0 top-[420px] text-4xl animate-float-1">☁️</div>
        <div class="absolute left-1 top-[540px] text-3xl animate-float-2">🦉</div>
        <div class="absolute right-3 top-[660px] text-3xl animate-float-3">🌈</div>
        <div class="absolute left-0 top-[800px] text-4xl animate-float-2">⭐</div>
        <div class="absolute right-1 top-[920px] text-3xl animate-float-1">🎉</div>
      </div>

      <div v-if="!loading && stages.length === 0" class="text-center py-16">
        <div class="text-5xl mb-3">🏗️</div>
        <p class="text-gray-500 font-bold">该项目还没有关卡, 等待管理员配置</p>
      </div>

      <!-- 蜿蜒关卡节点 -->
      <div class="relative z-10 flex flex-col items-center pt-4">
        <template v-for="(stage, index) in stages" :key="stage.stageId">
          <!-- 连接虚线 -->
          <div v-if="index > 0" class="h-8 border-l-4 border-dotted my-1"
               :class="stage.status > 0 ? 'border-[#58CC02]' : 'border-gray-300'"
               :style="{ transform: `translateX(${offset(index - 1) + (offset(index) - offset(index - 1)) / 2}px)` }"></div>

          <div class="relative" :style="{ transform: `translateX(${offset(index)}px)` }">
            <!-- 当前可挑战标识 -->
            <div v-if="isCurrent(stage)" class="absolute -top-9 left-1/2 -translate-x-1/2 bg-white border-2 border-[#E5E5E5] rounded-xl px-3 py-1 text-xs font-extrabold text-[#58CC02] whitespace-nowrap animate-bob shadow">
              开始
              <div class="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-[#E5E5E5] rotate-45"></div>
            </div>

            <button @click="handleStageClick(stage)"
                    class="w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all font-extrabold relative"
                    :class="nodeClass(stage)">
              <i :class="nodeIcon(stage)" class="text-2xl"></i>
            </button>

            <!-- 名称与得分 -->
            <div class="text-center mt-1.5 w-32 -ml-6">
              <div class="text-sm font-extrabold" :class="stage.status > 0 ? 'text-gray-700' : 'text-gray-400'">{{ stage.stageName }}</div>
              <div v-if="stage.status === 4" class="text-xs font-bold text-[#FF9600]">
                <i class="fas fa-star"></i> {{ stage.currentScore }} 分
              </div>
              <div v-else-if="stage.status === 5" class="text-xs font-bold text-[#FF4B4B]">未通关 · 点击重试</div>
              <div v-else-if="stage.status === 3" class="text-xs font-bold text-gray-400">判分中...</div>
            </div>
          </div>
        </template>

        <!-- 终点奖杯 -->
        <div v-if="stages.length > 0" class="mt-8 flex flex-col items-center"
             :style="{ transform: `translateX(${offset(stages.length)}px)` }">
          <div class="text-5xl" :class="allPassed ? 'animate-bounce-slow' : 'grayscale opacity-50'">🏆</div>
          <div class="text-xs font-extrabold mt-1" :class="allPassed ? 'text-[#FF9600]' : 'text-gray-400'">
            {{ allPassed ? '全部通关!' : '终点' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()

const currentProject = ref<{ id: string; title: string } | null>(null)
const stages = ref<any[]>([])
const loading = ref(false)

// 蜿蜒偏移: 0 → 右 → 0 → 左 → 0 循环
const AMPLITUDE = 90
const offset = (index: number) => {
  const pattern = [0, 1, 1.6, 1, 0, -1, -1.6, -1]
  return pattern[index % pattern.length] * (AMPLITUDE / 1.6)
}

const allPassed = computed(() => stages.value.length > 0 && stages.value.every(s => s.status === 4))

const isCurrent = (stage: any) => {
  // 第一个可挑战(已解锁/进行中/失败可重试)的关卡
  const firstActive = stages.value.find(s => s.status === 1 || s.status === 2 || s.status === 5)
  return firstActive && firstActive.stageId === stage.stageId
}

const nodeClass = (stage: any) => {
  switch (stage.status) {
    case 4: return 'bg-[#FFC800] text-white shadow-[0_6px_0_#E6A800] hover:brightness-105 cursor-default'
    case 5: return 'bg-[#FF4B4B] text-white shadow-[0_6px_0_#CC3B3B] hover:brightness-110 active:translate-y-1 active:shadow-[0_2px_0_#CC3B3B]'
    case 3: return 'bg-[#CE82FF] text-white shadow-[0_6px_0_#A767CC] cursor-wait'
    case 1:
    case 2: return 'bg-[#58CC02] text-white shadow-[0_6px_0_#46A302] hover:brightness-105 active:translate-y-1 active:shadow-[0_2px_0_#46A302] ring-4 ring-[#58CC02]/30'
    default: return 'bg-[#E5E5E5] text-gray-400 shadow-[0_6px_0_#CCCCCC] cursor-not-allowed'
  }
}

const nodeIcon = (stage: any) => {
  switch (stage.status) {
    case 4: return 'fas fa-check'
    case 5: return 'fas fa-rotate-right'
    case 3: return 'fas fa-hourglass-half'
    case 1:
    case 2: return stage.stageType === 1 ? 'fas fa-book-open' : 'fas fa-star'
    default: return 'fas fa-lock'
  }
}

const handleStageClick = (stage: any) => {
  if (stage.status === 0) {
    ElMessage.warning('先完成前面的关卡才能解锁哦!')
    return
  }
  if (stage.status === 3) {
    ElMessage.info('该关卡正在判分中, 稍后再来看结果吧')
    return
  }
  if (stage.status === 4) {
    router.push(`/user/stage-detail/${stage.stageId}`)
    return
  }
  router.push(`/exam/room/${stage.stageId}`)
}

const loadPath = async () => {
  if (!currentProject.value) return
  try {
    loading.value = true
    const res: any = await request.get(`/user/stage/path/${currentProject.value.id}`)
    stages.value = res || []
  } catch (e) {
    console.error('拉取线路图失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const saved = localStorage.getItem('CURRENT_PROJECT')
  if (saved) {
    try {
      currentProject.value = JSON.parse(saved)
    } catch (e) { /* ignore */ }
  }
  loadPath()
})
</script>

<style scoped>
@keyframes float1 {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
@keyframes float2 {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(8deg); }
}
@keyframes float3 {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}
@keyframes bob {
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, -5px); }
}
.animate-float-1 { animation: float1 4s ease-in-out infinite; }
.animate-float-2 { animation: float2 5s ease-in-out infinite; }
.animate-float-3 { animation: float3 6s ease-in-out infinite; }
.animate-bob { animation: bob 1.2s ease-in-out infinite; }
.animate-bounce-slow { animation: float3 2s ease-in-out infinite; }
</style>
