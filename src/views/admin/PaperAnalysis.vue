<template>
  <div class="space-y-6 max-w-6xl mx-auto animate-fade-in font-sans">
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <button @click="$router.push('/admin/paper')" class="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 mr-3 transition-colors"><i class="fa-solid fa-arrow-left"></i></button>
        <h2 class="text-2xl font-bold text-gray-800">考试数据分析大盘</h2>
      </div>
      <div v-if="statData" :class="`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${statData.paperStatus === 1 ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-700'}`">
        <i :class="`fa-solid ${statData.paperStatus === 1 ? 'fa-spinner fa-spin' : 'fa-check'} mr-2`"></i>
        {{ statData.paperStatus === 1 ? '考试正在进行中 (数据动态更新)' : '考试已结束 (最终数据)' }}
      </div>
    </div>

    <div v-loading="loading" v-if="statData">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
          <p class="text-gray-500 font-bold mb-2">已交卷人数</p><p class="text-4xl font-black text-blue-600">{{ statData.totalParticipants }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
          <p class="text-gray-500 font-bold mb-2">全员平均分</p><p class="text-4xl font-black text-indigo-600">{{ statData.averageScore }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
          <p class="text-gray-500 font-bold mb-2">最高分</p><p class="text-4xl font-black text-green-600">{{ statData.highestScore }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
          <p class="text-gray-500 font-bold mb-2">考核及格率</p><p class="text-4xl font-black text-amber-600">{{ statData.passRate }}</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <h4 class="font-bold text-gray-800 text-lg mb-6 border-l-4 border-blue-600 pl-3">全员分数段分布情况</h4>
        <div class="space-y-5 max-w-3xl mx-auto">
          <div v-for="(count, range) in statData.scoreDistribution" :key="range" class="flex items-center">
            <span class="w-24 text-right text-sm font-bold text-gray-700 mr-4">{{ range }} 分段</span>
            <div class="flex-1 bg-gray-100 h-6 rounded-full overflow-hidden relative shadow-inner">
              <div class="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000" :style="{ width: `${statData.totalParticipants ? (count / statData.totalParticipants * 100) : 0}%` }"></div>
            </div>
            <span class="w-16 text-sm font-bold text-gray-600 text-left ml-4">{{ count }} 人</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'

const route = useRoute()
const statData = ref<any>(null); const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try { statData.value = await request.get(`/admin/analysis/statistics/${route.params.paperId}`) as any } finally { loading.value = false }
})
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>