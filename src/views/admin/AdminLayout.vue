<template>
  <div class="flex h-screen bg-gray-50 font-sans antialiased overflow-hidden">
    <!-- 原型级沉浸式侧边栏 -->
    <div class="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div class="p-6 pb-4 border-b border-gray-100 flex items-center space-x-3">
        <img src="@/assets/logo.png" alt="QuestForge" class="w-8 h-8 rounded-lg object-cover" />
        <span class="text-xl font-bold tracking-tight text-slate-800">QuestForge</span>
      </div>
      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <router-link to="/admin/dashboard" :class="getLinkClass('/admin/dashboard')">
          <i :class="getIconClass('/admin/dashboard', 'fa-table-columns')"></i><span>控制台首页</span>
        </router-link>
        <router-link to="/admin/question" :class="getLinkClass('/admin/question')">
          <i :class="getIconClass('/admin/question', 'fa-book-open')"></i><span>题库管理</span>
        </router-link>
        <router-link to="/admin/paper" :class="getLinkClass('/admin/paper', '/admin/analysis')">
          <i :class="getIconClass('/admin/paper', 'fa-file-lines')"></i><span>试卷与考试</span>
        </router-link>
        <router-link to="/admin/users" :class="getLinkClass('/admin/users')">
          <i :class="getIconClass('/admin/users', 'fa-users')"></i><span>用户管理</span>
        </router-link>
        <router-link to="/admin/daily-task" :class="getLinkClass('/admin/daily-task')">
          <i :class="getIconClass('/admin/daily-task', 'fa-list-check')"></i><span>每日任务</span>
        </router-link>
        <router-link to="/admin/shop" :class="getLinkClass('/admin/shop')">
          <i :class="getIconClass('/admin/shop', 'fa-store')"></i><span>宝石小店</span>
        </router-link>
        <router-link to="/admin/settings" :class="getLinkClass('/admin/settings')">
          <i :class="getIconClass('/admin/settings', 'fa-gear')"></i><span>系统设置</span>
        </router-link>
        <router-link to="/admin/announcement" :class="getLinkClass('/admin/announcement')">
          <i :class="getIconClass('/admin/announcement', 'fa-bullhorn')"></i><span>公告管理</span>
        </router-link>
      </nav>
    </div>

    <!-- 右侧主内容区 -->
    <div class="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
        <h2 class="text-lg font-bold text-gray-800">{{ route.meta.title || '管理后台' }}</h2>
        <div class="flex items-center space-x-5">
          <button class="relative text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fa-solid fa-bell text-xl"></i>
            <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div class="flex items-center space-x-2 border-l border-gray-200 pl-5">
            <div class="w-8 h-8 bg-gradient-to-tr from-blue-500 to-blue-700 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">A</div>
            <span class="text-sm font-medium text-gray-700 mr-2">Admin</span>
            <button @click="handleLogout" class="text-sm text-red-500 hover:text-red-700 font-bold" title="退出登录"><i class="fa-solid fa-power-off"></i></button>
          </div>
        </div>
      </header>

      <!-- 动态路由渲染区 -->
      <main class="flex-1 overflow-auto p-8 relative">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const getLinkClass = (path: string, alias?: string) => {
  const isActive = route.path.startsWith(path) || (alias && route.path.startsWith(alias))
  return `w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-colors ${
      isActive ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'
  }`
}

const getIconClass = (path: string, icon: string) => {
  const isActive = route.path.startsWith(path)
  return `fa-solid ${icon} w-5 text-center ${isActive ? 'text-blue-600' : 'text-gray-400'}`
}

const handleLogout = () => {
  userStore.clearUserInfo()
  router.replace('/login')
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>