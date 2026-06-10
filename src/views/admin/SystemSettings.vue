<template>
  <div class="max-w-4xl mx-auto space-y-6 animate-fade-in font-sans antialiased">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">系统全局配置</h2>

    <div class="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
      <div class="flex items-center mb-6 pb-4 border-b border-gray-100">
        <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mr-4"><i class="fa-solid fa-robot text-xl"></i></div>
        <div><h3 class="text-lg font-bold text-gray-800">AI 大模型中枢配置</h3><p class="text-sm text-gray-500">配置用于智能组卷与错题私教的底层 AI 模型接口参数</p></div>
      </div>

      <el-form label-position="top">
        <div class="grid grid-cols-2 gap-6 mb-2">
          <el-form-item label="默认推理模型引擎">
            <el-select v-model="settings.aiModel" class="w-full" size="large">
              <el-option label="DeepSeek-Chat (推荐)" value="deepseek-chat" />
              <el-option label="OpenAI GPT-4o" value="gpt-4o" />
              <el-option label="Gemini 1.5 Pro" value="gemini-1.5-pro" />
            </el-select>
          </el-form-item>
          <el-form-item label="API Base URL (留空走默认路由)">
            <el-input v-model="settings.aiApiUrl" placeholder="如：https://api.deepseek.com/v1" size="large" />
          </el-form-item>
        </div>
        <el-form-item label="API Secret Key (授权凭证)">
          <el-input v-model="settings.aiApiKey" type="password" show-password placeholder="请输入以 sk- 开头的密钥凭证" size="large" />
        </el-form-item>
      </el-form>
    </div>

    <div class="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
      <div class="flex items-center mb-6 pb-4 border-b border-gray-100">
        <div class="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mr-4"><i class="fa-solid fa-bolt text-xl"></i></div>
        <div><h3 class="text-lg font-bold text-gray-800">性能与并发策略</h3><p class="text-sm text-gray-500">保护考场稳定运行的底层熔断与缓存机制设置</p></div>
      </div>

      <div class="space-y-6">
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div><h4 class="font-bold text-gray-800">强制交卷缓冲时间</h4><p class="text-xs text-gray-500 mt-1">考试倒计时归零后，系统强制回收试卷前的 MQ 延迟缓冲时间（防瞬间洪峰）</p></div>
          <el-input-number v-model="settings.mqDelay" :min="0" :max="60" :step="5" size="large" /> <span class="ml-2 text-sm text-gray-500 font-bold">秒</span>
        </div>
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div><h4 class="font-bold text-gray-800">试卷 Redis 预热与强缓存</h4><p class="text-xs text-gray-500 mt-1">开启后发布试卷将硬性推送到 Redis 集群，大幅提升万人并发拉卷能力，但增加内存开销</p></div>
          <el-switch v-model="settings.enableRedisCache" style="--el-switch-on-color: #10b981;" />
        </div>
      </div>
    </div>

    <div class="flex justify-end pt-4">
      <el-button type="primary" size="large" class="w-32" @click="saveSettings" :loading="loading">保存配置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)

// 模拟前端本地配置状态 (演示用，生产环境应存储在数据库 sys_config 表中)
const settings = ref({
  aiModel: 'deepseek-chat',
  aiApiUrl: 'https://api.deepseek.com/v1',
  aiApiKey: '',
  mqDelay: 10,
  enableRedisCache: true
})

onMounted(() => {
  const localConfig = localStorage.getItem('EXAM_SYS_CONFIG')
  if (localConfig) {
    settings.value = JSON.parse(localConfig)
  }
})

const saveSettings = () => {
  loading.value = true
  setTimeout(() => {
    localStorage.setItem('EXAM_SYS_CONFIG', JSON.stringify(settings.value))
    ElMessage.success('系统全局配置已成功保存')
    loading.value = false
  }, 600)
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>