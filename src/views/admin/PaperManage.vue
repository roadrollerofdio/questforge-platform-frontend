<template>
  <div class="h-full flex flex-col bg-[#f9fafb]">
    <!-- 头部操作区 -->
    <div class="flex justify-between items-end mb-8">
      <div>
        <h2 class="text-3xl font-bold text-[#111827] tracking-tight">学习路线图管理</h2>
        <p class="text-sm text-[#6b7280] mt-2">创建学习项目 → 编排关卡 → 绑定题目 → 发布上线</p>
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
            <th scope="col" class="px-8 py-5 text-right text-xs font-bold text-[#6b7280] uppercase tracking-wider w-56">操作</th>
          </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-50">
          <tr v-if="loading">
            <td colspan="5" class="px-8 py-16 text-center text-[#6b7280]">
              <i class="fas fa-circle-notch fa-spin text-2xl mb-3 text-[#2563eb]"></i><p>数据加载中...</p>
            </td>
          </tr>
          <tr v-else-if="projects.length === 0">
            <td colspan="5" class="px-8 py-16 text-center text-[#6b7280]">
              <i class="fas fa-route text-3xl mb-3 text-gray-300"></i>
              <p>暂无学习项目，点击右上角「创建学习项目」开始</p>
            </td>
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
              <button @click.stop="goAnalysis(p)" class="text-indigo-600 hover:text-indigo-800 mr-3 font-bold">
                <i class="fas fa-chart-line mr-1"></i>学情分析
              </button>
              <button @click.stop="openStageManage(p)" class="text-[#2563eb] hover:text-blue-800 mr-3 font-bold">
                <i class="fas fa-sitemap mr-1"></i>关卡编排
              </button>
              <button @click.stop="toggleProjectStatus(p)" class="text-[#6b7280] hover:text-[#111827] mr-3">
                {{ p.status === 0 ? '发布' : '下线' }}
              </button>
              <button @click.stop="deleteProject(p)" class="text-red-400 hover:text-red-600" title="删除项目">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 模态框：创建学习项目 -->
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

    <!-- 抽屉：关卡编排中心 -->
    <div v-if="showStageModal" class="fixed inset-0 z-50 flex items-center justify-end bg-gray-900/40 backdrop-blur-sm">
      <div class="bg-white w-full max-w-4xl h-full shadow-2xl flex flex-col border-l border-gray-200">
        <!-- 头部 -->
        <div class="p-6 border-b border-gray-100 bg-gray-50">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-xl font-bold text-[#111827]">关卡编排中心</h3>
              <p class="text-sm text-[#6b7280] mt-1">{{ currentProject?.title }}</p>
            </div>
            <button @click="showStageModal = false" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-2xl"></i></button>
          </div>

          <!-- 引导步骤条 -->
          <div class="mt-5 flex items-center space-x-2">
            <div v-for="(step, idx) in guideSteps" :key="idx" class="flex items-center flex-1">
              <div class="flex items-center space-x-2 flex-1">
                <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                     :class="step.done ? 'bg-green-500 text-white' : (step.active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500')">
                  <i v-if="step.done" class="fas fa-check text-xs"></i>
                  <span v-else>{{ idx + 1 }}</span>
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-bold truncate" :class="step.active ? 'text-blue-700' : 'text-gray-600'">{{ step.title }}</p>
                  <p class="text-[10px] text-gray-400 truncate hidden sm:block">{{ step.desc }}</p>
                </div>
              </div>
              <i v-if="idx < guideSteps.length - 1" class="fas fa-chevron-right text-gray-300 text-xs mx-1 shrink-0"></i>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6 bg-[#f9fafb]">
          <!-- 提示卡片 -->
          <div class="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start space-x-3">
            <i class="fas fa-lightbulb text-blue-500 mt-0.5"></i>
            <div class="text-sm text-blue-800">
              <p class="font-bold mb-1">编排指引</p>
              <p class="text-blue-700 text-xs leading-relaxed">
                ① 按顺序添加关卡（如 Level 1、Level 2）→ ② 为每个关卡绑定题库中的试题 → ③ 确认每关至少 1 道题后，返回列表点击「发布」上线。
              </p>
            </div>
          </div>

          <!-- 添加/编辑关卡表单 -->
          <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
            <h4 class="font-bold text-[#111827] mb-4 flex items-center">
              <i class="fas fa-plus-circle text-green-500 mr-2"></i>
              {{ editingStageId ? '编辑关卡' : '添加新关卡' }}
            </h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
              <div class="col-span-2">
                <label class="block text-xs text-gray-500 mb-1">关卡名称 *</label>
                <input v-model="stageForm.stageName" type="text" class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500" placeholder="例如：Level 1 - 基础理论">
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">排序号</label>
                <input v-model.number="stageForm.sortOrder" type="number" min="1" class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">及格分</label>
                <input v-model.number="stageForm.passScoreThreshold" type="number" min="0" class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">关卡类型</label>
                <select v-model.number="stageForm.stageType" class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500">
                  <option :value="1">图文学习</option>
                  <option :value="2">考核挑战</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">通关宝石奖励 💎</label>
                <input v-model.number="stageForm.gemReward" type="number" min="0" class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500">
              </div>
              <div class="col-span-2 sm:col-span-3 flex space-x-2">
                <button @click="saveStage" :disabled="stageSaving" class="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-50">
                  {{ stageSaving ? '保存中...' : (editingStageId ? '保存修改' : '添加关卡') }}
                </button>
                <button v-if="editingStageId" @click="cancelEditStage" class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">取消编辑</button>
              </div>
            </div>
          </div>

          <!-- 关卡列表 -->
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-bold text-[#111827]">已配置的关卡序列 <span class="text-gray-400 font-normal text-sm">({{ stages.length }} 个)</span></h4>
          </div>

          <div v-if="stageLoading" class="text-center py-10 text-gray-400">
            <i class="fas fa-circle-notch fa-spin mr-2"></i>加载关卡中...
          </div>
          <div v-else-if="stages.length === 0" class="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed">
            <i class="fas fa-layer-group text-3xl mb-3 text-gray-300"></i>
            <p class="text-sm">暂无关卡，请在上方添加第一个关卡</p>
          </div>

          <div v-else class="space-y-4">
            <div v-for="st in stages" :key="st.id" class="bg-white border rounded-xl overflow-hidden shadow-sm"
                 :class="expandedStageId === st.id ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200'">
              <!-- 关卡头部 -->
              <div class="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center cursor-pointer" @click="toggleExpandStage(st)">
                <div class="flex items-center space-x-3 min-w-0">
                  <span class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">{{ st.sortOrder }}</span>
                  <div class="min-w-0">
                    <span class="font-bold text-[#111827]">{{ st.stageName }}</span>
                    <span class="ml-2 text-xs px-2 py-0.5 rounded-full" :class="st.stageType === 1 ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'">
                      {{ st.stageType === 1 ? '学习' : '考核' }}
                    </span>
                    <p class="text-xs text-gray-400 mt-0.5">及格 {{ st.passScoreThreshold }} 分 · 总分 {{ st.totalScore || 0 }} 分 · 💎 {{ st.gemReward ?? 10 }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2 shrink-0" @click.stop>
                  <button @click="startEditStage(st)" class="text-xs text-gray-500 hover:text-gray-800 px-2 py-1"><i class="fas fa-edit"></i></button>
                  <button @click="confirmDeleteStage(st)" class="text-xs text-red-400 hover:text-red-600 px-2 py-1"><i class="fas fa-trash-alt"></i></button>
                  <button @click="openBindQuestionModal(st)" class="text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1">
                    <i class="fas fa-plus mr-1"></i>添加题目
                  </button>
                  <i class="fas fa-chevron-down text-gray-400 text-xs transition-transform ml-1" :class="expandedStageId === st.id ? 'rotate-180' : ''"></i>
                </div>
              </div>

              <!-- 展开：已绑定题目 -->
              <div v-if="expandedStageId === st.id" class="p-4">
                <div v-if="stageItemsLoading[st.id]" class="text-center py-4 text-gray-400 text-sm">
                  <i class="fas fa-circle-notch fa-spin mr-1"></i>加载题目...
                </div>
                <div v-else-if="!(stageItems[st.id]?.length)" class="text-center py-6 bg-gray-50 rounded-lg border border-dashed">
                  <p class="text-sm text-gray-400">此关卡暂无题目</p>
                  <button @click="openBindQuestionModal(st)" class="mt-2 text-sm text-blue-600 hover:underline">点击添加第一道题目</button>
                </div>
                <div v-else class="space-y-2">
                  <div v-for="item in stageItems[st.id]" :key="item.refId"
                       class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group/item">
                    <div class="flex items-center space-x-3 min-w-0 flex-1">
                      <span class="text-xs font-mono text-gray-400 shrink-0">#{{ item.itemId }}</span>
                      <span class="text-xs px-2 py-0.5 rounded bg-white border shrink-0">{{ getTypeName(item.questionType) }}</span>
                      <span class="text-sm text-gray-700 truncate">{{ item.content || '（题目内容）' }}</span>
                    </div>
                    <div class="flex items-center space-x-3 shrink-0 ml-3">
                      <span class="text-xs font-bold text-blue-600">{{ item.scoreWeight }} 分</span>
                      <button @click="confirmUnbindItem(st, item)" class="text-red-400 hover:text-red-600 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <i class="fas fa-unlink text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模态框：绑定试题 -->
    <div v-if="showBindModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-100 max-h-[85vh] flex flex-col">
        <h3 class="text-lg font-bold mb-1">为关卡添加题目</h3>
        <p class="text-sm text-blue-600 mb-4">{{ currentStage?.stageName }}</p>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-1 text-gray-700">搜索题库</label>
          <div class="flex space-x-2">
            <input v-model="questionSearch" @keyup.enter="searchQuestions" type="text"
                   class="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500" placeholder="输入关键词搜索题目...">
            <button @click="searchQuestions" class="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">搜索</button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto mb-4 border rounded-lg divide-y max-h-60">
          <div v-if="questionSearchLoading" class="p-4 text-center text-gray-400 text-sm">搜索中...</div>
          <div v-else-if="questionCandidates.length === 0" class="p-4 text-center text-gray-400 text-sm">输入关键词搜索，或留空浏览最新题目</div>
          <div v-for="q in questionCandidates" :key="q.id" @click="selectQuestion(q)"
               class="p-3 cursor-pointer hover:bg-blue-50 flex items-center space-x-3"
               :class="bindForm.itemId === q.id ? 'bg-blue-50 ring-1 ring-blue-300' : ''">
            <span class="text-xs font-mono text-gray-400 shrink-0">#{{ q.id }}</span>
            <span class="text-xs px-1.5 py-0.5 rounded border shrink-0">{{ getTypeName(q.type) }}</span>
            <span class="text-sm truncate">{{ q.content }}</span>
          </div>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700">已选题目 ID</label>
            <input v-model.number="bindForm.itemId" type="number" class="w-full px-3 py-2 border rounded-lg text-sm" placeholder="也可手动输入题目 ID">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700">本题分值</label>
            <input v-model.number="bindForm.scoreWeight" type="number" min="1" class="w-full px-3 py-2 border rounded-lg text-sm">
          </div>
        </div>
        <div class="mt-5 flex justify-end space-x-2">
          <button @click="showBindModal = false" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">取消</button>
          <button @click="submitBind" :disabled="bindLoading" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold disabled:opacity-50">
            {{ bindLoading ? '处理中...' : '确认绑定' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const projects = ref<any[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const pageNo = ref(1)

const showProjectModal = ref(false)
const submitLoading = ref(false)
const projectForm = reactive({ title: '', startTime: '', endTime: '' })

const showStageModal = ref(false)
const currentProject = ref<any>(null)
const stages = ref<any[]>([])
const stageLoading = ref(false)
const stageSaving = ref(false)
const editingStageId = ref<number | null>(null)
const expandedStageId = ref<number | null>(null)
const stageItems = reactive<Record<number, any[]>>({})
const stageItemsLoading = reactive<Record<number, boolean>>({})

const stageForm = reactive({
  stageName: '',
  sortOrder: 1,
  passScoreThreshold: 60,
  stageType: 2,
  gemReward: 10
})

const showBindModal = ref(false)
const currentStage = ref<any>(null)
const bindLoading = ref(false)
const bindForm = reactive({ itemId: null as number | null, scoreWeight: 5 })
const questionSearch = ref('')
const questionSearchLoading = ref(false)
const questionCandidates = ref<any[]>([])

const guideSteps = computed(() => {
  const hasStages = stages.value.length > 0
  const hasQuestions = Object.values(stageItems).some(items => items && items.length > 0)
  return [
    { title: '添加关卡', desc: '按顺序创建学习/考核关卡', done: hasStages, active: !hasStages },
    { title: '绑定题目', desc: '为每个关卡添加试题', done: hasQuestions, active: hasStages && !hasQuestions },
    { title: '发布上线', desc: '返回列表点击发布', done: currentProject.value?.status === 1, active: hasStages && hasQuestions && currentProject.value?.status !== 1 }
  ]
})

onMounted(() => fetchProjects())

const fetchProjects = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/admin/project/page', {
      params: { pageNo: pageNo.value, pageSize: 10, keyword: searchKeyword.value || undefined }
    })
    projects.value = res?.records || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const openProjectModal = () => {
  projectForm.title = ''
  projectForm.startTime = ''
  projectForm.endTime = ''
  showProjectModal.value = true
}

const saveProject = async () => {
  if (!projectForm.title) return ElMessage.warning('项目名称不能为空')
  submitLoading.value = true
  try {
    await request.post('/admin/project/create', {
      title: projectForm.title,
      startTime: projectForm.startTime || null,
      endTime: projectForm.endTime || null
    })
    ElMessage.success('学习项目创建成功，请点击「关卡编排」添加关卡')
    showProjectModal.value = false
    fetchProjects()
  } catch (e: any) { console.error(e) }
  finally { submitLoading.value = false }
}

const toggleProjectStatus = async (p: any) => {
  try {
    if (p.status === 0) {
      await request.put(`/admin/project/${p.id}/publish`)
      ElMessage.success('项目已发布')
    } else {
      await request.put('/admin/project/status', { id: p.id, status: 0 })
      ElMessage.success('项目已下线')
    }
    fetchProjects()
    if (currentProject.value?.id === p.id) {
      currentProject.value = { ...p, status: p.status === 0 ? 1 : 0 }
    }
  } catch (e: any) { console.error(e) }
}

const deleteProject = async (p: any) => {
  try {
    await ElMessageBox.confirm(
        `确定删除学习项目「${p.title}」吗？关联的关卡和题目绑定将一并删除，此操作不可恢复。`,
        '删除确认',
        { confirmButtonText: '确认删除', cancelButtonText: '取消', type: 'warning' }
    )
    await request.delete(`/admin/project/${p.id}`)
    ElMessage.success('项目已删除')
    if (currentProject.value?.id === p.id) {
      showStageModal.value = false
      currentProject.value = null
    }
    fetchProjects()
  } catch (e: any) {
    if (e !== 'cancel' && e?.message !== 'cancel') {
      console.error('删除项目失败', e)
    }
  }
}

const goAnalysis = (p: any) => {
  router.push(`/admin/analysis/${p.id}`)
}

const openStageManage = async (p: any) => {
  currentProject.value = p
  editingStageId.value = null
  expandedStageId.value = null
  resetStageForm()
  showStageModal.value = true
  await loadStages()
}

const loadStages = async () => {
  if (!currentProject.value) return
  stageLoading.value = true
  try {
    stages.value = await request.get(`/admin/project/${currentProject.value.id}/stages`) as any[] || []
    stageForm.sortOrder = stages.value.length + 1
  } catch (e) { console.error(e) }
  finally { stageLoading.value = false }
}

const resetStageForm = () => {
  stageForm.stageName = ''
  stageForm.sortOrder = stages.value.length + 1
  stageForm.passScoreThreshold = 60
  stageForm.stageType = 2
  stageForm.gemReward = 10
}

const saveStage = async () => {
  if (!stageForm.stageName?.trim()) return ElMessage.warning('关卡名称不能为空')
  if (!currentProject.value?.id) return ElMessage.error('未选择学习项目，请关闭后重新打开关卡编排')
  stageSaving.value = true
  try {
    if (editingStageId.value) {
      await request.put(`/admin/project/stage/${editingStageId.value}`, { ...stageForm, stageName: stageForm.stageName.trim() })
      ElMessage.success('关卡已更新')
      editingStageId.value = null
    } else {
      await request.post('/admin/project/stage/add', {
        projectId: currentProject.value.id,
        ...stageForm,
        stageName: stageForm.stageName.trim()
      })
      ElMessage.success('关卡添加成功，请展开关卡绑定题目')
    }
    resetStageForm()
    await loadStages()
  } catch (e) {
    console.error('保存关卡失败', e)
  } finally {
    stageSaving.value = false
  }
}

const startEditStage = (st: any) => {
  editingStageId.value = st.id
  stageForm.stageName = st.stageName
  stageForm.sortOrder = st.sortOrder
  stageForm.passScoreThreshold = st.passScoreThreshold
  stageForm.stageType = st.stageType || 2
  stageForm.gemReward = st.gemReward ?? 10
}

const cancelEditStage = () => {
  editingStageId.value = null
  resetStageForm()
}

const confirmDeleteStage = async (st: any) => {
  try {
    await ElMessageBox.confirm(`确定删除关卡「${st.stageName}」吗？已绑定的题目将一并解除。`, '删除确认', { type: 'warning' })
    await request.delete(`/admin/project/stage/${st.id}`)
    ElMessage.success('关卡已删除')
    if (expandedStageId.value === st.id) expandedStageId.value = null
    delete stageItems[st.id]
    if (editingStageId.value === st.id) cancelEditStage()
    await loadStages()
  } catch (e) { /* cancelled */ }
}

const toggleExpandStage = async (st: any) => {
  expandedStageId.value = expandedStageId.value === st.id ? null : st.id
  if (expandedStageId.value === st.id) {
    await loadStageItems(st.id)
  }
}

const loadStageItems = async (stageId: number) => {
  stageItemsLoading[stageId] = true
  try {
    stageItems[stageId] = await request.get(`/admin/project/stage/${stageId}/items`) as any[] || []
  } catch (e) { console.error(e) }
  finally { stageItemsLoading[stageId] = false }
}

const openBindQuestionModal = async (st: any) => {
  currentStage.value = st
  bindForm.itemId = null
  bindForm.scoreWeight = 5
  questionSearch.value = ''
  questionCandidates.value = []
  showBindModal.value = true
  await searchQuestions()
}

const searchQuestions = async () => {
  questionSearchLoading.value = true
  try {
    const res: any = await request.get('/admin/question/page', {
      params: { pageNo: 1, pageSize: 20, keyword: questionSearch.value || undefined }
    })
    questionCandidates.value = res?.records || []
  } catch (e) { console.error(e) }
  finally { questionSearchLoading.value = false }
}

const selectQuestion = (q: any) => {
  bindForm.itemId = q.id
}

const submitBind = async () => {
  if (!bindForm.itemId) return ElMessage.warning('请选择或输入题目 ID')
  bindLoading.value = true
  try {
    await request.post('/admin/project/stage/items', {
      stageId: currentStage.value.id,
      itemId: bindForm.itemId,
      itemType: 2,
      scoreWeight: bindForm.scoreWeight
    })
    ElMessage.success('题目绑定成功')
    showBindModal.value = false
    expandedStageId.value = currentStage.value.id
    await loadStageItems(currentStage.value.id)
    await loadStages()
  } catch (e) { console.error(e) }
  finally { bindLoading.value = false }
}

const confirmUnbindItem = async (st: any, item: any) => {
  try {
    await ElMessageBox.confirm('确定从此关卡移除该题目吗？', '解除绑定', { type: 'warning' })
    await request.delete(`/admin/project/stage/items/${item.refId}`)
    ElMessage.success('已移除题目')
    await loadStageItems(st.id)
    await loadStages()
  } catch (e) { /* cancelled */ }
}

const getStatusName = (s: number) => ({ 0: '未发布', 1: '进行中', 2: '已结束' }[s] || '未知')
const getStatusStyle = (s: number) => ({ 0: 'bg-gray-100 text-gray-600 border-gray-200', 1: 'bg-green-100 text-green-700 border-green-200', 2: 'bg-red-100 text-red-700 border-red-200' }[s])
const getTypeName = (t: number) => ({ 1: '单选', 2: '多选', 3: '判断', 4: '填空', 5: '简答' }[t] || '未知')
const formatDate = (d: string) => d ? new Date(d).toLocaleString() : '无限制'
</script>
