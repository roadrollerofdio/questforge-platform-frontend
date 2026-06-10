<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm absolute inset-8 flex flex-col p-6 animate-fade-in font-sans antialiased">
    <div class="flex justify-between items-center mb-6 shrink-0">
      <h2 class="text-xl font-bold text-gray-800">系统人员与权限管理</h2>
      <div class="flex space-x-3">
        <div class="relative">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-gray-400 text-sm"></i>
          <input v-model="keyword" @keyup.enter="fetchUsers" type="text" placeholder="搜索用户名或真实姓名..." class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-64" />
        </div>
        <button @click="fetchUsers" class="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-lg text-sm font-bold">检索</button>
      </div>
    </div>

    <div class="flex-1 overflow-auto" v-loading="loading">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50 sticky top-0 z-10">
        <tr>
          <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">账号/ID</th>
          <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">真实姓名</th>
          <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">角色</th>
          <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">账号状态</th>
          <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">注册时间</th>
          <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 text-right">操作</th>
        </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
        <tr v-for="user in userList" :key="user.id" class="hover:bg-gray-50 transition-colors group">
          <td class="px-4 py-4">
            <div class="font-bold text-gray-800">{{ user.username }}</div>
            <div class="text-xs text-gray-400 font-mono">{{ user.id }}</div>
          </td>
          <td class="px-4 py-4 text-sm text-gray-700 font-medium">{{ user.realName || '-' }}</td>
          <td class="px-4 py-4 text-sm">
                          <span :class="`px-2 py-1 rounded text-xs font-bold ${user.roleCode === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-600'}`">
                            <i :class="`fa-solid mr-1 ${user.roleCode === 'ADMIN' ? 'fa-user-shield' : 'fa-user'}`"></i>
                            {{ user.roleCode === 'ADMIN' ? '管理员' : '普通考生' }}
                          </span>
          </td>
          <td class="px-4 py-4 text-sm">
                          <span :class="`flex items-center text-xs font-bold ${user.status === 1 ? 'text-green-600' : 'text-red-500'}`">
                             <div :class="`w-2 h-2 rounded-full mr-2 ${user.status === 1 ? 'bg-green-500' : 'bg-red-500'}`"></div>
                             {{ user.status === 1 ? '正常激活' : '已封禁' }}
                          </span>
          </td>
          <td class="px-4 py-4 text-sm text-gray-500 font-medium">{{ new Date(user.createTime).toLocaleString() }}</td>
          <td class="px-4 py-4 text-sm text-right space-x-3 font-medium">
            <button v-if="user.roleCode !== 'ADMIN'" @click="toggleStatus(user)" :class="`hover:underline ${user.status === 1 ? 'text-red-500' : 'text-green-600'}`">
              {{ user.status === 1 ? '封禁账号' : '解封恢复' }}
            </button>
            <span v-else class="text-gray-300 text-xs cursor-not-allowed">系统保护</span>
          </td>
        </tr>
        <tr v-if="!userList.length"><td colspan="6" class="text-center py-10 text-gray-400 font-bold">没有找到符合条件的用户</td></tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4 flex justify-end">
      <el-pagination background layout="total, prev, pager, next" :total="total" v-model:current-page="pageNo" @current-change="fetchUsers" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const userList = ref<any[]>([]); const loading = ref(false)
const total = ref(0); const pageNo = ref(1); const keyword = ref('')

onMounted(() => fetchUsers())

const fetchUsers = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/admin/user/page', { params: { pageNo: pageNo.value, pageSize: 10, keyword: keyword.value } })
    userList.value = res.records || []; total.value = res.total || 0
  } finally { loading.value = false }
}

const toggleStatus = (user: any) => {
  const newStatus = user.status === 1 ? 0 : 1
  const actionText = newStatus === 0 ? '封禁' : '解封'
  ElMessageBox.confirm(`确定要 ${actionText} 考生 [${user.realName || user.username}] 吗？`, '权限调整', { type: 'warning', confirmButtonText: '确定' }).then(async () => {
    await request.put('/admin/user/status', { id: user.id, status: newStatus })
    ElMessage.success(`${actionText}成功`); fetchUsers()
  }).catch(()=>{})
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>