<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <button @click="$router.push('/user/home')"
              class="w-10 h-10 rounded-2xl bg-white border-2 border-[#E5E5E5] border-b-4 flex items-center justify-center text-gray-400 hover:text-gray-600">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1 class="text-2xl font-extrabold text-gray-700">选择学习项目</h1>
    </div>

    <div v-loading="loading">
      <div v-if="!loading && projects.length === 0" class="text-center py-16">
        <div class="text-6xl mb-4">📭</div>
        <p class="text-gray-500 font-bold">暂时没有发布中的项目</p>
      </div>

      <div class="space-y-4">
        <button v-for="proj in projects" :key="proj.projectId"
                @click="selectProject(proj)"
                class="w-full bg-white rounded-2xl border-2 border-b-4 p-5 text-left transition-all hover:bg-[#F7F9F4]"
                :class="isCurrent(proj) ? 'border-[#58CC02]' : 'border-[#E5E5E5]'">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-[0_3px_0_rgba(0,0,0,0.15)]"
                   :class="proj.progressPercent >= 100 ? 'bg-[#FFC800]' : 'bg-[#1CB0F6]'">
                <span v-if="proj.progressPercent >= 100">🏆</span>
                <i v-else class="fas fa-flag text-white"></i>
              </div>
              <div>
                <div class="font-extrabold text-gray-700 text-lg leading-tight">{{ proj.title }}</div>
                <div class="text-xs font-bold text-gray-400 mt-0.5">
                  {{ proj.passedStages }} / {{ proj.totalStages }} 关已通过
                </div>
              </div>
            </div>
            <span v-if="isCurrent(proj)"
                  class="px-3 py-1 rounded-xl bg-[#E7F8D9] text-[#58CC02] text-xs font-extrabold whitespace-nowrap">
              进行中
            </span>
          </div>

          <!-- 进度条 -->
          <div class="h-4 bg-[#E5E5E5] rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500 relative"
                 :class="proj.progressPercent >= 100 ? 'bg-[#FFC800]' : 'bg-[#58CC02]'"
                 :style="{ width: Math.max(proj.progressPercent, proj.progressPercent > 0 ? 8 : 0) + '%' }">
              <div class="absolute inset-x-2 top-0.5 h-1 bg-white/40 rounded-full"></div>
            </div>
          </div>
          <div class="text-right text-xs font-extrabold text-gray-400 mt-1">{{ proj.progressPercent }}%</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const projects = ref<any[]>([])
const loading = ref(false)
const currentId = ref<string | null>(null)

const isCurrent = (proj: any) => currentId.value === proj.projectId

const selectProject = (proj: any) => {
  localStorage.setItem('CURRENT_PROJECT', JSON.stringify({ id: proj.projectId, title: proj.title }))
  ElMessage.success(`已切换到「${proj.title}」`)
  router.push('/user/home')
}

onMounted(async () => {
  const saved = localStorage.getItem('CURRENT_PROJECT')
  if (saved) {
    try { currentId.value = JSON.parse(saved).id } catch (e) { /* ignore */ }
  }
  try {
    loading.value = true
    const res: any = await request.get('/user/project/list-with-progress')
    projects.value = res || []
  } catch (e) {
    console.error('拉取项目列表失败', e)
  } finally {
    loading.value = false
  }
})
</script>
