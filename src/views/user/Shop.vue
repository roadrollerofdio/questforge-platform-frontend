<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="text-4xl">🏪</div>
        <div>
          <h1 class="text-2xl font-extrabold text-gray-700">宝石小店</h1>
          <p class="text-sm font-bold text-gray-400">用宝石装扮你的形象</p>
        </div>
      </div>
      <div class="flex items-center gap-2 bg-white rounded-2xl border-2 border-[#E5E5E5] px-4 py-2">
        <i class="fas fa-gem text-[#1CB0F6] text-lg"></i>
        <span class="font-extrabold text-[#1CB0F6] text-lg">{{ profile.gems }}</span>
      </div>
    </div>

    <!-- 部位筛选 -->
    <div class="flex gap-2 mb-5 overflow-x-auto pb-1">
      <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
              class="px-4 py-2 rounded-2xl text-sm font-extrabold whitespace-nowrap border-2 border-b-4 transition-all"
              :class="activeTab === tab.key
                ? 'bg-[#1CB0F6] border-[#1899D6] text-white'
                : 'bg-white border-[#E5E5E5] text-gray-500 hover:bg-[#F7F9F4]'">
        {{ tab.label }}
      </button>
    </div>

    <div v-loading="loading">
      <div v-if="!loading && filteredItems.length === 0" class="text-center py-16">
        <div class="text-6xl mb-4">🛒</div>
        <p class="text-gray-500 font-bold">这个分类暂时没有商品</p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div v-for="item in filteredItems" :key="item.itemId"
             class="bg-white rounded-3xl border-2 border-b-4 p-4 flex flex-col items-center transition-all"
             :class="item.owned ? 'border-[#58CC02]' : 'border-[#E5E5E5]'">
          <!-- 装扮预览: 默认形象 + 该装扮 -->
          <AvatarRender :config="previewConfig(item)" :size="110" :rounded="false"/>
          <div class="font-extrabold text-gray-700 mt-2 text-center">{{ item.name }}</div>
          <div class="text-xs font-bold text-gray-400 mb-3">{{ slotLabel(item.slot) }}</div>

          <button v-if="item.owned"
                  class="w-full py-2 rounded-2xl font-extrabold text-sm text-[#58CC02] bg-[#E7F8D9] cursor-default">
            <i class="fas fa-check mr-1"></i>已拥有
          </button>
          <button v-else @click="buy(item)"
                  :disabled="profile.gems < item.price || buying"
                  class="w-full py-2 rounded-2xl font-extrabold text-sm transition-all border-b-4 active:border-b-0 active:translate-y-1"
                  :class="profile.gems >= item.price
                    ? 'bg-[#1CB0F6] border-[#1899D6] text-white hover:brightness-105'
                    : 'bg-[#E5E5E5] border-[#CCCCCC] text-gray-400 cursor-not-allowed'">
            <i class="fas fa-gem mr-1"></i>{{ item.price }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import AvatarRender from '@/components/AvatarRender.vue'
import { useProfileStore } from '@/store/profile'
import { DEFAULT_AVATAR, SLOT_LABELS, parseAvatarConfig } from '@/avatar/parts'

const profile = useProfileStore()
const items = ref<any[]>([])
const loading = ref(false)
const buying = ref(false)
const activeTab = ref('all')

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'hat', label: '帽子' },
  { key: 'glasses', label: '眼镜' },
  { key: 'outfit', label: '服饰' },
  { key: 'background', label: '背景' }
]

const filteredItems = computed(() =>
    activeTab.value === 'all' ? items.value : items.value.filter(i => i.slot === activeTab.value))

const slotLabel = (slot: string) => SLOT_LABELS[slot] || slot

// 用当前形象做底, 叠加该商品装扮预览
const previewConfig = (item: any) => {
  const base = profile.avatarConfig ? parseAvatarConfig(profile.avatarConfig) : { ...DEFAULT_AVATAR }
  return { ...base, [item.slot]: item.svgKey }
}

const loadItems = async () => {
  try {
    loading.value = true
    const res: any = await request.get('/user/shop/items')
    items.value = res || []
  } catch (e) {
    console.error('拉取商品失败', e)
  } finally {
    loading.value = false
  }
}

const buy = async (item: any) => {
  try {
    await ElMessageBox.confirm(`花费 ${item.price} 宝石购买「${item.name}」?`, '确认购买', {
      confirmButtonText: '买!', cancelButtonText: '再想想'
    })
  } catch (e) {
    return
  }

  try {
    buying.value = true
    await request.post('/user/shop/buy', { itemId: item.itemId })
    ElMessage.success(`「${item.name}」已入手, 快去个人信息页穿戴吧!`)
    item.owned = true
    profile.fetchProfile()
  } catch (e) { /* 错误消息由拦截器统一弹出 */ } finally {
    buying.value = false
  }
}

onMounted(() => {
  loadItems()
  if (!profile.loaded) profile.fetchProfile()
})
</script>
