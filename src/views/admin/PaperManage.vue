<template>
  <div class="h-full flex flex-col bg-[#f9fafb]">
    <!-- 头部操作区 -->
    <div class="flex justify-between items-end mb-8">
      <div>
        <h2 class="text-3xl font-bold text-[#111827] tracking-tight">学习路线图管理</h2>
        <p class="text-sm text-[#6b7280] mt-2">统筹管理学习项目、分阶关卡及题目绑定配置</p>
      </div>
      <div class="flex space-x-4">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="fas fa-search text-gray-400"></i>
          </div>
          <input
              v-model="searchKeyword"
              @keyup.enter="fetchProjects"
              type="text"
              class="block w-64 pl-10 pr-3 py-2.5 bg-white border border-[#e5e7eb] rounded-xl text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all shadow-sm"
              placeholder="搜索项目名称..."
          >
        </div>
        <button @click="openProjectModal()" class="px-5 py-2.5 bg-[#2563eb] text-white rounded-xl hover:bg-blue-700 transition-all flex items-center shadow-md font-medium">
          <i class="fas fa-plus mr-2"></i> 创建学习项目
        </button>
      </div>
    </div>

    <!-- 数据表格区 -->
    <div class="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] flex-1 overflow-hidden flex flex-col">
      <div class="overflow-x-auto flex-1">
        <table class="min-w-full divide-y divide-[#e5e7eb]">
          <thead class="bg-[#f9fafb]">
          <tr>
            <th scope="col" class="px-8 py-5 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider w-24">项目 ID</th>
            <th scope="col" class="px-8 py-5 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">项目/路线名称</th>
            <th scope="col" class="px-8 py-5 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider w-32">状态</th>
            <th scope="col" class="px-8 py-5 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider w-64">开放周期</th>
            <th scope="col" class="px-8 py-5 text-right text-xs font-bold text-[#6b7280] uppercase tracking-wider w-48">关卡编排与操作</th>
          </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-50">
          <tr v-if="loading">
            <td colspan="5" class="px-8 py-16 text-center text-[#6b7280]">
              <i class="fas fa-circle-notch fa-spin text-2xl mb-3 text-[#2563eb]"></i><p>数据加载中...</p>
            </td>
          </tr>
          <tr v-else-if="projects.length === 0">
            <td colspan="5" class="px-8 py-16 text-center text-[#6b7280]">暂无学习项目数据</td>
          </tr>
          <tr v-else v-for="p in projects" :key="p.id" class="hover:bg-[#f9fafb] transition-colors group">
            <td class="px-8 py-5 text-sm text-[#6b7280] font-mono">{{ p.id }}</td>
            <td class="px-8 py-5 text-sm font-bold text-[#111827]">{{ p.title }}</td>
            <td class="px-8 py-5">
                <span class="px-3 py-1 text-xs font-bold rounded-full border" :class="getStatusStyle(p.status)">
                  {{ getStatusName(p.status) }}
                </span>
            </td>
            <td class="px-8 py-5 text-xs text-[#6b7280]">
              <div>起: {{ formatDate(p.startTime) }}</div>
              <div class="mt-1">止: {{ formatDate(p.endTime) }}</div>
            </td>
            <td class="px-8 py-5 text-right text-sm font-medium">
              <!-- 核心：编排关卡入口 -->
              <button @click="openStageManage(p)" class="text-[#2563eb] hover:text-blue-800 mr-4 font-bold">
                <i class="fas fa-sitemap mr-1"></i>关卡编排
              </button>
              <button @click="toggleProjectStatus(p)" class="text-[#6b7280] hover:text-[#111827] mr-4">
                {{ p.status === 0 ? '发布' : '下线' }}
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ================= 模态框：创建/编辑学习项目 ================= -->
    <div v-if="showProjectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-gray-100">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-[#111827]">新建学习项目 (路线图)</h3>
          <button @click="showProjectModal = false" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-xl"></i></button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-[#111827] mb-2">项目名称</label>
            <input v-model="projectForm.title" type="text" class="w-full px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#2563eb]" placeholder="例如：2026年度前端架构师晋升考核">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-[#111827] mb-2">开放时间</label>
              <input v-model="projectForm.startTime" type="datetime-local" class="w-full px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#2563eb] text-sm">
            </div>
            <div>
              <label class="block text-sm font-bold text-[#111827] mb-2">截止时间</label>
              <input v-model="projectForm.endTime" type="datetime-local" class="w-full px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#2563eb] text-sm">
            </div>
          </div>
        </div>
        <div class="mt-8 flex justify-end space-x-3">
          <button @click="showProjectModal = false" class="px-6 py-2.5 bg-white border border-[#e5e7eb] rounded-xl text-[#6b7280] font-medium">取消</button>
          <button @click="saveProject" :disabled="submitLoading" class="px-6 py-2.5 bg-[#2563eb] text-white rounded-xl font-medium shadow-md disabled:opacity-50">
            {{ submitLoading ? '保存中...' : '确认创建' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ================= 抽屉/模态框：关卡编排与题目绑定 (Stage Management) ================= -->
    <div v-if="showStageModal" class="fixed inset-0 z-50 flex items-center justify-end bg-gray-900/40 backdrop-blur-sm">
      <div class="bg-white w-full max-w-3xl h-full shadow-2xl flex flex-col transform transition-transform border-l border-gray-200">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 class="text-xl font-bold text-[#111827]">关卡编排中心</h3>
            <p class="text-sm text-[#6b7280] mt-1 font-mono">当前项目: {{ currentProject?.title }}</p>
          </div>
          <button @click="showStageModal = false" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-2xl"></i></button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 bg-[#f9fafb]">
          <!-- 新建关卡表单 -->
          <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
            <h4 class="font-bold text-[#111827] mb-4 flex items-center"><i class="fas fa-plus-circle text-green-500 mr-2"></i>添加新关卡 (Stage)</h4>
            <div class="flex space-x-3 items-end">
              <div class="flex-1">
                <label class="block text-xs text-gray-500 mb-1">关卡名称</label>
                <input v-model="stageForm.stageName" type="text" class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500" placeholder="例如：Level 1 - 基础理论">
              </div>
              <div class="w-24">
                <label class="block text-xs text-gray-500 mb-1">排序号</label>
                <input v-model="stageForm.sortOrder" type="number" class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500">
              </div>
              <div class="w-24">
                <label class="block text-xs text-gray-500 mb-1">及格分</label>
                <input v-model="stageForm.passScoreThreshold" type="number" class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500">
              </div>
              <button @click="addStage" class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 h-[38px]">
                添加
              </button>
            </div>
          </div>

          <!-- 已有关卡列表 -->
          <h4 class="font-bold text-[#111827] mb-3">已配置的关卡序列</h4>
          <div v-if="stages.length === 0" class="text-center py-10 text-gray-400 text-sm bg-white rounded-xl border border-dashed">
            暂无配置关卡，请在上方添加
          </div>
          <div class="space-y-4">
            <div v-for="st in stages" :key="st.id" class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div class="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <div class="flex items-center space-x-3">
                  <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">{{ st.sortOrder }}</span>
                  <span class="font-bold text-[#111827]">{{ st.stageName }}</span>
                  <span class="text-xs text-gray-500 font-mono">StageID: {{ st.id }} | 及格: {{ st.passScoreThreshold }}分</span>
                </div>
                <button @click="openBindQuestionModal(st)" class="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  <i class="fas fa-link mr-1"></i>绑定试题
                </button>
              </div>
              <div class="p-4 bg-white">
                <p class="text-xs text-gray-500 mb-2">已绑定试题 (简略显示)：</p>
                <!-- 这里为了简化前端，省略了二次拉取该关卡具体题目的列表，实际可通过接口获取 -->
                <p class="text-sm text-gray-400 italic">请点击“绑定试题”管理此关卡物料。若要移除，请在单独接口操作。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= 模态框：为特定关卡绑定试题 ================= -->
    <!-- 依赖于后端的 /api/admin/project/stage/items 接口 -->
    <div v-if="showBindModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100">
        <h3 class="text-lg font-bold mb-4">绑定试题至: <span class="text-blue-600">{{ currentStage?.stageName }}</span></h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700">基础题库中的试题 ID (Question ID)</label>
            <input v-model="bindForm.itemId" type="number" class="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500" placeholder="请输入已录入的试题ID">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700">本题在本关卡的分值 (Score)</label>
            <input v-model="bindForm.scoreWeight" type="number" class="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500" placeholder="例如: 5">
          </div>
        </div>
        <div class="mt-6 flex justify-end space-x-2">
          <button @click="showBindModal = false" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">取消</button>
          <button @click="submitBind" :disabled="bindLoading" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">
            {{ bindLoading ? '处理中...' : '确认绑定' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import request from '@/utils/request'

// --- 项目列表 ---
const projects = ref<any[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const pageNo = ref(1)

// --- 项目表单 ---
const showProjectModal = ref(false)
const submitLoading = ref(false)
const projectForm = reactive({ title: '', startTime: '', endTime: '' })

// --- 关卡编排 ---
const showStageModal = ref(false)
const currentProject = ref<any>(null)
const stages = ref<any[]>([])
const stageForm = reactive({ stageName: '', sortOrder: 1, passScoreThreshold: 60 })

// --- 绑定题目 ---
const showBindModal = ref(false)
const currentStage = ref<any>(null)
const bindLoading = ref(false)
const bindForm = reactive({ itemId: null as number|null, scoreWeight: 5 })

onMounted(() => fetchProjects())

const fetchProjects = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/admin/project/page', { params: { pageNo: pageNo.value, pageSize: 10 } })
    projects.value = res.data.records
  } catch(e) { console.error(e) }
  finally { loading.value = false }
}

const openProjectModal = () => {
  projectForm.title = ''
  showProjectModal.value = true
}

const saveProject = async () => {
  if(!projectForm.title) return alert('名称不能为空')
  submitLoading.value = true
  try {
    // 适配后端 ProjectCreateReq (包含创建时默认生成几个关卡的功能)
    await request.post('/admin/project/create', {
      title: projectForm.title,
      startTime: projectForm.startTime || null,
      endTime: projectForm.endTime || null,
      stageCount: 0 // 手动创建，不默认生成
    })
    showProjectModal.value = false
    fetchProjects()
  } catch(e:any) { alert(e.message) }
  finally { submitLoading.value = false }
}

const toggleProjectStatus = async (p: any) => {
  try {
    const nextStatus = p.status === 0 ? 1 : 0
    await request.put('/admin/project/status', { id: p.id, status: nextStatus })
    fetchProjects()
  } catch(e:any) { alert('更新状态失败:'+e.message) }
}

// 打开特定项目的关卡编排抽屉
const openStageManage = async (p: any) => {
  currentProject.value = p
  stageForm.sortOrder = 1
  stageForm.stageName = ''
  showStageModal.value = true
  // 这里暂时用前端过滤模拟，实际应调用后端的根据 projectId 查询 Stage 的接口
  // 假设我们增加一个查询接口 /api/admin/project/{id}/stages
  // 由于现存代码后端未暴露纯粹的按项目查stage，可自行补充，此处仅作框架展示
  stages.value = [] // 真实场景需赋值 res.data
}

// 往项目中添加一个新关卡
const addStage = async () => {
  if(!stageForm.stageName) return alert('关卡名为空')
  try {
    // 此处需要后端配合 AdminProjectController 提供单独增加 Stage 的接口。
    // 如果无，可通过批量创建接口覆盖。为演示逻辑闭环，此处假设后端提供了 /admin/project/stage/add
    // await request.post('/admin/project/stage/add', { projectId: currentProject.value.id, ...stageForm })

    // 模拟成功添加到列表
    stages.value.push({
      id: Math.floor(Math.random() * 10000),
      stageName: stageForm.stageName,
      sortOrder: stageForm.sortOrder,
      passScoreThreshold: stageForm.passScoreThreshold
    })
    stageForm.sortOrder++
    stageForm.stageName = ''
  } catch(e:any) { alert('添加关卡失败') }
}

const openBindQuestionModal = (st: any) => {
  currentStage.value = st
  bindForm.itemId = null
  showBindModal.value = true
}

const submitBind = async () => {
  if(!bindForm.itemId) return alert('试题 ID 必填')
  bindLoading.value = true
  try {
    await request.post('/admin/project/stage/items', {
      stageId: currentStage.value.id,
      itemId: bindForm.itemId,
      itemType: 2, // 2代表试题
      scoreWeight: bindForm.scoreWeight
    })
    alert('绑定成功')
    showBindModal.value = false
  } catch(e:any) { alert(e.message || '绑定失败，检查题号是否正确') }
  finally { bindLoading.value = false }
}

// --- 辅助 ---
const getStatusName = (s: number) => ({0:'未发布', 1:'进行中', 2:'已结束'}[s] || '未知')
const getStatusStyle = (s: number) => ({0:'bg-gray-100 text-gray-600', 1:'bg-green-100 text-green-700', 2:'bg-red-100 text-red-700'}[s])
const formatDate = (d: string) => d ? new Date(d).toLocaleString() : '无限制'
</script>