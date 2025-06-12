<template>
  <div class="tags-management">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>博客标签管理</span>
        </div>
      </template>

      <!-- 操作区域 -->
      <el-row :gutter="20" class="actions-bar" justify="space-between" align="middle">
        <el-col :xs="24" :sm="12" :md="8">
          <el-input v-model="searchQuery" placeholder="搜索标签名称..." :prefix-icon="SearchIcon" clearable />
        </el-col>
        <el-col :xs="24" :sm="12" :md="4" class="add-button-col">
          <el-button type="primary" @click="openAddDialog" :icon="PlusIcon">添加标签</el-button>
        </el-col>
      </el-row>

      <!-- 添加/编辑标签弹窗 -->
      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="clamp(300px, 50%, 500px)" @close="closeDialog"
        draggable>
        <el-form :model="tagForm" ref="tagFormRef" :rules="tagFormRules" label-width="80px">
          <el-form-item label="标签名称" prop="name">
            <el-input v-model="tagForm.name" placeholder="请输入标签名称" />
          </el-form-item>
          <el-form-item label="标签图标" prop="icon">
            <el-input v-model="tagForm.icon" placeholder="请输入图标名称/类名 (可选)" />
          </el-form-item>
          <!-- Tags might not have descriptions, or it's optional. Adjust as needed. -->
          <el-form-item label="标签描述" prop="description">
            <el-input v-model="tagForm.description" type="textarea" placeholder="请输入标签描述 (可选)" :rows="3" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="formSubmitting">确认</el-button>
        </template>
      </el-dialog>

      <!-- 标签列表 -->
      <el-table :data="paginatedTags" style="width: 100%; margin-top: 20px;" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID (部分)" width="150">
          <template #default="scope">
            {{ scope.row.id.substring(0, 8) }}...
          </template>
        </el-table-column>
        <el-table-column label="图标" width="80" align="center">
          <template #default="scope"><span v-if="scope.row.icon"><Icon :icon="scope.row.icon" /></span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="标签名称" sortable />
        <el-table-column prop="description" label="描述" show-overflow-tooltip min-width="200">
          <template #default="scope">
            {{ scope.row.description || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="postCount" label="文章数量" width="120" sortable align="center" />
        <el-table-column prop="createdAt" label="创建时间" width="180" sortable>
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" :icon="EditIcon" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" :icon="DeleteIcon" @click="handleDeleteTag(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无数据" />
        </template>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container" v-if="totalPages > 0">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper" :total="totalTags" @size-change="handlePageSizeChange"
          @current-change="handleCurrentPageChange" background />
      </div>
    </el-card>
  </div>
</template>

<script lang='ts' setup>
import { ref, computed, onMounted, reactive, nextTick } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Icon } from '@iconify/vue';
import { Search as SearchIcon, Plus as PlusIcon, Edit as EditIcon, Delete as DeleteIcon } from '@element-plus/icons-vue';
// --- 类型定义导入 ---
import type { ITag, CreateTagDTO, UpdateTagDTO, QueryTagDTO, TagResult } from '@/types/tag.type';
// --- API 函数导入 ---
import { getAllTags, addTag, updateTag, deleteTag } from '@/api/tag.api';
// --- 工具函数导入 ---
import { formatDate } from '@/utils/commonUtils';

// --- 响应式状态 ---
const allTags = ref<ITag[]>([]);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const formSubmitting = ref(false);

const dialogVisible = ref(false);
const dialogTitle = ref('');
const tagFormRef = ref<FormInstance>();
const tagForm = ref<{
  id: string | null;
  name: string;
  icon: string;
  description: string; // Keep description in form, can be empty
}>({
  id: null,
  name: '',
  icon: '',
  description: '',
});

const tagFormRules = reactive<FormRules>({
  name: [{ required: true, message: '标签名称不能为空', trigger: 'blur' }],
});

// --- API 客户端封装 ---
const apiClient = {
  async getTags(params: QueryTagDTO): Promise<TagResult | null> {
    const response = await getAllTags(params);
    return response;
  },
  async createTag(data: CreateTagDTO): Promise<ITag | null> {
    console.log('API CALL: createTag with data', data);
    return await addTag(data);
  },
  async updateTag(id: string, data: UpdateTagDTO): Promise<ITag | null> {
    console.log('API CALL: updateTag with id and data', id, data);
    return await updateTag(id, data);
  },
  async deleteTag(id: string): Promise<boolean> {
    console.log('API CALL: deleteTag with id', id);
    return await deleteTag(id);
  }
};

// --- Data Fetching ---
const fetchTags = async () => {
  loading.value = true;
  try {
    const response = await apiClient.getTags({
      page: currentPage.value,
      pageSize: pageSize.value,
      query: searchQuery.value.trim(),
    });
    allTags.value = response?.tags || [];
    // totalTags computed property will use allTags.length if backend doesn't provide total for client-side pagination
    // If backend provides total for server-side pagination, you'd use response.total here.
    // For client-side pagination after fetching ALL tags:
    // currentPage.value = 1; // Reset to first page if fetching all data
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    ElMessage.error('获取标签列表失败！');
    allTags.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTags(); // Fetch tags when component is mounted
});

// --- 计算属性 ---
const filteredTags = computed(() => {
  if (!searchQuery.value.trim()) {
    return allTags.value;
  }
  const lowerSearchQuery = searchQuery.value.toLowerCase();
  return allTags.value.filter(tag =>
    tag.name.toLowerCase().includes(lowerSearchQuery) ||
    (tag.description && tag.description.toLowerCase().includes(lowerSearchQuery))
  );
});

const totalTags = computed(() => filteredTags.value.length);

const paginatedTags = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTags.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(totalTags.value / pageSize.value));

// --- 方法 ---
const openAddDialog = () => {
  dialogTitle.value = '添加新标签';
  tagForm.value = { id: null, name: '', icon: '', description: '' };
  dialogVisible.value = true;
  nextTick(() => {
    tagFormRef.value?.clearValidate();
  });
};

const openEditDialog = (tag: ITag) => {
  dialogTitle.value = '编辑标签';
  tagForm.value = { id: tag.id, name: tag.name, icon: tag.icon || '', description: tag.description || '' };
  dialogVisible.value = true;
  nextTick(() => {
    tagFormRef.value?.clearValidate();
  });
};

const closeDialog = () => {
  dialogVisible.value = false;
  tagFormRef.value?.resetFields();
};

const submitForm = async () => {
  if (!tagFormRef.value) return;
  formSubmitting.value = true;

  try {
    const valid = await tagFormRef.value.validate();

    if (!valid) {
      ElMessage.error('请检查表单输入！');
      // formSubmitting will be reset in the finally block
      return;
    }

    const dataToSubmit = {
      name: tagForm.value.name.trim(),
      icon: tagForm.value.icon.trim(),
      description: tagForm.value.description.trim(), // Send undefined if empty
    }

    if (tagForm.value.id) { // Edit mode
      const updatedTag = await apiClient.updateTag(tagForm.value.id, dataToSubmit as UpdateTagDTO);
      if (updatedTag) {
        ElMessage.success('标签更新成功！');
        fetchTags();
      } else {
        ElMessage.error('标签更新失败！');
      }
    } else { // Add mode
      const newTag = await apiClient.createTag(dataToSubmit as CreateTagDTO);
      if (newTag) {
        newTag.postCount = 0;
        newTag.createdAt = formatDate(new Date());
        allTags.value.unshift(newTag); // Or fetchTags() if you prefer to reload all
        ElMessage.success('标签添加成功！');
      } else {
        ElMessage.error('标签添加失败！');
      }
    }
    closeDialog();
  } catch (error) {
+    ElMessage.error('操作失败，请重试。');
   } finally {
     formSubmitting.value = false;
   }
};

const handleDeleteTag = (tagId: string) => {
  ElMessageBox.confirm('确定要删除这个标签吗？', '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    loading.value = true;
    try {
      const success = await apiClient.deleteTag(tagId);
      if (success) {
        ElMessage.success('标签删除成功！');
        fetchTags(); // Re-fetch the list after deletion
      } else {
        ElMessage.error('删除标签失败！');
      }
    } catch (error) {
      console.error("Failed to delete tag:", error);
      ElMessage.error('删除标签失败！');
    } finally {
      loading.value = false;
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

const handlePageSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  fetchTags(); // Re-fetch with new page size
};

const handleCurrentPageChange = (val: number) => {
  currentPage.value = val;
  fetchTags(); // Re-fetch for the new page
};

</script>

<style scoped>
.tags-management {
  padding: 20px;
}

.actions-bar {
  margin-bottom: 20px;
}

.add-button-col {
  text-align: right;
}

/* Responsive adjustments for action bar */
@media (max-width: 768px) {
  .actions-bar .el-col {
    margin-bottom: 10px;
  }

  .add-button-col {
    text-align: left;
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 500;
}
</style>