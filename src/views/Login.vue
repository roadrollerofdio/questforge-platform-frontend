<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2 class="title">企业级智能考试平台</h2>
        <p class="subtitle">Welcome to Exam Platform</p>
      </div>

      <!-- 双门户入口切换 -->
      <el-tabs v-model="portalMode" class="portal-tabs" stretch>
        <el-tab-pane label=" 考生端" name="USER"></el-tab-pane>
        <el-tab-pane label=" 管理端" name="ADMIN"></el-tab-pane>
      </el-tabs>

      <!-- 登录表单 -->
      <el-form
          v-if="!isRegisterMode"
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名/学号" size="large" :prefix-icon="User" />
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" size="large" :prefix-icon="Lock" show-password />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="full-btn" size="large" :loading="loading" @click="handleLogin">
            {{ portalMode === 'ADMIN' ? '登 录 后 台' : '登 录 考 场' }}
          </el-button>
        </el-form-item>

        <div class="action-links" v-if="portalMode === 'USER'">
          没有账号？ <el-button link type="primary" @click="isRegisterMode = true">立即注册</el-button>
        </div>
      </el-form>

      <!-- 注册表单 (仅考生端可见) -->
      <el-form
          v-else
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          class="register-form"
      >
        <el-form-item prop="username">
          <el-input v-model="registerForm.username" placeholder="设置用户名/学号" size="large" :prefix-icon="User" />
        </el-form-item>

        <el-form-item prop="realName">
          <el-input v-model="registerForm.realName" placeholder="您的真实姓名 (用于成绩单)" size="large" :prefix-icon="Edit" />
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="设置密码" size="large" :prefix-icon="Lock" show-password />
        </el-form-item>

        <el-form-item>
          <el-button type="success" class="full-btn" size="large" :loading="loading" @click="handleRegister">
            立 即 注 册
          </el-button>
        </el-form-item>

        <div class="action-links">
          已有账号？ <el-button link type="primary" @click="isRegisterMode = false">返回登录</el-button>
        </div>
      </el-form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import request from '@/utils/request'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const portalMode = ref('USER') // USER 考生端, ADMIN 管理端
const isRegisterMode = ref(false)
const loading = ref(false)

const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()

const loginForm = reactive({ username: '', password: '' })
const registerForm = reactive({ username: '', realName: '', password: '', roleCode: 'USER' })

const loginRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

const registerRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }, { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 5, max: 20, message: '长度在 5 到 20 个字符', trigger: 'blur' }]
})

const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res: any = await request.post('/auth/login', loginForm)

        // 双门户角色隔离拦截
        if (portalMode.value === 'ADMIN' && res.role !== 'ROLE_ADMIN') {
          ElMessage.error('权限不足：该账号不是管理员，无法登录管理控制台！')
          return
        }
        if (portalMode.value === 'USER' && res.role !== 'ROLE_USER') {
          ElMessage.error('系统提示：管理员请切换至【管理端】进行登录！')
          return
        }

        userStore.setUserInfo({
          userId: res.userId,
          realName: res.realName,
          role: res.role,
          token: res.token
        })

        ElMessage.success('登录成功')
        if (res.role === 'ROLE_ADMIN') {
          router.push('/admin/dashboard')
        } else {
          router.push('/user/paper-list')
        }
      } catch (error) {
        console.error('登录异常', error)
      } finally {
        loading.value = false
      }
    }
  })
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await request.post('/auth/register', registerForm)
        ElMessage.success('注册成功，请登录！')
        isRegisterMode.value = false // 注册成功切回登录
        loginForm.username = registerForm.username
        loginForm.password = ''
      } catch (error) {
        console.error('注册异常', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.08"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');
}

.login-box {
  width: 420px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.login-header { text-align: center; margin-bottom: 25px; }
.title { font-size: 24px; color: #303133; margin: 0 0 8px 0; }
.subtitle { font-size: 14px; color: #909399; margin: 0; }

.portal-tabs { margin-bottom: 20px; }

.full-btn { width: 100%; font-size: 16px; letter-spacing: 2px; }
.action-links { text-align: right; font-size: 14px; color: #606266; margin-top: 10px; }
.tips { margin-top: 20px; font-size: 13px; color: #909399; text-align: center; }
</style>