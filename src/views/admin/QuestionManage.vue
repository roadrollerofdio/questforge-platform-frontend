<template>
  <div class="question-manage h-full flex flex-col bg-[#f9fafb]">
    <!-- 头部操作区 (符合 Minimalist Professional 规范) -->
    <div class="flex justify-between items-end mb-8">
      <div>
        <h2 class="text-3xl font-bold text-[#111827] tracking-tight">题库管理</h2>
        <p class="text-sm text-[#6b7280] mt-2">管理系统所有基础试题与知识点</p>
      </div>
      <div class="flex space-x-4">
        <!-- 搜索与过滤 -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="fas fa-search text-gray-400"></i>
          </div>
          <input
              v-model="searchKeyword"
              @keyup.enter="fetchQuestions"
              type="text"
              class="block w-64 pl-10 pr-3 py-2.5 bg-white border border-[#e5e7eb] rounded-xl text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all shadow-sm"
              placeholder="搜索题目内容..."
          >
        </div>
        <!-- AI 按钮 -->
        <button @click="showAiModal = true" class="px-5 py-2.5 bg-white border border-[#e5e7eb] text-[#2563eb] rounded-xl hover:bg-blue-50 transition-all flex items-center shadow-sm font-medium">
          <i class="fas fa-magic mr-2"></i> 智能抽题
        </button>
        <!-- 新增按钮 -->
        <button @click="openEditModal()" class="px-5 py-2.5 bg-[#2563eb] text-white rounded-xl hover:bg-blue-700 transition-all flex items-center shadow-md shadow-blue-500/20 font-medium">
          <i class="fas fa-plus mr-2"></i> 录入试题
        </button>
      </div>
    </div>

    <!-- 数据表格区 (大白底、极细边框、高对比度) -->
    <div class="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] flex-1 overflow-hidden flex flex-col">
      <div class="overflow-x-auto flex-1">
        <table class="min-w-full divide-y divide-[#e5e7eb]">
          <thead class="bg-[#f9fafb]">
          <tr>
            <th scope="col" class="px-8 py-5 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider w-20">题号</th>
            <th scope="col" class="px-8 py-5 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider w-32">题型</th>
            <th scope="col" class="px-8 py-5 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider max-w-lg">题目内容</th>
            <th scope="col" class="px-8 py-5 text-right text-xs font-bold text-[#6b7280] uppercase tracking-wider w-32">操作</th>
          </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-50">
          <tr v-if="loading">
            <td colspan="4" class="px-8 py-16 text-center text-[#6b7280]">
              <i class="fas fa-circle-notch fa-spin text-2xl mb-3 text-[#2563eb]"></i>
              <p>数据加载中...</p>
            </td>
          </tr>
          <tr v-else-if="questions.length === 0">
            <td colspan="4" class="px-8 py-16 text-center text-[#6b7280]">暂无试题数据，请点击右上角录入或AI抽取</td>
          </tr>
          <tr v-else v-for="q in questions" :key="q.id" class="hover:bg-[#f9fafb] transition-colors group">
            <td class="px-8 py-5 whitespace-nowrap text-sm text-[#6b7280] font-mono">{{ q.id }}</td>
            <td class="px-8 py-5 whitespace-nowrap">
                <span class="px-3 py-1.5 inline-flex text-xs leading-none font-bold rounded-lg border"
                      :class="getTypeStyle(q.type)">
                  {{ getTypeName(q.type) }}
                </span>
            </td>
            <td class="px-8 py-5 text-sm text-[#111827] truncate max-w-lg font-medium">{{ q.content }}</td>
            <td class="px-8 py-5 whitespace-nowrap text-right text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">
              <button @click="openEditModal(q)" class="text-[#6b7280] hover:text-[#111827] mr-4 transition-colors">编辑</button>
              <button @click="deleteQuestion(q.id)" class="text-red-500 hover:text-red-700 transition-colors">删除</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页栏 -->
      <div class="bg-white px-8 py-4 border-t border-[#e5e7eb] flex items-center justify-between">
        <span class="text-sm text-[#6b7280]">共 <strong class="text-[#111827]">{{ total }}</strong> 项记录</span>
        <div class="flex space-x-2">
          <button @click="changePage(pageNo - 1)" :disabled="pageNo === 1" class="px-3 py-1.5 border border-[#e5e7eb] rounded-lg text-sm text-[#6b7280] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">上一页</button>
          <button class="px-3 py-1.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-sm text-[#111827] font-medium">{{ pageNo }}</button>
          <button @click="changePage(pageNo + 1)" :disabled="questions.length < 10" class="px-3 py-1.5 border border-[#e5e7eb] rounded-lg text-sm text-[#6b7280] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">下一页</button>
        </div>
      </div>
    </div>

    <!-- ================= 模态框：AI 智能抽题 ================= -->
    <div v-if="showAiModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 border border-gray-100 transform transition-all">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-[#111827] flex items-center">
            <div class="w-8 h-8 rounded-full bg-blue-100 text-[#2563eb] flex items-center justify-center mr-3">
              <i class="fas fa-magic"></i>
            </div>
            AI 知识抽取提炼
          </h3>
          <button @click="showAiModal = false" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <div class="space-y-5">
          <div>
            <label class="block text-sm font-bold text-[#111827] mb-2">目标题型声明</label>
            <input v-model="aiForm.typeDesc" type="text" class="w-full px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:bg-white transition-all text-sm" placeholder="例如：生成5道单选题，3道判断题...">
          </div>
          <div>
            <label class="block text-sm font-bold text-[#111827] mb-2">粘贴学习文档/业务资料</label>
            <textarea v-model="aiForm.document" rows="8" class="w-full px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:bg-white transition-all text-sm leading-relaxed text-[#111827]" placeholder="请将培训资料、大纲或整段文章粘贴于此，AI 将自动分析提取考点..."></textarea>
          </div>
        </div>

        <div class="mt-8 flex justify-end space-x-3">
          <button @click="showAiModal = false" class="px-6 py-2.5 bg-white border border-[#e5e7eb] rounded-xl text-[#6b7280] hover:bg-gray-50 font-medium transition-colors">取消</button>
          <button @click="generateByAi" :disabled="aiLoading" class="px-6 py-2.5 bg-[#2563eb] text-white rounded-xl hover:bg-blue-700 font-medium transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center">
            <i v-if="aiLoading" class="fas fa-circle-notch fa-spin mr-2"></i>
            {{ aiLoading ? '神经计算中...' : '提交给 AI 生成' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ================= 模态框：手动录入/编辑试题 ================= -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 border border-gray-100 max-h-[90vh] flex flex-col">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-[#111827]">{{ editForm.id ? '编辑试题' : '录入新试题' }}</h3>
          <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-6 pr-2">
          <!-- 题型选择 -->
          <div>
            <label class="block text-sm font-bold text-[#111827] mb-3">考核题型</label>
            <div class="flex space-x-4">
              <label v-for="(name, val) in {1:'单选题', 2:'多选题', 3:'判断题'}" :key="val"
                     class="flex items-center px-4 py-2.5 border rounded-xl cursor-pointer transition-all"
                     :class="editForm.type === Number(val) ? 'border-[#2563eb] bg-blue-50 text-[#2563eb]' : 'border-[#e5e7eb] text-[#6b7280] hover:bg-gray-50'">
                <input type="radio" :value="Number(val)" v-model="editForm.type" class="hidden">
                <span class="font-medium text-sm">{{ name }}</span>
              </label>
            </div>
          </div>

          <!-- 题干内容 -->
          <div>
            <label class="block text-sm font-bold text-[#111827] mb-2">题干内容</label>
            <textarea v-model="editForm.content" rows="4" class="w-full px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:bg-white text-sm"></textarea>
          </div>

          <!-- 选项设置 (针对单选/多选) -->
          <div v-if="editForm.type === 1 || editForm.type === 2">
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-bold text-[#111827]">选项设置 (JSON格式或逐条录入)</label>
              <button @click="addOption" class="text-sm text-[#2563eb] hover:underline">+ 新增选项</button>
            </div>
            <div class="space-y-3">
              <div v-for="(opt, index) in parsedOptions" :key="index" class="flex items-center space-x-3">
                <span class="font-mono text-[#6b7280] w-6">{{ String.fromCharCode(65 + index) }}</span>
                <input v-model="opt.text" type="text" class="flex-1 px-4 py-2 border border-[#e5e7eb] rounded-lg text-sm focus:ring-2 focus:ring-[#2563eb]">
                <!-- 设置为正确答案快捷操作 -->
                <button @click="toggleCorrectAnswer(String.fromCharCode(65 + index))" type="button"
                        class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors border"
                        :class="isCorrectAnswer(String.fromCharCode(65 + index)) ? 'bg-green-100 border-green-500 text-green-600' : 'bg-white border-gray-200 text-gray-300 hover:text-gray-500'">
                  <i class="fas fa-check"></i>
                </button>
                <button @click="removeOption(index)" class="text-red-400 hover:text-red-600 px-2"><i class="fas fa-trash-alt"></i></button>
              </div>
            </div>
          </div>

          <!-- 标准答案 -->
          <div>
            <label class="block text-sm font-bold text-[#111827] mb-2">标准答案</label>
            <input v-model="editForm.answer" type="text" class="w-full px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:bg-white text-sm font-mono" placeholder="单选填A，多选填A,B，判断填True/False">
            <p class="text-xs text-gray-400 mt-1">多选题请用英文逗号分隔（如 A,B,C）</p>
          </div>
        </div>

        <div class="mt-6 pt-6 border-t border-gray-100 flex justify-end space-x-3">
          <button @click="showEditModal = false" class="px-6 py-2.5 bg-white border border-[#e5e7eb] rounded-xl text-[#6b7280] font-medium">取消</button>
          <button @click="saveQuestion" :disabled="editLoading" class="px-6 py-2.5 bg-[#2563eb] text-white rounded-xl font-medium shadow-md shadow-blue-500/20 disabled:opacity-50">
            {{ editLoading ? '保存中...' : '确认保存' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import request from '@/utils/request'

// --- 列表状态 ---
const questions = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const pageNo = ref(1)
const searchKeyword = ref('')

// --- AI 抽题状态 ---
const showAiModal = ref(false)
const aiLoading = ref(false)
const aiForm = reactive({
  document: '',
  typeDesc: '生成3道单选题'
})

// --- 题目编辑/录入状态 ---
const showEditModal = ref(false)
const editLoading = ref(false)
const editForm = reactive({
  id: null as number | null,
  subjectId: 1, // 默认挂在某个根节点下
  type: 1,
  content: '',
  options: '[]',
  answer: ''
})
const parsedOptions = ref<{value: string, text: string}[]>([])

onMounted(() => {
  fetchQuestions()
})

const fetchQuestions = async () => {
  try {
    loading.value = true
    const res: any = await request.get('/admin/question/page', {
      params: {
        pageNo: pageNo.value,
        pageSize: 10,
        keyword: searchKeyword.value
      }
    })
    questions.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    console.error('获取列表失败', error)
  } finally {
    loading.value = false
  }
}

const changePage = (newPage: number) => {
  pageNo.value = newPage
  fetchQuestions()
}

// ================= 删除试题 =================
const deleteQuestion = async (id: number) => {
  if (!confirm('确定要永久删除这道基础题目吗？该操作不可逆。')) return
  try {
    await request.delete(`/admin/question/${id}`)
    fetchQuestions()
  } catch (error) {
    console.error('删除失败', error)
  }
}

// ================= AI 自动生成 =================
const generateByAi = async () => {
  if (!aiForm.document.trim()) return alert('请先输入学习文档或资料内容')

  try {
    aiLoading.value = true
    const res: any = await request.post('/admin/question/ai-generate', {
      documentText: aiForm.document,
      questionTypeDesc: aiForm.typeDesc
    })
    alert('AI出题成功！系统已自动解析入库，请刷新列表查看。')
    showAiModal.value = false
    fetchQuestions()
  } catch (error: any) {
    alert(error.message || '神经计算网络超时，请检查 AI 服务链接')
  } finally {
    aiLoading.value = false
  }
}

// ================= 手动编辑/新增试题 =================
const openEditModal = (q?: any) => {
  if (q) {
    editForm.id = q.id
    editForm.type = q.type
    editForm.content = q.content
    editForm.answer = q.answer
    editForm.subjectId = q.subjectId || 1
    try {
      parsedOptions.value = JSON.parse(q.options || '[]')
    } catch(e) { parsedOptions.value = [] }
  } else {
    // 新增重置
    editForm.id = null
    editForm.type = 1
    editForm.content = ''
    editForm.answer = ''
    parsedOptions.value = [
      { value: 'A', text: '选项 A' },
      { value: 'B', text: '选项 B' }
    ]
  }
  showEditModal.value = true
}

const addOption = () => {
  const nextChar = String.fromCharCode(65 + parsedOptions.value.length)
  parsedOptions.value.push({ value: nextChar, text: `新选项 ${nextChar}` })
}

const removeOption = (idx: number) => {
  parsedOptions.value.splice(idx, 1)
  // 重新排列 ABCD
  parsedOptions.value.forEach((opt, index) => {
    opt.value = String.fromCharCode(65 + index)
  })
}

const isCorrectAnswer = (val: string) => {
  if (!editForm.answer) return false
  return editForm.answer.split(',').includes(val)
}

const toggleCorrectAnswer = (val: string) => {
  if (editForm.type === 1) {
    editForm.answer = val // 单选覆盖
  } else if (editForm.type === 2) {
    let arr = editForm.answer ? editForm.answer.split(',') : []
    if (arr.includes(val)) {
      arr = arr.filter(v => v !== val && v !== '')
    } else {
      arr.push(val)
    }
    editForm.answer = arr.sort().join(',')
  }
}

const saveQuestion = async () => {
  if (!editForm.content) return alert('题干内容不能为空')

  try {
    editLoading.value = true
    const payload = {
      ...editForm,
      options: JSON.stringify(parsedOptions.value)
    }

    if (editForm.id) {
      await request.put('/admin/question/update', payload)
    } else {
      await request.post('/admin/question/add', payload)
    }

    showEditModal.value = false
    fetchQuestions()
  } catch(error: any) {
    alert(error.message || '保存失败')
  } finally {
    editLoading.value = false
  }
}

// --- 样式辅助函数 ---
const getTypeName = (type: number) => {
  return { 1: '单选', 2: '多选', 3: '判断' }[type] || '未知'
}

const getTypeStyle = (type: number) => {
  return {
    1: 'bg-blue-50 border-blue-200 text-blue-700',
    2: 'bg-purple-50 border-purple-200 text-purple-700',
    3: 'bg-amber-50 border-amber-200 text-amber-700'
  }[type] || 'bg-gray-50 border-gray-200 text-gray-700'
}
</script>

<style scoped>
/* 针对极简风格的输入框清除默认聚焦黑框 */
input:focus, textarea:focus {
  outline: none;
}
/* 优化滚动条表现 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
</style>