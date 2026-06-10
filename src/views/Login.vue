<template>
  <div class="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden perspective-1000">
    <!-- 背景光效 (动态响应角色切换) -->
    <div class="absolute inset-0 transition-colors duration-700 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]"
         :class="isRegisterMode ? 'from-green-900/20 via-[#0f172a] to-[#0f172a]' : (loginRole === 'ADMIN' ? 'from-blue-900/30 via-[#0f172a] to-[#0f172a]' : 'from-cyan-900/20 via-[#0f172a] to-[#0f172a]')">
    </div>

    <!-- 3D 翻转容器 -->
    <div class="max-w-md w-full relative z-10 transition-transform duration-700 transform-style-3d"
         :class="{ 'rotate-y-180': isRegisterMode }">

      <!-- ================= 登录面板 (正面) ================= -->
      <div class="absolute w-full backface-hidden bg-gray-800/80 backdrop-blur-xl rounded-2xl p-10 border border-gray-700/50 transition-shadow duration-500"
           :class="[
             { 'opacity-0 pointer-events-none': isRegisterMode, 'opacity-100 pointer-events-auto': !isRegisterMode },
             loginRole === 'ADMIN' ? 'shadow-[0_0_50px_rgba(37,99,235,0.2)]' : 'shadow-[0_0_50px_rgba(6,182,212,0.2)]'
           ]">

        <!-- 角色切换 Tabs -->
        <div class="flex justify-center mb-8">
          <div class="bg-gray-900/80 p-1 rounded-xl flex space-x-1 border border-gray-700">
            <button @click="loginRole = 'USER'" type="button"
                    class="px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                    :class="loginRole === 'USER' ? 'bg-cyan-600/20 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'text-gray-500 hover:text-gray-300'">
              <i class="fas fa-user-astronaut mr-2"></i> 学员终端
            </button>
            <button @click="loginRole = 'ADMIN'" type="button"
                    class="px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                    :class="loginRole === 'ADMIN' ? 'bg-blue-600/20 text-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'text-gray-500 hover:text-gray-300'">
              <i class="fas fa-shield-alt mr-2"></i> 管理中枢
            </button>
          </div>
        </div>

        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500"
               :class="loginRole === 'ADMIN' ? 'bg-blue-600 shadow-blue-500/30' : 'bg-cyan-600 shadow-cyan-500/30'">
            <i class="fas fa-cube text-3xl text-white"></i>
          </div>
        </div>

        <h2 class="text-3xl font-bold text-center text-white mb-2 tracking-wider">QuestForge</h2>
        <p class="text-center mb-8 text-sm transition-colors duration-300" :class="loginRole === 'ADMIN' ? 'text-blue-400/80' : 'text-cyan-400/80'">
          {{ loginRole === 'ADMIN' ? '企业级评测管理系统' : '智能学习与探索平台' }}
        </p>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              {{ loginRole === 'ADMIN' ? '管理员账号' : '登录档案名' }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-user text-gray-500"></i>
              </div>
              <input
                  v-model="loginForm.username"
                  type="text"
                  required
                  class="block w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder-gray-500"
                  :class="loginRole === 'ADMIN' ? 'focus:ring-blue-500' : 'focus:ring-cyan-500'"
                  :placeholder="loginRole === 'ADMIN' ? '请输入 Admin ID' : '请输入 User ID'"
              >
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">安全密钥</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-lock text-gray-500"></i>
              </div>
              <input
                  v-model="loginForm.password"
                  type="password"
                  required
                  class="block w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder-gray-500"
                  :class="loginRole === 'ADMIN' ? 'focus:ring-blue-500' : 'focus:ring-cyan-500'"
                  placeholder="请输入密码"
              >
            </div>
          </div>

          <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-all transform hover:scale-[1.02]"
              :class="loginRole === 'ADMIN' ? 'bg-blue-600 hover:bg-blue-500 focus:ring-blue-500' : 'bg-cyan-600 hover:bg-cyan-500 focus:ring-cyan-500'"
          >
            <span v-if="loading"><i class="fas fa-spinner fa-spin mr-2"></i>神经链接建立中...</span>
            <span v-else>{{ loginRole === 'ADMIN' ? '授权登入管理核心' : '建立探索连接' }}</span>
          </button>
        </form>

        <div class="mt-6 text-center" v-if="loginRole === 'USER'">
          <p class="text-gray-400 text-sm">
            还没有接入权限？
            <button @click="toggleMode" type="button" class="text-cyan-400 hover:text-cyan-300 font-medium transition-colors border-b border-transparent hover:border-cyan-300">
              立即注册档案
            </button>
          </p>
        </div>
        <div class="mt-6 text-center" v-else>
          <p class="text-gray-500 text-xs">注: 管理员账号由系统分配，暂不开放自主注册</p>
        </div>
      </div>

      <!-- ================= 注册面板 (反面) ================= -->
      <div class="absolute w-full backface-hidden bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.15)] p-10 border border-gray-700/50 rotate-y-180"
           :class="{ 'opacity-100 pointer-events-auto': isRegisterMode, 'opacity-0 pointer-events-none': !isRegisterMode }">
        <div class="flex justify-center mb-6">
          <div class="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
            <i class="fas fa-user-plus text-3xl text-white"></i>
          </div>
        </div>
        <h2 class="text-2xl font-bold text-center text-white mb-2 tracking-wider">创建新档案</h2>
        <p class="text-center text-green-400/80 mb-6 text-sm">加入 QuestForge，开启你的考核之旅</p>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-300 mb-1">登录账号</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-at text-gray-500 text-sm"></i>
              </div>
              <input
                  v-model="registerForm.username"
                  type="text"
                  required
                  class="block w-full pl-10 pr-3 py-2.5 bg-gray-900/50 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-500"
                  placeholder="设置登录账号 (仅限英数字)"
              >
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-300 mb-1">真实姓名</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-id-card text-gray-500 text-sm"></i>
              </div>
              <input
                  v-model="registerForm.realName"
                  type="text"
                  required
                  class="block w-full pl-10 pr-3 py-2.5 bg-gray-900/50 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-500"
                  placeholder="请输入真实姓名 (用于发证验证)"
              >
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-300 mb-1">设置密码</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-key text-gray-500 text-sm"></i>
              </div>
              <input
                  v-model="registerForm.password"
                  type="password"
                  required
                  class="block w-full pl-10 pr-3 py-2.5 bg-gray-900/50 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-500"
                  placeholder="不少于 6 位"
              >
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-300 mb-1">确认密码</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-check-circle text-gray-500 text-sm"></i>
              </div>
              <input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  required
                  class="block w-full pl-10 pr-3 py-2.5 bg-gray-900/50 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-500"
                  placeholder="请再次输入密码"
              >
            </div>
          </div>

          <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-3 px-4 mt-2 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 disabled:opacity-50 transition-all transform hover:scale-[1.02]"
          >
            <span v-if="loading"><i class="fas fa-spinner fa-spin mr-2"></i>档案创建中...</span>
            <span v-else>确认注册</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-gray-400 text-sm">
            已拥有档案？
            <button @click="toggleMode" type="button" class="text-green-400 hover:text-green-300 font-medium transition-colors border-b border-transparent hover:border-green-300">
              取消并返回
            </button>
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import request from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const isRegisterMode = ref(false) // 控制面板翻转

// 新增：明确控制当前选中的是 Admin 还是 User 登录
const loginRole = ref<'USER' | 'ADMIN'>('USER')

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 注册表单数据
const registerForm = reactive({
  username: '',
  realName: '',
  password: '',
  confirmPassword: '',
  roleCode: 'USER' // 默认注册为普通用户
})

// 切换登录/注册模式
const toggleMode = () => {
  isRegisterMode.value = !isRegisterMode.value
  // 切换时清空密码等敏感信息
  if (isRegisterMode.value) {
    loginForm.password = ''
  } else {
    registerForm.password = ''
    registerForm.confirmPassword = ''
  }
}

// ==================== 核心逻辑：完全保留原有实现 ====================

// 处理登录
const handleLogin = async () => {
  try {
    loading.value = true
    // 对接统一的登录接口
    const res: any = await request.post('/auth/login', {
      username: loginForm.username,
      password: loginForm.password
    })

    // 假设后端返回结构 { code: 200, data: { token, role, username, realName, userId } }
    const { token, role, username, realName, userId } = res.data

    // 额外的防呆校验：如果前端选择了 Admin 登录，但后端返回的权限是 USER，可予以拦截提示
    if (loginRole.value === 'ADMIN' && role !== 'ROLE_ADMIN') {
      throw new Error('权限不足：当前账号不具备管理核心访问权限')
    }

    userStore.setToken(token)
    userStore.setUserInfo({ username, role, realName, userId })

    // 根据后端返回的实际角色进行路由跳转（不阉割任何逻辑）
    if (role === 'ROLE_ADMIN') {
      router.push('/admin')
    } else {
      router.push('/paper/list')
    }
  } catch (error: any) {
    console.error('登录失败:', error)
    alert(error.message || '登录失败，请检查账号密码')
  } finally {
    loading.value = false
  }
}

// 处理注册
const handleRegister = async () => {
  // 前端基础校验
  if (registerForm.password !== registerForm.confirmPassword) {
    alert('两次输入的密码不一致！')
    return
  }

  if (registerForm.password.length < 6) {
    alert('密码长度不能少于6位！')
    return
  }

  try {
    loading.value = true
    // 调用后端注册接口
    await request.post('/auth/register', {
      username: registerForm.username,
      password: registerForm.password,
      realName: registerForm.realName,
      roleCode: registerForm.roleCode
    })

    alert('注册成功！神经档案已建立，请登录。')

    // 注册成功后自动将账号填充到登录表单，并翻转回学员登录界面
    loginRole.value = 'USER'
    loginForm.username = registerForm.username
    toggleMode()

  } catch (error: any) {
    console.error('注册失败:', error)
    alert(error.message || '注册失败，该账号可能已被占用')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 3D 翻转相关工具类扩展 */
.perspective-1000 {
  perspective: 1000px;
}
.transform-style-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}

/* 确保绝对定位的面板高度一致，这里使用 min-height 保证不塌陷 */
.absolute {
  min-height: 520px;
}
</style>