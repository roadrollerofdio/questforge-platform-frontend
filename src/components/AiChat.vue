<template>
  <div class="ai-tutor-container">
    <div v-if="!hasDiagnosed" class="summon-area">
      <el-button type="primary" plain @click="summonAiTutor" :loading="loading">
        <el-icon class="el-icon--left"><MagicStick /></el-icon>
        召唤 AI 老师专属诊断
      </el-button>
    </div>

    <div v-else class="diagnosis-card">
      <div class="ai-header">
        <el-icon color="#67C23A"><MagicStick /></el-icon>
        <span class="ai-title">AI 私教点评</span>
      </div>
      <div class="ai-content">
        <!-- 骨架屏加载动画 -->
        <el-skeleton v-if="loading" :rows="3" animated />
        <!-- AI 诊断结果展示 -->
        <div v-else class="typed-text" v-html="formattedAdvice"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MagicStick } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  questionId: string
  wrongAnswer: string
}>()

const loading = ref(false)
const hasDiagnosed = ref(false)
const advice = ref('')

// 将 AI 返回的文本简单处理换行为 HTML
const formattedAdvice = computed(() => {
  return advice.value.replace(/\n/g, '<br/>')
})

const summonAiTutor = async () => {
  if (!props.wrongAnswer) {
    ElMessage.warning('未检测到您的作答记录，无法进行诊断哦')
    return
  }

  loading.value = true
  hasDiagnosed.value = true

  try {
    // 召唤后端写好的大模型接口
    const res: any = await request.get('/exam/analysis/ai-tutor', {
      params: {
        questionId: props.questionId,
        wrongUserAnswer: props.wrongAnswer
      }
    })
    advice.value = res || 'AI老师去摸鱼了，请稍后再试。'
  } catch (error) {
    advice.value = '系统繁忙，AI诊断生成失败。'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.ai-tutor-container {
  margin-top: 15px;
  background-color: #f4f9ff;
  border: 1px dashed #a0cfff;
  border-radius: 8px;
  padding: 15px;
}

.summon-area {
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

.diagnosis-card {
  text-align: left;
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.ai-title {
  font-weight: bold;
  color: #409EFF;
  font-size: 15px;
}

.ai-content {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.typed-text {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>