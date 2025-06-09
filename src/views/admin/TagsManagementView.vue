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
        <el-table-column prop="name" label="标签名称" sortable />
        <el-table-column prop="description" label="描述" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.description || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="articleCount" label="文章数量" width="120" sortable align="center" />
        <el-table-column prop="createTime" label="创建时间" width="180" sortable>
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" :icon="EditIcon" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" :icon="DeleteIcon"
              @click="handleDeleteTag(scope.row.id)">删除</el-button>
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
import { Search as SearchIcon, Plus as PlusIcon, Edit as EditIcon, Delete as DeleteIcon } from '@element-plus/icons-vue';

interface BlogTag {
  id: string;
  name: string;
  description?: string; // Description might be optional for tags
  articleCount: number;
  createTime: Date;
}

// --- 响应式状态 ---
const allTags = ref<BlogTag[]>([]);
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
  description: string; // Keep description in form, can be empty
}>({
  id: null,
  name: '',
  description: '',
});

const tagFormRules = reactive<FormRules>({
  name: [{ required: true, message: '标签名称不能为空', trigger: 'blur' }],
});

// --- API Service Placeholders ---
const apiClient = {
  async getTags(params: { page: number, pageSize: number, query?: string }): Promise<{ data: BlogTag[], total: number }> {
    console.log('API CALL: getTags with params', params);
    await new Promise(resolve => setTimeout(resolve, 500));
    let items = allTags.value; // Simulate with local data for now
    if (params.query) {
      const lowerQuery = params.query.toLowerCase();
      items = items.filter(tag => tag.name.toLowerCase().includes(lowerQuery));
    }
    // This part will be simpler when the backend handles pagination and filtering.
    // const total = items.length;
    // const start = (params.page - 1) * params.pageSize;
    // const end = start + params.pageSize;
    // return { data: items.slice(start, end), total };
    return { data: generateMockData(40, params.query), total: 40 }; // Simplified for mock
  },
  async createTag(data: { name: string, description?: string }): Promise<BlogTag> {
    console.log('API CALL: createTag with data', data);
    await new Promise(resolve => setTimeout(resolve, 300));
    const newTag: BlogTag = { ...data, id: `tag-api-${Date.now()}`, articleCount: 0, createTime: new Date() };
    return newTag;
  },
  async updateTag(id: string, data: { name: string, description?: string }): Promise<BlogTag> {
    console.log('API CALL: updateTag with id and data', id, data);
    await new Promise(resolve => setTimeout(resolve, 300));
    const updatedTag: BlogTag = { ...data, id, articleCount: Math.floor(Math.random() * 30), createTime: new Date() };
    return updatedTag;
  },
  async deleteTag(id: string): Promise<void> {
    console.log('API CALL: deleteTag with id', id);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
};

// --- Mock 数据生成 ---
const generateMockData = (count: number = 40, query?: string): BlogTag[] => {
  const tags: BlogTag[] = [];
  const sampleNames = ['Vue', 'React', 'Angular', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java', 'Spring Boot', 'Docker', 'Kubernetes', 'DevOps', 'CI/CD', 'Algorithm', 'Data Structure'];
  for (let i = 0; i < count; i++) {
    const name = `${sampleNames[Math.floor(Math.random() * sampleNames.length)]}${Math.random() > 0.7 ? ` ${i + 1}` : ''}`;
    tags.push({
      id: `tag-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${i}`,
      name: name,
      description: Math.random() > 0.5 ? `关于 ${name} 的一些描述信息。` : undefined,
      articleCount: Math.floor(Math.random() * 50),
      createTime: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 60)), // 最近60天内的随机日期
    });
  }
  let result = tags.sort((a, b) => b.createTime.getTime() - a.createTime.getTime());
  if (query) {
    const lowerQuery = query.toLowerCase();
    result = result.filter(tag => tag.name.toLowerCase().includes(lowerQuery));
  }
  return result;
};

// --- Data Fetching ---
const fetchTags = async () => {
  loading.value = true;
  try {
    // const response = await apiClient.getTags({ page: currentPage.value, pageSize: pageSize.value, query: searchQuery.value });
    // allTags.value = response.data;
    // totalTags.value = response.total; // The API should return the total count

    allTags.value = generateMockData(40, searchQuery.value); // Mock data
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    ElMessage.error('获取标签列表失败！');
    allTags.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  allTags.value = generateMockData(); // Initial mock load
  // fetchTags(); // Uncomment for API placeholder
});

// --- 计算属性 ---
const filteredTags = computed(() => {
  if (!searchQuery.value.trim()) {
    return allTags.value;
  }
  const lowerSearchQuery = searchQuery.value.toLowerCase();
  return allTags.value.filter(tag =>
    tag.name.toLowerCase().includes(lowerSearchQuery)
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
  tagForm.value = { id: null, name: '', description: '' };
  dialogVisible.value = true;
  nextTick(() => {
    tagFormRef.value?.clearValidate();
  });
};

const openEditDialog = (tag: BlogTag) => {
  dialogTitle.value = '编辑标签';
  tagForm.value = { id: tag.id, name: tag.name, description: tag.description || '' };
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
      description: tagForm.value.description.trim() || undefined, // Send undefined if empty
    };

    if (tagForm.value.id) { // Edit mode
      // const updatedTag = await apiClient.updateTag(tagForm.value.id, dataToSubmit);
      // const index = allTags.value.findIndex(t => t.id === updatedTag.id);
      // if (index !== -1) allTags.value[index] = updatedTag; else fetchTags();
      // ElMessage.success('标签更新成功！');
      const index = allTags.value.findIndex(t => t.id === tagForm.value.id);
      if (index !== -1) allTags.value[index] = { ...allTags.value[index], ...dataToSubmit };
      ElMessage.success('标签更新成功 (Mock)！');
    } else { // Add mode
      // const newTag = await apiClient.createTag(dataToSubmit);
      // allTags.value.unshift(newTag); // Or fetchTags();
      // ElMessage.success('标签添加成功！');
      const newMockTag: BlogTag = { ...dataToSubmit, id: `tag-mock-${Date.now()}`, articleCount: 0, createTime: new Date() };
      allTags.value.unshift(newMockTag);
      ElMessage.success('标签添加成功 (Mock)！');
    }
    closeDialog();
    // fetchTags(); // Re-fetch after add/edit
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
      // await apiClient.deleteTag(tagId);
      // ElMessage.success('标签删除成功！');
      // fetchTags();

      allTags.value = allTags.value.filter(t => t.id !== tagId);
      if (paginatedTags.value.length === 0 && currentPage.value > 1 && totalTags.value > 0) {
        currentPage.value--;
      } else if (paginatedTags.value.length === 0 && totalTags.value === 0) {
        currentPage.value = 1;
      }
      ElMessage.success('标签删除成功 (Mock)！');
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
  // fetchTags();
};

const handleCurrentPageChange = (val: number) => {
  currentPage.value = val;
  // fetchTags();
};

const formatDate = (date: Date | string): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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