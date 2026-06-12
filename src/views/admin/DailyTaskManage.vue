<template>
  <div class="space-y-6">
    <!-- ===== 按日挑选任务 ===== -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-gray-800 text-base">
          <i class="fas fa-calendar-day text-blue-500 mr-2"></i>每日任务计划
        </h3>
        <el-date-picker v-model="planDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期"
                        :clearable="false" @change="loadPlan" style="width: 160px"/>
      </div>

      <p class="text-xs text-gray-400 mb-4">
        为选定日期从任务池挑选 3 个任务。若某天未配置, 系统当天将自动随机挑选 3 个启用中的任务兜底。
      </p>

      <div v-loading="planLoading">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div v-for="(slot, idx) in planSelection" :key="idx"
               class="border-2 border-dashed rounded-xl p-3"
               :class="slot ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200'">
            <div class="text-xs text-gray-400 mb-1.5 font-bold">任务 {{ idx + 1 }}</div>
            <el-select v-model="planSelection[idx]" placeholder="从任务池选择" filterable style="width: 100%">
              <el-option v-for="task in enabledPool" :key="task.id" :value="task.id"
                         :label="task.title"
                         :disabled="planSelection.includes(task.id) && planSelection[idx] !== task.id"/>
            </el-select>
            <div v-if="slot && poolMap[slot]" class="text-xs text-gray-500 mt-1.5">
              {{ typeLabel(poolMap[slot].taskType) }} · 目标 {{ poolMap[slot].targetCount }} 次 · 💎 {{ poolMap[slot].gemReward }}
            </div>
          </div>
        </div>
        <el-button type="primary" :loading="planSaving" :disabled="planSelection.filter(Boolean).length !== 3"
                   @click="savePlan">
          保存 {{ planDate }} 的任务计划
        </el-button>
      </div>
    </div>

    <!-- ===== 任务池管理 ===== -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-gray-800 text-base">
          <i class="fas fa-layer-group text-orange-500 mr-2"></i>每日任务池
        </h3>
        <el-button type="primary" @click="openEdit()">
          <i class="fas fa-plus mr-1"></i>新增任务
        </el-button>
      </div>

      <el-table :data="pool" v-loading="poolLoading" stripe>
        <el-table-column prop="title" label="任务标题" min-width="200"/>
        <el-table-column label="类型" width="140">
          <template #default="{ row }">
            <el-tag :type="typeTagType(row.taskType)" size="small">{{ typeLabel(row.taskType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetCount" label="目标次数" width="90" align="center"/>
        <el-table-column label="宝石奖励" width="100" align="center">
          <template #default="{ row }">
            <span class="font-bold text-blue-500">💎 {{ row.gemReward }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.enabled === 1 ? 'success' : 'info'" size="small">
              {{ row.enabled === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="removeTask(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- ===== 编辑弹窗 ===== -->
    <el-dialog v-model="showEdit" :title="editForm.id ? '编辑任务' : '新增任务'" width="480px">
      <el-form label-width="90px">
        <el-form-item label="任务标题" required>
          <el-input v-model="editForm.title" placeholder="例如: 完成 3 个关卡" maxlength="50"/>
        </el-form-item>
        <el-form-item label="任务类型" required>
          <el-select v-model="editForm.taskType" style="width: 100%">
            <el-option value="STAGE_COMPLETE" label="完成关卡"/>
            <el-option value="STAGE_PERFECT" label="无错通关关卡"/>
            <el-option value="ASK_AI" label="询问 AI 教师"/>
          </el-select>
        </el-form-item>
        <el-form-item label="目标次数">
          <el-input-number v-model="editForm.targetCount" :min="1" :max="50"/>
        </el-form-item>
        <el-form-item label="宝石奖励">
          <el-input-number v-model="editForm.gemReward" :min="0" :max="9999"/>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="editForm.enabled" :active-value="1" :inactive-value="0"
                     active-text="启用" inactive-text="停用"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEdit = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveTask">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const pool = ref<any[]>([])
const poolLoading = ref(false)

const today = new Date()
const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const planDate = ref(fmt(today))
const planSelection = ref<(number | null)[]>([null, null, null])
const planLoading = ref(false)
const planSaving = ref(false)

const showEdit = ref(false)
const saving = ref(false)
const editForm = reactive<any>({ id: null, title: '', taskType: 'STAGE_COMPLETE', targetCount: 1, gemReward: 10, enabled: 1 })

const enabledPool = computed(() => pool.value.filter(t => t.enabled === 1))
const poolMap = computed<Record<string, any>>(() => {
  const map: Record<string, any> = {}
  pool.value.forEach(t => { map[t.id] = t })
  return map
})

const typeLabel = (type: string) => {
  switch (type) {
    case 'STAGE_COMPLETE': return '完成关卡'
    case 'STAGE_PERFECT': return '无错通关'
    case 'ASK_AI': return '询问 AI 教师'
    default: return type
  }
}
const typeTagType = (type: string) => {
  switch (type) {
    case 'STAGE_COMPLETE': return 'success'
    case 'STAGE_PERFECT': return 'warning'
    case 'ASK_AI': return 'primary'
    default: return 'info'
  }
}

const loadPool = async () => {
  try {
    poolLoading.value = true
    pool.value = (await request.get('/admin/daily-task/pool')) as any[] || []
  } catch (e) { console.error(e) } finally { poolLoading.value = false }
}

const loadPlan = async () => {
  try {
    planLoading.value = true
    const res: any = await request.get('/admin/daily-task/plan', { params: { date: planDate.value } })
    const tasks = res || []
    planSelection.value = [tasks[0]?.id ?? null, tasks[1]?.id ?? null, tasks[2]?.id ?? null]
  } catch (e) { console.error(e) } finally { planLoading.value = false }
}

const savePlan = async () => {
  try {
    planSaving.value = true
    await request.post('/admin/daily-task/plan/save', {
      date: planDate.value,
      taskPoolIds: planSelection.value.filter(Boolean)
    })
    ElMessage.success('任务计划已保存')
  } catch (e) { /* 拦截器弹错 */ } finally { planSaving.value = false }
}

const openEdit = (row?: any) => {
  if (row) {
    Object.assign(editForm, { id: row.id, title: row.title, taskType: row.taskType, targetCount: row.targetCount, gemReward: row.gemReward, enabled: row.enabled })
  } else {
    Object.assign(editForm, { id: null, title: '', taskType: 'STAGE_COMPLETE', targetCount: 1, gemReward: 10, enabled: 1 })
  }
  showEdit.value = true
}

const saveTask = async () => {
  if (!editForm.title?.trim()) return ElMessage.warning('任务标题不能为空')
  try {
    saving.value = true
    await request.post('/admin/daily-task/pool/save', { ...editForm, title: editForm.title.trim() })
    ElMessage.success('任务已保存')
    showEdit.value = false
    await loadPool()
  } catch (e) { /* 拦截器弹错 */ } finally { saving.value = false }
}

const removeTask = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确认删除任务「${row.title}」?`, '删除确认', { type: 'warning' })
    await request.delete(`/admin/daily-task/pool/${row.id}`)
    ElMessage.success('已删除')
    await loadPool()
  } catch (e) { /* 取消或失败 */ }
}

onMounted(async () => {
  await loadPool()
  await loadPlan()
})
</script>
