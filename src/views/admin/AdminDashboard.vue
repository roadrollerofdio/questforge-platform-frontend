<template>
  <div class="space-y-6 max-w-6xl mx-auto animate-fade-in font-sans">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6" v-loading="loading">
      <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center hover:shadow-md transition-shadow relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
        <p class="text-sm font-bold text-gray-500 mb-1 z-10">题库资产总数</p>
        <div class="flex items-center justify-between z-10">
          <p class="text-3xl font-black text-gray-900">{{ summary.totalQuestions }}</p>
          <i class="fa-solid fa-layer-group text-2xl text-blue-500 opacity-80"></i>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center hover:shadow-md transition-shadow relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-20 h-20 bg-indigo-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
        <p class="text-sm font-bold text-gray-500 mb-1 z-10">累计考核试卷</p>
        <div class="flex items-center justify-between z-10">
          <p class="text-3xl font-black text-gray-900">{{ summary.totalPapers }}</p>
          <i class="fa-solid fa-file-lines text-2xl text-indigo-500 opacity-80"></i>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center hover:shadow-md transition-shadow relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-20 h-20 bg-emerald-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
        <p class="text-sm font-bold text-gray-500 mb-1 z-10">平台注册考生</p>
        <div class="flex items-center justify-between z-10">
          <p class="text-3xl font-black text-gray-900">{{ summary.activeUsers }}</p>
          <i class="fa-solid fa-users text-2xl text-emerald-500 opacity-80"></i>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center hover:shadow-md transition-shadow relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-20 h-20 bg-amber-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
        <p class="text-sm font-bold text-gray-500 mb-1 z-10">全网累积交卷</p>
        <div class="flex items-center justify-between z-10">
          <p class="text-3xl font-black text-gray-900">{{ summary.totalExams }}</p>
          <i class="fa-solid fa-cloud-arrow-up text-2xl text-amber-500 opacity-80"></i>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm col-span-2 flex flex-col">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="font-bold text-gray-800">系统公告与动态</h3>
          <button class="text-sm text-blue-600 hover:text-blue-800 font-bold">查看全部</button>
        </div>
        <div class="flex-1 flex flex-col justify-center p-0">
          <div class="px-6 py-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors">
            <div class="flex items-center space-x-3"><span class="w-2 h-2 rounded-full bg-blue-500"></span><span class="text-sm text-gray-700 font-bold">ExamPro v1.0 企业级在线考试系统已正式上线运行！</span></div>
            <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-medium">置顶</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div class="px-6 py-4 border-b border-gray-100">
          <h3 class="font-bold text-gray-800">快捷操作</h3>
        </div>
        <div class="p-4 grid grid-cols-2 gap-4">
          <button @click="$router.push('/admin/question')" class="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-100 hover:border-blue-200 group">
            <i class="fa-solid fa-file-circle-plus text-2xl mb-3 text-gray-400 group-hover:text-blue-500 transition-colors"></i>
            <span class="text-sm font-bold text-gray-600 group-hover:text-blue-600">录入试题</span>
          </button>
          <button @click="$router.push('/admin/paper')" class="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-100 hover:border-blue-200 group">
            <i class="fa-solid fa-file-lines text-2xl mb-3 text-gray-400 group-hover:text-blue-500 transition-colors"></i>
            <span class="text-sm font-bold text-gray-600 group-hover:text-blue-600">组卷发布</span>
          </button>
          <button @click="$router.push('/admin/users')" class="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-100 hover:border-blue-200 group">
            <i class="fa-solid fa-users text-2xl mb-3 text-gray-400 group-hover:text-blue-500 transition-colors"></i>
            <span class="text-sm font-bold text-gray-600 group-hover:text-blue-600">人员管理</span>
          </button>
          <button @click="$router.push('/admin/settings')" class="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-100 hover:border-blue-200 group">
            <i class="fa-solid fa-gear text-2xl mb-3 text-gray-400 group-hover:text-blue-500 transition-colors"></i>
            <span class="text-sm font-bold text-gray-600 group-hover:text-blue-600">全局设置</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

const loading = ref(false)
const summary = ref({ totalQuestions: 0, totalPapers: 0, totalExams: 0, activeUsers: 0 })

onMounted(async () => {
  loading.value = true
  try {
    summary.value = await request.get('/admin/analysis/dashboard-summary') as any
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>