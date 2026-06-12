<template>
  <div class="min-h-screen bg-[#F7F9F4] flex flex-col font-sans">
    <!-- ===== 顶部状态栏 ===== -->
    <header class="sticky top-0 z-40 bg-white border-b-2 border-[#E5E5E5]">
      <div class="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-2xl bg-[#58CC02] flex items-center justify-center shadow-[0_3px_0_#46A302]">
            <i class="fas fa-feather-pointed text-white text-lg"></i>
          </div>
          <span class="text-xl font-extrabold text-[#58CC02] tracking-wide hidden sm:inline">QuestForge</span>
        </div>

        <div class="flex items-center gap-5">
          <!-- 宝石 -->
          <div class="flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform" @click="$router.push('/user/shop')">
            <i class="fas fa-gem text-[#1CB0F6] text-xl"></i>
            <span class="font-extrabold text-[#1CB0F6] text-lg">{{ profile.gems }}</span>
          </div>
          <!-- 今日学习状态 -->
          <div class="hidden sm:flex items-center gap-1.5" :title="profile.learnedToday ? '今天已学习!' : '今天还没学习哦'">
            <i class="fas fa-fire text-xl" :class="profile.learnedToday ? 'text-[#FF9600]' : 'text-gray-300'"></i>
          </div>
          <!-- 头像(虚拟形象渲染) -->
          <button class="rounded-full ring-2 ring-[#E5E5E5] hover:ring-[#58CC02] transition-all" @click="$router.push('/user/profile')">
            <AvatarRender :config="profile.avatarConfig" :size="40"/>
          </button>
        </div>
      </div>
    </header>

    <!-- ===== 页面主体 ===== -->
    <main class="flex-1 w-full max-w-3xl mx-auto px-4 pt-4 pb-28">
      <router-view/>
    </main>

    <!-- ===== 底部图标菜单 ===== -->
    <nav class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-[#E5E5E5]">
      <div class="max-w-3xl mx-auto grid grid-cols-5">
        <button v-for="item in menus" :key="item.path"
                @click="$router.push(item.path)"
                class="flex flex-col items-center justify-center py-2.5 gap-1 transition-colors relative"
                :class="isActive(item.path) ? item.activeClass : 'text-gray-400 hover:text-gray-600'">
          <div class="w-12 h-9 flex items-center justify-center rounded-xl"
               :class="isActive(item.path) ? item.activeBg : ''">
            <i :class="item.icon" class="text-xl"></i>
          </div>
          <span class="text-[11px] font-bold">{{ item.label }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AvatarRender from '@/components/AvatarRender.vue'
import { useProfileStore } from '@/store/profile'

const route = useRoute()
const profile = useProfileStore()

const menus = [
  { path: '/user/home', label: '主页', icon: 'fas fa-house', activeClass: 'text-[#58CC02]', activeBg: 'bg-[#E7F8D9]' },
  { path: '/user/tasks', label: '每日任务', icon: 'fas fa-list-check', activeClass: 'text-[#FF9600]', activeBg: 'bg-[#FFF0D9]' },
  { path: '/user/ai-teacher', label: 'AI教师', icon: 'fas fa-robot', activeClass: 'text-[#CE82FF]', activeBg: 'bg-[#F3E5FF]' },
  { path: '/user/shop', label: '宝石小店', icon: 'fas fa-store', activeClass: 'text-[#1CB0F6]', activeBg: 'bg-[#DDF4FF]' },
  { path: '/user/profile', label: '个人信息', icon: 'fas fa-user', activeClass: 'text-[#FF4B4B]', activeBg: 'bg-[#FFE3E3]' }
]

const isActive = (path: string) => route.path.startsWith(path)

onMounted(() => {
  if (!profile.loaded) profile.fetchProfile()
})
</script>
