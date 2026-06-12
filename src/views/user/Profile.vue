<template>
  <div>
    <!-- ===== 形象卡片 ===== -->
    <div class="bg-white rounded-3xl border-2 border-[#E5E5E5] p-6 mb-5 text-center relative">
      <button @click="openEditor"
              class="absolute right-4 top-4 px-3 py-1.5 rounded-xl text-xs font-extrabold text-[#CE82FF] border-2 border-b-4 border-[#E5E5E5] hover:bg-[#F3E5FF] active:border-b-2 active:translate-y-0.5 transition-all">
        <i class="fas fa-wand-magic-sparkles mr-1"></i>编辑形象
      </button>

      <div class="inline-block rounded-3xl overflow-hidden ring-4 ring-[#E5E5E5]">
        <AvatarRender :config="profile.avatarConfig" :size="160" :rounded="false"/>
      </div>

      <!-- 昵称 -->
      <div class="mt-3 flex items-center justify-center gap-2">
        <template v-if="!editingNickname">
          <span class="text-2xl font-extrabold text-gray-700">{{ profile.nickname }}</span>
          <button @click="startEditNickname" class="text-gray-300 hover:text-[#1CB0F6]">
            <i class="fas fa-pen text-sm"></i>
          </button>
        </template>
        <template v-else>
          <input v-model="nicknameDraft" maxlength="20"
                 class="px-3 py-1.5 rounded-xl border-2 border-[#1CB0F6] font-extrabold text-gray-700 text-center w-44 focus:outline-none"
                 @keydown.enter="saveNickname"/>
          <button @click="saveNickname" class="text-[#58CC02] text-lg"><i class="fas fa-check"></i></button>
          <button @click="editingNickname = false" class="text-gray-400 text-lg"><i class="fas fa-xmark"></i></button>
        </template>
      </div>

      <!-- 统计 -->
      <div class="grid grid-cols-3 gap-3 mt-5">
        <div class="bg-[#FFF0D9] rounded-2xl p-3">
          <div class="text-xl font-extrabold text-[#FF9600]">{{ profile.passedStages }}</div>
          <div class="text-xs font-bold text-gray-500">完成关卡</div>
        </div>
        <div class="bg-[#DDF4FF] rounded-2xl p-3">
          <div class="text-xl font-extrabold text-[#1CB0F6]">{{ profile.gems }}</div>
          <div class="text-xs font-bold text-gray-500">宝石</div>
        </div>
        <div class="bg-[#E7F8D9] rounded-2xl p-3">
          <div class="text-xl font-extrabold text-[#58CC02]">{{ profile.learnedToday ? '✓' : '—' }}</div>
          <div class="text-xs font-bold text-gray-500">今日学习</div>
        </div>
      </div>
    </div>

    <!-- ===== 好友 ===== -->
    <div class="bg-white rounded-3xl border-2 border-[#E5E5E5] p-5 mb-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-extrabold text-gray-700 text-lg flex items-center gap-2">
          <i class="fas fa-user-group text-[#1CB0F6]"></i> 我的好友
          <span class="text-sm text-gray-400">({{ friends.length }})</span>
        </h2>
        <button @click="showAddFriend = true"
                class="px-3 py-1.5 rounded-xl text-xs font-extrabold text-white bg-[#1CB0F6] shadow-[0_3px_0_#1899D6] hover:brightness-105 active:translate-y-0.5 active:shadow-none transition-all">
          <i class="fas fa-user-plus mr-1"></i>添加好友
        </button>
      </div>

      <!-- 好友申请 -->
      <div v-if="requests.length > 0" class="mb-4 bg-[#FFF0D9] rounded-2xl p-3">
        <div class="text-xs font-extrabold text-[#FF9600] mb-2">收到 {{ requests.length }} 条好友申请</div>
        <div v-for="req in requests" :key="req.requestId" class="flex items-center gap-3 py-1.5">
          <AvatarRender :config="req.avatarConfig" :size="36"/>
          <span class="flex-1 font-extrabold text-gray-700 truncate">{{ req.nickname }}</span>
          <button @click="handleRequest(req, true)"
                  class="px-3 py-1 rounded-xl text-xs font-extrabold text-white bg-[#58CC02] hover:brightness-105">接受</button>
          <button @click="handleRequest(req, false)"
                  class="px-3 py-1 rounded-xl text-xs font-extrabold text-gray-400 border-2 border-[#E5E5E5] hover:bg-gray-50">拒绝</button>
        </div>
      </div>

      <div v-if="friends.length === 0" class="text-center text-gray-400 font-bold py-6">
        还没有好友, 在排行榜或这里搜索昵称添加吧~
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button v-for="friend in friends" :key="friend.userId" @click="viewFriend(friend)"
                class="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#F7F9F4] transition-colors text-left">
          <AvatarRender :config="friend.avatarConfig" :size="44"/>
          <div class="flex-1 min-w-0">
            <div class="font-extrabold text-gray-700 truncate">{{ friend.nickname }}</div>
            <div class="text-xs font-bold" :class="friend.learnedToday ? 'text-[#58CC02]' : 'text-gray-400'">
              {{ friend.learnedToday ? '🔥 今日已学习' : '今天还没学习' }}
            </div>
          </div>
          <i class="fas fa-chevron-right text-gray-300"></i>
        </button>
      </div>
    </div>

    <!-- ===== 其他设置 ===== -->
    <div class="bg-white rounded-3xl border-2 border-[#E5E5E5] p-5">
      <h2 class="font-extrabold text-gray-700 text-lg mb-3 flex items-center gap-2">
        <i class="fas fa-gear text-gray-400"></i> 设置
      </h2>
      <button @click="logout"
              class="w-full py-3 rounded-2xl font-extrabold text-[#FF4B4B] border-2 border-b-4 border-[#E5E5E5] hover:bg-[#FFE3E3] active:border-b-2 active:translate-y-0.5 transition-all">
        退出登录
      </button>
    </div>

    <!-- ===== 形象编辑器弹窗 ===== -->
    <el-dialog v-model="showEditor" title="编辑我的形象" width="92%" style="max-width: 560px" :show-close="true">
      <div class="flex flex-col sm:flex-row gap-5">
        <!-- 预览 -->
        <div class="flex flex-col items-center shrink-0">
          <div class="rounded-3xl overflow-hidden ring-4 ring-[#E5E5E5]">
            <AvatarRender :config="draftConfig" :size="150" :rounded="false"/>
          </div>
        </div>

        <!-- 选项 -->
        <div class="flex-1 max-h-[44vh] overflow-y-auto pr-1 space-y-4">
          <!-- 肤色 -->
          <div>
            <div class="text-xs font-extrabold text-gray-400 mb-2">肤色</div>
            <div class="flex flex-wrap gap-2">
              <button v-for="opt in SKIN_OPTIONS" :key="opt.key" @click="draftConfig.skin = opt.key"
                      class="w-9 h-9 rounded-full border-4 transition-all"
                      :style="{ backgroundColor: opt.color }"
                      :class="draftConfig.skin === opt.key ? 'border-[#1CB0F6] scale-110' : 'border-white'"
                      :title="opt.label"></button>
            </div>
          </div>
          <!-- 发型 -->
          <div>
            <div class="text-xs font-extrabold text-gray-400 mb-2">发型</div>
            <div class="flex flex-wrap gap-2">
              <button v-for="opt in HAIR_OPTIONS" :key="opt.key" @click="draftConfig.hair = opt.key"
                      class="px-3 py-1.5 rounded-xl text-xs font-extrabold border-2 transition-all"
                      :class="draftConfig.hair === opt.key ? 'border-[#1CB0F6] bg-[#DDF4FF] text-[#1CB0F6]' : 'border-[#E5E5E5] text-gray-500'">
                {{ opt.label }}
              </button>
            </div>
          </div>
          <!-- 表情 -->
          <div>
            <div class="text-xs font-extrabold text-gray-400 mb-2">表情</div>
            <div class="flex flex-wrap gap-2">
              <button v-for="opt in FACE_OPTIONS" :key="opt.key" @click="draftConfig.face = opt.key"
                      class="px-3 py-1.5 rounded-xl text-xs font-extrabold border-2 transition-all"
                      :class="draftConfig.face === opt.key ? 'border-[#1CB0F6] bg-[#DDF4FF] text-[#1CB0F6]' : 'border-[#E5E5E5] text-gray-500'">
                {{ opt.label }}
              </button>
            </div>
          </div>
          <!-- 已购装扮按部位 -->
          <div v-for="slot in decorSlots" :key="slot">
            <div class="text-xs font-extrabold text-gray-400 mb-2">{{ SLOT_LABELS[slot] }}</div>
            <div class="flex flex-wrap gap-2">
              <button @click="(draftConfig as any)[slot] = null"
                      class="px-3 py-1.5 rounded-xl text-xs font-extrabold border-2 transition-all"
                      :class="!(draftConfig as any)[slot] ? 'border-[#1CB0F6] bg-[#DDF4FF] text-[#1CB0F6]' : 'border-[#E5E5E5] text-gray-500'">
                无
              </button>
              <button v-for="item in ownedBySlot(slot)" :key="item.svgKey"
                      @click="(draftConfig as any)[slot] = item.svgKey"
                      class="px-3 py-1.5 rounded-xl text-xs font-extrabold border-2 transition-all"
                      :class="(draftConfig as any)[slot] === item.svgKey ? 'border-[#1CB0F6] bg-[#DDF4FF] text-[#1CB0F6]' : 'border-[#E5E5E5] text-gray-500'">
                {{ item.name }}
              </button>
              <span v-if="ownedBySlot(slot).length === 0" class="text-xs font-bold text-gray-300 py-1.5">
                去宝石小店购买{{ SLOT_LABELS[slot] }}吧
              </span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button @click="saveAvatar"
                class="w-full py-3 rounded-2xl font-extrabold text-white bg-[#58CC02] shadow-[0_4px_0_#46A302] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all">
          保存形象
        </button>
      </template>
    </el-dialog>

    <!-- ===== 添加好友弹窗 ===== -->
    <el-dialog v-model="showAddFriend" title="添加好友" width="92%" style="max-width: 440px">
      <div class="flex gap-2 mb-4">
        <input v-model="searchKeyword" @keydown.enter="doSearch"
               placeholder="输入昵称搜索"
               class="flex-1 px-4 py-2.5 rounded-2xl border-2 border-[#E5E5E5] font-bold text-gray-700 focus:outline-none focus:border-[#1CB0F6]"/>
        <button @click="doSearch"
                class="px-5 py-2.5 rounded-2xl font-extrabold text-white bg-[#1CB0F6] shadow-[0_3px_0_#1899D6] hover:brightness-105 active:translate-y-0.5 active:shadow-none transition-all">
          搜索
        </button>
      </div>

      <div v-loading="searching" class="min-h-[100px]">
        <div v-if="searched && searchResults.length === 0" class="text-center text-gray-400 font-bold py-8">
          没有找到匹配的用户
        </div>
        <div v-for="user in searchResults" :key="user.userId" class="flex items-center gap-3 py-2.5">
          <AvatarRender :config="user.avatarConfig" :size="40"/>
          <span class="flex-1 font-extrabold text-gray-700 truncate">{{ user.nickname }}</span>
          <button v-if="user.relationStatus === 'none'" @click="sendRequest(user)"
                  class="px-3 py-1.5 rounded-xl text-xs font-extrabold text-white bg-[#1CB0F6] hover:brightness-105">
            发送申请
          </button>
          <span v-else-if="user.relationStatus === 'pending'" class="text-xs font-extrabold text-gray-400">申请中</span>
          <span v-else class="text-xs font-extrabold text-[#58CC02]">已是好友</span>
        </div>
      </div>
    </el-dialog>

    <!-- ===== 好友资料卡弹窗 ===== -->
    <el-dialog v-model="showFriendCard" :title="friendDetail?.nickname || '好友资料'" width="92%" style="max-width: 380px">
      <div v-if="friendDetail" class="text-center">
        <div class="inline-block rounded-3xl overflow-hidden ring-4 ring-[#E5E5E5] mb-4">
          <AvatarRender :config="friendDetail.avatarConfig" :size="140" :rounded="false"/>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-[#FFF0D9] rounded-2xl p-3">
            <div class="text-xl font-extrabold text-[#FF9600]">{{ friendDetail.passedStages }}</div>
            <div class="text-xs font-bold text-gray-500">完成关卡</div>
          </div>
          <div class="rounded-2xl p-3" :class="friendDetail.learnedToday ? 'bg-[#E7F8D9]' : 'bg-gray-100'">
            <div class="text-xl font-extrabold" :class="friendDetail.learnedToday ? 'text-[#58CC02]' : 'text-gray-400'">
              {{ friendDetail.learnedToday ? '🔥' : '💤' }}
            </div>
            <div class="text-xs font-bold text-gray-500">{{ friendDetail.learnedToday ? '今日已学习' : '今日未学习' }}</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import AvatarRender from '@/components/AvatarRender.vue'
import { useProfileStore } from '@/store/profile'
import { useUserStore } from '@/store/user'
import {
  SKIN_OPTIONS, HAIR_OPTIONS, FACE_OPTIONS, SLOT_LABELS,
  parseAvatarConfig, AvatarConfig
} from '@/avatar/parts'

const router = useRouter()
const profile = useProfileStore()
const userStore = useUserStore()

const decorSlots = ['hat', 'glasses', 'outfit', 'background'] as const

// 昵称
const editingNickname = ref(false)
const nicknameDraft = ref('')

// 形象编辑
const showEditor = ref(false)
const draftConfig = reactive<AvatarConfig>(parseAvatarConfig(null))
const myItems = ref<any[]>([])

// 好友
const friends = ref<any[]>([])
const requests = ref<any[]>([])
const showAddFriend = ref(false)
const searchKeyword = ref('')
const searchResults = ref<any[]>([])
const searching = ref(false)
const searched = ref(false)
const showFriendCard = ref(false)
const friendDetail = ref<any>(null)

const startEditNickname = () => {
  nicknameDraft.value = profile.nickname
  editingNickname.value = true
}

const saveNickname = async () => {
  const name = nicknameDraft.value.trim()
  if (!name) {
    ElMessage.warning('昵称不能为空')
    return
  }
  try {
    await request.put('/user/profile', { nickname: name })
    editingNickname.value = false
    await profile.fetchProfile()
    ElMessage.success('昵称已更新')
  } catch (e) { /* 拦截器弹错 */ }
}

const openEditor = async () => {
  Object.assign(draftConfig, parseAvatarConfig(profile.avatarConfig))
  showEditor.value = true
  try {
    const res: any = await request.get('/user/shop/my-items')
    myItems.value = res || []
  } catch (e) { /* ignore */ }
}

const ownedBySlot = (slot: string) => myItems.value.filter(i => i.slot === slot)

const saveAvatar = async () => {
  try {
    await request.put('/user/profile', { avatarConfig: JSON.stringify(draftConfig) })
    showEditor.value = false
    await profile.fetchProfile()
    ElMessage.success('形象已保存!')
  } catch (e) { /* 拦截器弹错 */ }
}

const loadFriends = async () => {
  try {
    const [friendList, requestList]: any[] = await Promise.all([
      request.get('/user/friend/list'),
      request.get('/user/friend/requests')
    ])
    friends.value = friendList || []
    requests.value = requestList || []
  } catch (e) {
    console.error('拉取好友数据失败', e)
  }
}

const handleRequest = async (req: any, accept: boolean) => {
  try {
    await request.post('/user/friend/handle', { requestId: req.requestId, accept })
    ElMessage.success(accept ? `你和 ${req.nickname} 成为了好友!` : '已拒绝')
    await loadFriends()
  } catch (e) { /* 拦截器弹错 */ }
}

const doSearch = async () => {
  const kw = searchKeyword.value.trim()
  if (!kw) return
  try {
    searching.value = true
    const res: any = await request.get('/user/friend/search', { params: { keyword: kw } })
    searchResults.value = res || []
    searched.value = true
  } catch (e) { /* ignore */ } finally {
    searching.value = false
  }
}

const sendRequest = async (user: any) => {
  try {
    await request.post('/user/friend/request', { toUserId: user.userId })
    user.relationStatus = 'pending'
    ElMessage.success(`已向 ${user.nickname} 发送好友申请`)
  } catch (e) { /* 拦截器弹错 */ }
}

const viewFriend = async (friend: any) => {
  try {
    const res: any = await request.get(`/user/profile/${friend.userId}`)
    friendDetail.value = res
    showFriendCard.value = true
  } catch (e) { /* 拦截器弹错 */ }
}

const logout = async () => {
  try {
    await request.post('/auth/logout')
  } catch (e) { /* 忽略注销接口异常 */ }
  userStore.logout()
  profile.reset()
  router.replace('/login')
}

onMounted(() => {
  if (!profile.loaded) profile.fetchProfile()
  loadFriends()
})
</script>
