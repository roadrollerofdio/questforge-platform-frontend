<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm absolute inset-8 flex flex-col p-6 animate-fade-in font-sans antialiased">
    <!-- 列表视图 -->
    <template v-if="viewState === 'list'">
      <div class="flex justify-between items-center mb-6 shrink-0">
        <h2 class="text-xl font-bold text-gray-800">试卷大盘管理</h2>
        <button @click="startWizard" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center shadow-sm hover:bg-blue-700 transition-colors">
          <i class="fa-solid fa-plus mr-2"></i> 新建试卷向导
        </button>
      </div>

      <div class="flex-1 overflow-auto" v-loading="loading">
        <table class="w-full text-left border-collapse">
          <thead class="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">试卷名称</th>
            <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">总分/及格</th>
            <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">开放时间范围</th>
            <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">考试状态</th>
            <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 text-right">操作</th>
          </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
          <tr v-for="row in paperList" :key="row.id" class="hover:bg-gray-50 transition-colors group">
            <td class="px-4 py-4 text-sm font-bold text-gray-800">{{ row.title }}</td>
            <td class="px-4 py-4 text-sm text-gray-500 font-medium">{{ row.totalScore }} / {{ row.passScore }}</td>
            <td class="px-4 py-4 text-xs text-gray-500 font-medium">
              <!-- 使用兼容性更强的 formatTime 函数 -->
              <p>{{ formatTime(row.examStartTime) }}</p>
              <p class="text-gray-400">至 {{ formatTime(row.examEndTime) }}</p>
            </td>
            <td class="px-4 py-4 text-sm">
              <span v-if="row.paperStatus === 0" class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">草稿</span>
              <span v-else-if="row.paperStatus === 2" class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">已结束</span>
              <div v-else class="flex flex-col space-y-1">
                <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold w-fit"><i class="fa-solid fa-spinner fa-spin mr-1"></i>进行中</span>
                <span class="text-[10px] text-amber-600 font-bold whitespace-nowrap">{{ getRemainingTime(row) }}</span>
              </div>
            </td>
            <td class="px-4 py-4 text-sm text-right space-x-3 text-blue-600 font-medium">
              <button @click="viewDetails(row.id)" class="hover:text-blue-800 text-gray-500"><i class="fa-solid fa-eye"></i> 详情</button>
              <button v-if="row.paperStatus === 0" @click="publishPaper(row.id)" class="hover:text-blue-800 text-blue-600 font-bold"><i class="fa-solid fa-rocket"></i> 发布</button>
              <button v-if="row.paperStatus === 1" @click="endPaperEarly(row.id)" class="hover:text-red-700 text-red-500 font-bold"><i class="fa-solid fa-stop"></i> 结束</button>
              <button v-if="row.paperStatus === 1 || row.paperStatus === 2" @click="$router.push(`/admin/analysis/${row.id}`)" class="hover:text-green-700 text-green-600 font-bold"><i class="fa-solid fa-chart-pie"></i> 分析</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-4 flex justify-end"><el-pagination background layout="prev, pager, next" :total="total" v-model:current-page="pageNo" @current-change="fetchPapers" /></div>
    </template>

    <!-- 向导视图 -->
    <template v-else>
      <div class="mb-10 shrink-0 max-w-4xl mx-auto w-full">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <button @click="viewState = 'list'" class="mr-3 text-gray-400 hover:text-gray-700 transition-colors w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"><i class="fa-solid fa-xmark text-lg"></i></button>
          新建试卷向导
        </h2>
        <div class="flex items-center justify-between relative px-4">
          <div class="absolute left-4 right-4 top-1/2 transform -translate-y-1/2 h-1 bg-gray-100 -z-10 rounded"></div>
          <div class="absolute left-4 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 -z-10 transition-all duration-500 rounded" :style="{ width: `${((wizardStep - 1) / 3) * 100}%` }"></div>
          <div v-for="(label, idx) in ['基本及防作弊', '组卷策略', '预览提取', '完成保存']" :key="idx" class="flex flex-col items-center bg-white px-2">
            <div :class="`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${wizardStep > idx + 1 ? 'bg-blue-600 text-white' : wizardStep === idx + 1 ? 'bg-blue-600 text-white ring-4 ring-blue-100 scale-110' : 'bg-gray-200 text-gray-500'}`">
              <i v-if="wizardStep > idx + 1" class="fa-solid fa-check"></i><span v-else>{{ idx + 1 }}</span>
            </div>
            <span :class="`mt-3 text-xs font-bold ${wizardStep >= idx + 1 ? 'text-blue-700' : 'text-gray-400'}`">{{ label }}</span>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-auto px-2 max-w-4xl mx-auto w-full">
        <!-- Step 1: 基本信息与防作弊 -->
        <div v-if="wizardStep === 1" class="space-y-6 animate-fade-in max-w-2xl mx-auto pb-10">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">考核标题</label>
            <input v-model="paperForm.title" type="text" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="例如：2026年度评测" />
          </div>
          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">作答限时 (分钟)</label>
              <input v-model="paperForm.durationMins" type="number" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              <p class="text-xs text-gray-400 mt-1">进入考场后的倒计时</p>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">及格分数线</label>
              <input v-model="paperForm.passScore" type="number" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">考试开放时间段 (只有在这期间才能进入考试)</label>
            <el-date-picker v-model="timeRange" type="datetimerange" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" value-format="YYYY-MM-DD HH:mm:ss" class="!w-full" size="large" />
          </div>
          <div class="border border-gray-200 rounded-xl p-5 bg-gray-50/50 space-y-4">
            <h4 class="font-bold text-gray-800 text-sm border-l-4 border-blue-500 pl-2">防作弊规则</h4>
            <div class="flex items-center justify-between">
              <div><p class="font-bold text-gray-700 text-sm">允许考生中途退出重进</p><p class="text-xs text-gray-500">关闭后，只要离开考场页面即视为交卷</p></div>
              <el-switch v-model="paperForm.allowQuit" style="--el-switch-on-color: #10b981;" />
            </div>
            <div class="flex items-center justify-between">
              <div><p class="font-bold text-gray-700 text-sm">允许电脑屏幕切屏</p><p class="text-xs text-gray-500">关闭后，检测到浏览器切屏或息屏立即强制交卷</p></div>
              <el-switch v-model="paperForm.allowSwitchScreen" style="--el-switch-on-color: #10b981;" />
            </div>
          </div>
        </div>

        <!-- Step 2 -->
        <div v-if="wizardStep === 2" class="space-y-6 animate-fade-in max-w-3xl mx-auto">
          <h3 class="text-lg font-bold text-gray-800 mb-4 text-center">请选择试题组成方式</h3>
          <div class="grid grid-cols-2 gap-6">
            <label :class="`border-2 rounded-xl p-6 cursor-pointer flex flex-col items-center text-center shadow-sm relative overflow-hidden transition-all ${strategy === 'random' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`">
              <div class="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">推荐</div>
              <input type="radio" v-model="strategy" value="random" class="hidden" />
              <div :class="`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${strategy === 'random' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`"><i class="fa-solid fa-gear text-2xl"></i></div>
              <h4 class="font-bold text-gray-900 mb-2 text-lg">规则智能抽题</h4>
            </label>
            <label :class="`border-2 rounded-xl p-6 cursor-pointer flex flex-col items-center text-center transition-all ${strategy === 'manual' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`">
              <input type="radio" v-model="strategy" value="manual" class="hidden" />
              <div :class="`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${strategy === 'manual' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`"><i class="fa-solid fa-hand-pointer text-2xl"></i></div>
              <h4 class="font-bold text-gray-900 mb-2 text-lg">手动逐题挑选</h4>
            </label>
          </div>
        </div>

        <!-- Step 3 -->
        <div v-if="wizardStep === 3" class="space-y-4 animate-fade-in max-w-3xl mx-auto">
          <template v-if="strategy === 'random'">
            <label class="block text-sm font-bold text-gray-700 mb-2">指定抽取科目</label>
            <select v-model="paperForm.subjectId" class="w-full p-3 border border-gray-300 rounded-lg outline-none">
              <option :value="1">后端开发/Java</option><option :value="2">前端开发/Vue</option><option :value="3">数据库与缓存</option>
            </select>
          </template>
          <template v-else>
            <div class="flex justify-between items-center mb-2">
              <span class="font-bold text-gray-800">已选试题 <span class="text-blue-600 ml-2">总分: {{ computedTotalScore }} 分</span></span>
              <button @click="openLib" class="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded hover:bg-blue-200 text-sm">提取题库</button>
            </div>
            <el-table :data="paperForm.questionList" border class="w-full">
              <el-table-column type="index" label="#" width="50" />
              <el-table-column label="题干预览"><template #default="{ row }"><div class="truncate" v-html="row.content"></div></template></el-table-column>
              <el-table-column label="分值" width="120"><template #default="{ row }"><el-input-number v-model="row.itemScore" :min="1" size="small" /></template></el-table-column>
              <el-table-column width="60"><template #default="{ $index }"><button @click="paperForm.questionList.splice($index,1)" class="text-red-500"><i class="fa-solid fa-trash"></i></button></template></el-table-column>
            </el-table>
          </template>
        </div>

        <!-- Step 4 -->
        <div v-if="wizardStep === 4" class="flex flex-col items-center justify-center h-full animate-fade-in text-center space-y-5 py-10">
          <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center shadow-inner"><i class="fa-solid fa-circle-check text-5xl text-green-500"></i></div>
          <h3 class="text-3xl font-black text-gray-800">配置准备完毕！</h3>
        </div>
      </div>

      <div class="pt-6 mt-6 border-t border-gray-100 flex justify-between items-center bg-white shrink-0 max-w-4xl mx-auto w-full">
        <button v-if="wizardStep > 1" @click="wizardStep--" class="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">上一步</button>
        <div v-else></div>
        <button v-if="wizardStep < 4" @click="nextStep" class="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md">下一步</button>
        <button v-else @click="submitWizard" :loading="submitLoading" class="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md">保存试卷并退出</button>
      </div>
    </template>

    <!-- 弹窗：题库选择 -->
    <el-dialog v-model="libDialogVisible" title="题库提取" width="800px" append-to-body destroy-on-close>
      <el-table :data="libraryQuestions" v-loading="libLoading" @selection-change="tempSelectedQuestions = $event" height="350">
        <el-table-column type="selection" width="55" />
        <el-table-column label="题干"><template #default="{ row }"><div class="truncate max-w-lg" v-html="row.content"></div></template></el-table-column>
      </el-table>
      <div class="mt-4 flex justify-end"><el-pagination small background layout="prev, pager, next" :total="libTotal" v-model:current-page="libPageNo" @current-change="fetchLib" /></div>
      <template #footer><el-button type="primary" @click="confirmSelectQuestions">添加到试卷</el-button></template>
    </el-dialog>

    <!-- 弹窗：试卷详情预览 -->
    <el-dialog v-model="detailVisible" title="试卷详情及题目概览" width="800px">
      <div v-loading="detailLoading" v-if="paperDetail">
        <div class="bg-gray-50 p-4 rounded-lg mb-4 flex space-x-6 text-sm font-bold text-gray-700 border border-gray-200">
          <span>考核名称: {{ paperDetail.paper.title }}</span>
          <span>总分: {{ paperDetail.paper.totalScore }} 分</span>
          <span>时长: {{ paperDetail.paper.durationMins }} 分钟</span>
        </div>
        <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
          <div v-for="(q, idx) in paperDetail.questions" :key="q.questionId" class="border border-gray-200 rounded p-4">
            <div class="flex font-bold text-gray-800 text-sm mb-2"><span class="text-blue-600 mr-2">{{ idx + 1 }}.</span> <span v-html="q.content"></span> <span class="ml-2 text-gray-400">({{ q.itemScore }}分)</span></div>
            <div class="text-sm text-gray-600 mb-2 pl-6" v-if="q.optionsJson">选项: {{ JSON.stringify(q.optionsJson) }}</div>
            <div class="text-sm font-bold text-green-600 pl-6">标准答案: {{ q.standardAnswer }}</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const viewState = ref('list'); const wizardStep = ref(1); const strategy = ref('random')
const paperList = ref<any[]>([]); const loading = ref(false); const total = ref(0); const pageNo = ref(1)

const timeRange = ref<[string, string] | null>(null)
const paperForm = reactive({ title: '', durationMins: 120, passScore: 60, subjectId: 1, allowQuit: true, allowSwitchScreen: true, questionList: [] as any[] })
const computedTotalScore = computed(() => paperForm.questionList.reduce((sum, item) => sum + (item.itemScore || 0), 0))
const submitLoading = ref(false)

// 补齐弹窗和详情变量
const libDialogVisible = ref(false); const libLoading = ref(false); const libraryQuestions = ref<any[]>([])
const tempSelectedQuestions = ref<any[]>([]); const libPageNo = ref(1); const libTotal = ref(0)
const detailVisible = ref(false); const detailLoading = ref(false); const paperDetail = ref<any>(null)

onMounted(() => fetchPapers())

const fetchPapers = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/admin/paper/page', { params: { pageNo: pageNo.value, pageSize: 10 } });
    paperList.value = res.records || [];
    total.value = res.total || 0
  } finally { loading.value = false }
}

const formatTime = (time: any) => {
  if (!time) return '-'
  if (typeof time === 'string') return time.replace('T', ' ')
  if (Array.isArray(time)) {
    const pad = (n: number) => n < 10 ? '0' + n : n
    return `${time[0]}-${pad(time[1] || 1)}-${pad(time[2] || 1)} ${pad(time[3] || 0)}:${pad(time[4] || 0)}:${pad(time[5] || 0)}`
  }
  return String(time)
}

const getTimeMs = (time: any) => {
  if (!time) return 0
  if (typeof time === 'string') return new Date(time.replace(' ', 'T')).getTime()
  if (Array.isArray(time)) {
    return new Date(time[0], (time[1] || 1) - 1, time[2] || 1, time[3] || 0, time[4] || 0, time[5] || 0).getTime()
  }
  return new Date(time).getTime()
}

const getRemainingTime = (row: any) => {
  if (row.paperStatus !== 1 || !row.examEndTime) return ''
  const endTimeMs = getTimeMs(row.examEndTime)
  const diff = endTimeMs - Date.now()
  if (diff <= 0) return '已结束'
  return `距收卷 ${Math.floor(diff / 60000)} 分钟`
}

const endPaperEarly = (paperId: string) => {
  ElMessageBox.confirm('结束考试后，考生将无法继续答题。是否强制下线该试卷？', '结束考试确认', { type: 'error', confirmButtonText: '强制结束' }).then(async () => {
    await request.put(`/admin/paper/end/${paperId}`); ElMessage.success('考试已结束'); fetchPapers()
  }).catch(()=>{})
}

const publishPaper = (paperId: string) => {
  ElMessageBox.confirm('发布后试卷进入考试中状态，是否继续？', '发布确认').then(async () => { await request.put(`/admin/paper/publish/${paperId}`); ElMessage.success('发布成功'); fetchPapers() }).catch(()=>{})
}

const viewDetails = async (paperId: string) => {
  detailVisible.value = true; detailLoading.value = true
  try { paperDetail.value = await request.get(`/admin/paper/detail/${paperId}`) } finally { detailLoading.value = false }
}

const startWizard = () => { viewState.value = 'wizard'; wizardStep.value = 1; strategy.value = 'random'; paperForm.title=''; timeRange.value = null; paperForm.questionList=[] }

const nextStep = () => {
  if (wizardStep.value === 1) {
    if (!paperForm.title) return ElMessage.warning('请输入考核标题')
    if (!timeRange.value || timeRange.value.length !== 2) return ElMessage.warning('请选择考试开放时间范围')
  }
  if (wizardStep.value === 3 && strategy.value === 'manual' && paperForm.questionList.length === 0) return ElMessage.warning('请至少提取一道题目')
  wizardStep.value++
}

const openLib = () => { libDialogVisible.value = true; fetchLib() }
const fetchLib = async () => {
  libLoading.value = true; try { const res: any = await request.get('/admin/question/page', { params: { pageNo: libPageNo.value, pageSize: 10 } }); libraryQuestions.value = res.records || []; libTotal.value = res.total || 0 } finally { libLoading.value = false }
}

const confirmSelectQuestions = () => {
  tempSelectedQuestions.value.forEach(q => {
    if (!paperForm.questionList.find(item => item.questionId === q.id)) {
      paperForm.questionList.push({ questionId: q.id, content: q.content, itemScore: 5 })
    }
  });
  libDialogVisible.value = false
}

const submitWizard = async () => {
  submitLoading.value = true
  const payload = {
    ...paperForm,
    examStartTime: timeRange.value![0].replace(' ', 'T'),
    examEndTime: timeRange.value![1].replace(' ', 'T')
  }
  try {
    if (strategy.value === 'manual') {
      await request.post('/admin/paper/create', { ...payload, totalScore: computedTotalScore.value, questionList: paperForm.questionList.map((item, index) => ({ questionId: item.questionId, itemScore: item.itemScore, sortNum: index + 1 })) })
    } else {
      await request.post('/admin/paper/random-create', payload)
    }
    ElMessage.success('组卷完成'); viewState.value = 'list'; fetchPapers()
  } finally { submitLoading.value = false }
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>