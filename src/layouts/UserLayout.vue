<template>
  <div class="min-h-screen bg-[#F7F9F4] flex flex-col font-sans">
    <!-- ===== 顶部状态栏 ===== -->
    <header class="sticky top-0 z-40 bg-white border-b-2 border-[#E5E5E5]">
      <div class="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <img src="@/assets/logo.png" alt="QuestForge" class="w-10 h-10 rounded-2xl object-cover shadow-sm" />
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
      <div class="max-w-3xl mx-auto grid grid-cols-6">
        <button v-for="item in menus" :key="item.path"
                @click="$router.push(item.path)"
                class="flex flex-col items-center justify-center py-2.5 gap-1 transition-colors relative"
                :class="isActive(item.path) ? item.activeClass : 'text-gray-400 hover:text-gray-600'">
          <div class="w-12 h-9 flex items-center justify-center rounded-xl relative"
               :class="isActive(item.path) ? item.activeBg : ''">
            <i :class="item.icon" class="text-xl"></i>
            <span v-if="item.badge" class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF4B4B] text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white">
              {{ item.badge > 99 ? '99+' : item.badge }}
            </span>
          </div>
          <span class="text-[11px] font-bold">{{ item.label }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AvatarRender from '@/components/AvatarRender.vue'
import { useProfileStore } from '@/store/profile'
import request from '@/utils/request'

const route = useRoute()
const profile = useProfileStore()

// 未读消息数(公告+好友未读)
const unreadCount = ref(0)

const menus = computed(() => [
  { path: '/user/home', label: '主页', icon: 'fas fa-house', activeClass: 'text-[#58CC02]', activeBg: 'bg-[#E7F8D9]' },
  { path: '/user/tasks', label: '每日任务', icon: 'fas fa-list-check', activeClass: 'text-[#FF9600]', activeBg: 'bg-[#FFF0D9]' },
  { path: '/user/ai-teacher', label: 'AI教师', icon: 'fas fa-robot', activeClass: 'text-[#CE82FF]', activeBg: 'bg-[#F3E5FF]' },
  { path: '/user/messages', label: '消息', icon: 'fas fa-comments', activeClass: 'text-[#FF4B4B]', activeBg: 'bg-[#FFE3E3]', badge: unreadCount.value || undefined },
  { path: '/user/shop', label: '宝石小店', icon: 'fas fa-store', activeClass: 'text-[#1CB0F6]', activeBg: 'bg-[#DDF4FF]' },
  { path: '/user/profile', label: '我的', icon: 'fas fa-user', activeClass: 'text-[#FF9600]', activeBg: 'bg-[#FFF0D9]' }
])

const isActive = (path: string) => route.path.startsWith(path)

const fetchUnread = async () => {
  try {
    const res: any = await request.get('/user/message/overview')
    if (res) {
      const msg = res.unreadMessageCount || 0
      const ann = res.unreadAnnouncementCount || 0
      // 简单策略: 公告与私聊未读合并, 超过 99 显示 99+
      unreadCount.value = Math.min(99, msg + (ann > 0 ? 1 : 0))
    }
  } catch (e) { /* ignore */ }
}

onMounted(() => {
  if (!profile.loaded) profile.fetchProfile()
  fetchUnread()
  // 每 30 秒拉一次, 保持红点尽量新鲜
  setInterval(fetchUnread, 30000)
})
</script>
