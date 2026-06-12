<template>
  <div>
    <div class="flex items-center gap-3 mb-2">
      <div class="text-4xl">📋</div>
      <div>
        <h1 class="text-2xl font-extrabold text-gray-700">每日任务</h1>
        <p class="text-sm font-bold text-gray-400">{{ todayLabel }} · 完成任务赢宝石</p>
      </div>
    </div>

    <!-- 完成度概览 -->
    <div class="bg-white rounded-2xl border-2 border-[#E5E5E5] p-4 mb-6 flex items-center gap-4">
      <div class="flex-1">
        <div class="flex justify-between text-xs font-extrabold text-gray-400 mb-1.5">
          <span>今日完成度</span>
          <span>{{ completedCount }} / {{ tasks.length }}</span>
        </div>
        <div class="h-4 bg-[#E5E5E5] rounded-full overflow-hidden">
          <div class="h-full bg-[#FF9600] rounded-full transition-all duration-500"
               :style="{ width: tasks.length ? (completedCount / tasks.length * 100) + '%' : '0%' }"></div>
        </div>
      </div>
      <div class="text-3xl">{{ completedCount === tasks.length && tasks.length > 0 ? '🎊' : '💪' }}</div>
    </div>

    <div v-loading="loading">
      <div v-if="!loading && tasks.length === 0" class="text-center py-16">
        <div class="text-6xl mb-4">🌴</div>
        <p class="text-gray-500 font-bold">今日暂无任务, 休息一下吧</p>
      </div>

      <div class="space-y-4">
        <div v-for="task in tasks" :key="task.taskId"
             class="bg-white rounded-2xl border-2 border-b-4 p-5 transition-all"
             :class="task.isCompleted ? 'border-[#58CC02] bg-[#FBFFF7]' : 'border-[#E5E5E5]'">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                 :class="task.isCompleted ? 'bg-[#E7F8D9]' : 'bg-[#FFF0D9]'">
              {{ taskIcon(task.taskType) }}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <span class="font-extrabold text-gray-700">{{ task.title }}</span>
                <span class="flex items-center gap-1 text-sm font-extrabold shrink-0 ml-2"
                      :class="task.isCompleted ? 'text-[#58CC02]' : 'text-[#1CB0F6]'">
                  <i class="fas fa-gem"></i> +{{ task.gemReward }}
                </span>
              </div>

              <div class="flex items-center gap-3">
                <div class="flex-1 h-3 bg-[#E5E5E5] rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-500"
                       :class="task.isCompleted ? 'bg-[#58CC02]' : 'bg-[#FF9600]'"
                       :style="{ width: Math.min(task.progress / task.targetCount * 100, 100) + '%' }"></div>
                </div>
                <span class="text-xs font-extrabold" :class="task.isCompleted ? 'text-[#58CC02]' : 'text-gray-400'">
                  {{ task.isCompleted ? '已完成 ✓' : `${task.progress} / ${task.targetCount}` }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import request from '@/utils/request'

const tasks = ref<any[]>([])
const loading = ref(false)

const completedCount = computed(() => tasks.value.filter(t => t.isCompleted).length)
const todayLabel = computed(() => {
  const d = new Date()
  return `${d.getMonth() + 1}月${d.getDate()}日`
})

const taskIcon = (type: string) => {
  switch (type) {
    case 'STAGE_COMPLETE': return '🚩'
    case 'STAGE_PERFECT': return '💯'
    case 'ASK_AI': return '🤖'
    default: return '⭐'
  }
}

onMounted(async () => {
  try {
    loading.value = true
    const res: any = await request.get('/user/daily-task/today')
    tasks.value = res || []
  } catch (e) {
    console.error('拉取每日任务失败', e)
  } finally {
    loading.value = false
  }
})
</script>
