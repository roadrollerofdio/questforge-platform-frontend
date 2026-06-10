<template>
  <div class="admin-layout">
    <header class="admin-topbar">
      <div class="topbar-left">
        <h2 class="brand">EXAM PRO <span class="badge">控制台</span></h2>
      </div>
      <div class="topbar-right">
        <span class="nav-link" @click="router.push('/admin/dashboard')">试卷大盘</span>
        <span class="nav-link active">题库管理</span>
        <span class="divider"></span>
        <el-button link class="logout-btn" @click="handleLogout">退出系统</el-button>
      </div>
    </header>

    <main class="admin-main">
      <div class="page-header">
        <div class="header-titles">
          <h1>试题库资产</h1>
          <p>管理全局业务知识点与评测题库</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" class="action-btn" @click="openAddDialog">
            <el-icon class="el-icon--left"><Plus /></el-icon> 录入新题
          </el-button>
        </div>
      </div>

      <!-- 扁平化筛选栏 -->
      <div class="flat-filter-bar">
        <el-input v-model="queryParams.subjectId" placeholder="科目代码 (选填)" class="filter-input" clearable />
        <el-input v-model="queryParams.keyword" placeholder="题干检索..." class="filter-input flex-1" clearable />
        <el-button type="primary" plain @click="fetchQuestions">精准检索</el-button>
      </div>

      <!-- 数据表 -->
      <div class="flat-panel">
        <el-table :data="questionList" style="width: 100%" v-loading="loading" class="modern-table">
          <el-table-column prop="id" label="资产编号" width="180" />
          <el-table-column label="题型" width="100">
            <template #default="{ row }">
              <span class="type-tag">{{ row.questionType === 1 ? '单选' : '多选' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="题干摘要" min-width="350">
            <template #default="{ row }"><div class="truncate-text" v-html="row.content"></div></template>
          </el-table-column>
          <el-table-column prop="standardAnswer" label="标准答案" width="100" align="center" />
          <el-table-column label="难度" width="120" align="center">
            <template #default="{ row }"><el-rate v-model="row.difficulty" disabled max="3" class="mini-rate" /></template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="right" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
              <el-button type="danger" link @click="deleteQuestion(row.id)">归档</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-bar">
          <el-pagination background layout="total, prev, pager, next" :total="total" v-model:current-page="queryParams.pageNo" @current-change="fetchQuestions" />
        </div>
      </div>
    </main>

    <!-- 弹窗：新建/编辑 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑试题资产' : '录入新题'" width="750px" class="modern-dialog" top="5vh">
      <el-form :model="form" label-width="90px" :rules="rules" ref="formRef" label-position="top">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属科目分类" prop="subjectId">
              <el-input-number v-model="form.subjectId" :min="1" style="width:100%" size="large" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="难度级别">
              <el-rate v-model="form.difficulty" :max="3" style="margin-top: 10px;" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="题目类型" prop="questionType">
          <el-radio-group v-model="form.questionType" class="clean-radio">
            <el-radio :value="1">标准单选题</el-radio>
            <el-radio :value="2">组合多选题</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="题干内容 (支持HTML/富文本)" prop="content">
          <el-input type="textarea" v-model="form.content" :rows="4" />
        </el-form-item>

        <el-form-item label="选项配置" required>
          <div class="options-container">
            <div v-for="(opt, index) in form.optionsJson" :key="index" class="option-row">
              <div class="opt-prefix">{{ opt.key }}</div>
              <el-input v-model="opt.val" placeholder="录入选项内容" class="opt-input" />
              <el-button type="danger" link icon="Delete" @click="removeOption(index)" />
            </div>
            <el-button plain @click="addOption" style="margin-top: 10px; width: 100%">+ 新增选项</el-button>
          </div>
        </el-form-item>

        <el-form-item label="标准答案 (多选逗号分隔)" prop="standardAnswer">
          <el-input v-model="form.standardAnswer" placeholder="如: A,B" size="large" />
        </el-form-item>

        <el-form-item label="专家解析 (可选)">
          <el-input type="textarea" v-model="form.analysis" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">保存记录</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import request from '@/utils/request'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const questionList = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const queryParams = reactive({ pageNo: 1, pageSize: 10, subjectId: '', keyword: '' })

const dialogVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const form = ref<any>({
  id: null, subjectId: 1, questionType: 1, content: '',
  optionsJson: [{ key: 'A', val: '' }, { key: 'B', val: '' }, { key: 'C', val: '' }, { key: 'D', val: '' }],
  standardAnswer: '', difficulty: 2, analysis: ''
})

const rules = {
  subjectId: [{ required: true, message: '必填项', trigger: 'blur' }],
  content: [{ required: true, message: '必填项', trigger: 'blur' }],
  standardAnswer: [{ required: true, message: '必填项', trigger: 'blur' }]
}

onMounted(() => { fetchQuestions() })

const fetchQuestions = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/admin/question/page', { params: queryParams })
    questionList.value = res.records || []; total.value = res.total || 0
  } finally { loading.value = false }
}

const openAddDialog = () => {
  form.value = { id: null, subjectId: 1, questionType: 1, content: '', optionsJson: [{ key: 'A', val: '' }, { key: 'B', val: '' }, { key: 'C', val: '' }, { key: 'D', val: '' }], standardAnswer: '', difficulty: 2, analysis: '' }
  dialogVisible.value = true
}

const openEditDialog = (row: any) => {
  form.value = { ...row }
  if (typeof form.value.optionsJson === 'string') form.value.optionsJson = JSON.parse(form.value.optionsJson)
  dialogVisible.value = true
}

const addOption = () => {
  const nextChar = String.fromCharCode(65 + form.value.optionsJson.length)
  form.value.optionsJson.push({ key: nextChar, val: '' })
}
const removeOption = (index: number) => { form.value.optionsJson.splice(index, 1) }

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        await request[form.value.id ? 'put' : 'post'](form.value.id ? '/admin/question/update' : '/admin/question/add', form.value)
        ElMessage.success('操作成功'); dialogVisible.value = false; fetchQuestions()
      } finally { submitLoading.value = false }
    }
  })
}

const deleteQuestion = (id: string) => {
  ElMessageBox.confirm('是否将该题目移出活跃题库？', '归档确认', { confirmButtonText: '确定归档' }).then(async () => {
    await request.delete(`/admin/question/${id}`)
    ElMessage.success('已归档'); fetchQuestions()
  }).catch(() => {})
}

const handleLogout = () => { userStore.clearUserInfo(); router.replace('/login') }
</script>

<style scoped>
/* 继承通用顶部和基础样式 */
.admin-layout { min-height: 100vh; background-color: var(--bg-color-alt); }
.admin-topbar { height: 64px; background: #fff; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; padding: 0 40px; position: sticky; top: 0; z-index: 10; }
.brand { font-size: 18px; font-weight: 800; color: var(--text-main); margin: 0; letter-spacing: -0.5px; }
.badge { font-size: 12px; background: var(--bg-color-alt); padding: 4px 8px; border-radius: 4px; color: var(--text-muted); font-weight: normal; margin-left: 8px; }
.topbar-right { display: flex; align-items: center; gap: 24px; font-size: 14px; }
.nav-link { color: var(--text-muted); cursor: pointer; transition: color 0.2s; font-weight: 500; }
.nav-link:hover, .nav-link.active { color: var(--text-main); }
.divider { width: 1px; height: 16px; background: var(--border-color); }
.logout-btn { color: #ef4444; font-weight: 500; }
.admin-main { max-width: 1200px; margin: 40px auto; padding: 0 20px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
.header-titles h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; color: var(--text-main); }
.header-titles p { margin: 0; color: var(--text-muted); font-size: 15px; }
.action-btn { height: 40px; padding: 0 20px; font-weight: 500; }

/* 扁平化专有区域 */
.flat-filter-bar { display: flex; gap: 16px; margin-bottom: 24px; }
.filter-input { width: 240px; }
.flex-1 { flex: 1; }

.flat-panel { background: #fff; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; }
:deep(.modern-table) { --el-table-border-color: transparent; }
:deep(.modern-table th.el-table__cell) { background-color: #f8fafc; color: var(--text-muted); font-weight: 500; height: 50px; border-bottom: 1px solid var(--border-color); }
:deep(.modern-table td.el-table__cell) { border-bottom: 1px solid var(--border-color); height: 64px; }
:deep(.modern-table::before) { display: none; }
.type-tag { font-size: 12px; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; color: #475569; }
.truncate-text { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 14px; line-height: 1.6; color: var(--text-main); }
:deep(.mini-rate .el-rate__icon) { font-size: 14px; margin-right: 2px; }
.pagination-bar { padding: 20px; display: flex; justify-content: space-between; align-items: center; background: #fff; border-top: 1px solid var(--border-color); }

/* 动态选项样式 */
.options-container { width: 100%; border: 1px solid var(--border-color); padding: 16px; border-radius: 6px; background: #f8fafc; }
.option-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.opt-prefix { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid var(--border-color); border-radius: 4px; font-weight: 600; font-size: 14px; color: var(--text-muted); }
.opt-input { flex: 1; }
</style>