<template>
  <div class="bg-white rounded-xl border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-bold text-gray-800 text-base">
        <i class="fas fa-store text-blue-500 mr-2"></i>宝石小店商品
      </h3>
      <el-button type="primary" @click="openEdit()">
        <i class="fas fa-plus mr-1"></i>上架新商品
      </el-button>
    </div>

    <p class="text-xs text-gray-400 mb-4">
      商品对应用户端内置的虚拟形象装扮部件, 用户购买后可在个人信息页穿戴。
    </p>

    <el-table :data="items" v-loading="loading" stripe>
      <el-table-column label="预览" width="110" align="center">
        <template #default="{ row }">
          <div class="flex justify-center">
            <AvatarRender :config="previewConfig(row)" :size="64" :rounded="false"/>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="商品名称" min-width="140"/>
      <el-table-column label="部位" width="100">
        <template #default="{ row }">
          <el-tag size="small">{{ SLOT_LABELS[row.slot] || row.slot }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="svgKey" label="部件 Key" width="140">
        <template #default="{ row }">
          <code class="text-xs text-gray-500">{{ row.svgKey }}</code>
        </template>
      </el-table-column>
      <el-table-column label="价格" width="110" align="center">
        <template #default="{ row }">
          <span class="font-bold text-blue-500">💎 {{ row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '上架中' : '已下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openEdit(row)">改价</el-button>
          <el-button link :type="row.status === 1 ? 'warning' : 'success'" size="small" @click="toggleStatus(row)">
            {{ row.status === 1 ? '下架' : '上架' }}
          </el-button>
          <el-button link type="danger" size="small" @click="removeItem(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- ===== 编辑/上架弹窗 ===== -->
    <el-dialog v-model="showEdit" :title="editForm.id ? '编辑商品' : '上架新商品'" width="520px">
      <el-form label-width="90px">
        <el-form-item label="装扮部件" required>
          <el-select v-model="editForm.svgKey" :disabled="!!editForm.id" filterable style="width: 100%"
                     placeholder="从内置部件库选择" @change="onPartChange">
            <el-option v-for="(meta, key) in DECOR_PARTS" :key="key" :value="key"
                       :label="`${meta.name} (${SLOT_LABELS[meta.slot]})`"/>
          </el-select>
        </el-form-item>
        <el-form-item label="预览" v-if="editForm.svgKey">
          <AvatarRender :config="previewByKey(editForm.svgKey)" :size="100" :rounded="false"/>
        </el-form-item>
        <el-form-item label="商品名称" required>
          <el-input v-model="editForm.name" maxlength="30"/>
        </el-form-item>
        <el-form-item label="宝石价格" required>
          <el-input-number v-model="editForm.price" :min="0" :max="99999"/>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="editForm.status" :active-value="1" :inactive-value="0"
                     active-text="上架" inactive-text="下架"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEdit = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveItem">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import AvatarRender from '@/components/AvatarRender.vue'
import { DECOR_PARTS, SLOT_LABELS, DEFAULT_AVATAR } from '@/avatar/parts'

const items = ref<any[]>([])
const loading = ref(false)
const showEdit = ref(false)
const saving = ref(false)
const editForm = reactive<any>({ id: null, name: '', slot: '', svgKey: '', price: 50, status: 1 })

const previewConfig = (row: any) => ({ ...DEFAULT_AVATAR, [row.slot]: row.svgKey })
const previewByKey = (key: string) => {
  const meta = DECOR_PARTS[key]
  return meta ? { ...DEFAULT_AVATAR, [meta.slot]: key } : { ...DEFAULT_AVATAR }
}

const onPartChange = (key: string) => {
  const meta = DECOR_PARTS[key]
  if (meta) {
    editForm.slot = meta.slot
    if (!editForm.name) editForm.name = meta.name
  }
}

const loadItems = async () => {
  try {
    loading.value = true
    items.value = (await request.get('/admin/shop/items')) as any[] || []
  } catch (e) { console.error(e) } finally { loading.value = false }
}

const openEdit = (row?: any) => {
  if (row) {
    Object.assign(editForm, { id: row.id, name: row.name, slot: row.slot, svgKey: row.svgKey, price: row.price, status: row.status })
  } else {
    Object.assign(editForm, { id: null, name: '', slot: '', svgKey: '', price: 50, status: 1 })
  }
  showEdit.value = true
}

const saveItem = async () => {
  if (!editForm.svgKey) return ElMessage.warning('请选择装扮部件')
  if (!editForm.name?.trim()) return ElMessage.warning('商品名称不能为空')
  try {
    saving.value = true
    await request.post('/admin/shop/items/save', { ...editForm, name: editForm.name.trim() })
    ElMessage.success('商品已保存')
    showEdit.value = false
    await loadItems()
  } catch (e) { /* 拦截器弹错 */ } finally { saving.value = false }
}

const toggleStatus = async (row: any) => {
  const next = row.status === 1 ? 0 : 1
  try {
    await request.put(`/admin/shop/items/${row.id}/status`, null, { params: { status: next } })
    ElMessage.success(next === 1 ? '已上架' : '已下架')
    await loadItems()
  } catch (e) { /* 拦截器弹错 */ }
}

const removeItem = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确认删除商品「${row.name}」?`, '删除确认', { type: 'warning' })
    await request.delete(`/admin/shop/items/${row.id}`)
    ElMessage.success('已删除')
    await loadItems()
  } catch (e) { /* 取消或失败 */ }
}

onMounted(loadItems)
</script>
