<template>
  <div class="categories-management">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>博客类型管理</span>
        </div>
      </template>

      <!-- 操作区域 -->
      <el-row :gutter="20" class="actions-bar" justify="space-between" align="middle">
        <el-col :xs="24" :sm="12" :md="8">
          <el-input v-model="searchQuery" placeholder="搜索类型名称..." :prefix-icon="SearchIcon" clearable />
        </el-col>
        <el-col :xs="24" :sm="12" :md="4" class="add-button-col">
          <el-button type="primary" @click="openAddDialog" :icon="PlusIcon">添加类型</el-button>
        </el-col>
      </el-row>

      <!-- 添加/编辑类型弹窗 -->
      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="clamp(300px, 50%, 500px)" @close="closeDialog"
        draggable>
        <el-form :model="categoryForm" ref="categoryFormRef" :rules="categoryFormRules" label-width="80px">
          <el-form-item label="类型名称" prop="name">
            <el-input v-model="categoryForm.name" placeholder="请输入类型名称" />
          </el-form-item>
          <el-form-item label="类型描述" prop="description">
            <el-input v-model="categoryForm.description" type="textarea" placeholder="请输入类型描述" :rows="3" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="formSubmitting">确认</el-button>
        </template>
      </el-dialog>

      <!-- 类型列表 -->
      <el-table :data="paginatedCategories" style="width: 100%; margin-top: 20px;" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID (部分)" width="150">
          <template #default="scope">
            {{ scope.row.id.substring(0, 8) }}...
          </template>
        </el-table-column>
        <el-table-column prop="name" label="类型名称" sortable />
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
              @click="handleDeleteCategory(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无数据" />
        </template>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container" v-if="totalPages > 0">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper" :total="totalCategories" @size-change="handlePageSizeChange"
          @current-change="handleCurrentPageChange" background />
      </div>
    </el-card>
  </div>
</template>

<script lang='ts' setup>
import { ref, computed, onMounted, reactive, nextTick } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Search as SearchIcon, Plus as PlusIcon, Edit as EditIcon, Delete as DeleteIcon } from '@element-plus/icons-vue';

interface BlogCategory {
  id: string;
  name: string;
  description: string;
  articleCount: number;
  createTime: Date;
}

// --- 响应式状态 ---
const allCategories = ref<BlogCategory[]>([]);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const formSubmitting = ref(false);

const dialogVisible = ref(false);
const dialogTitle = ref('');
const categoryFormRef = ref<FormInstance>();
const categoryForm = ref<{
  id: string | null;
  name: string;
  description: string;
}>({
  id: null,
  name: '',
  description: '',
});

const categoryFormRules = reactive<FormRules>({
  name: [{ required: true, message: '类型名称不能为空', trigger: 'blur' }],
  // description: [{ required: false, message: '请输入描述', trigger: 'blur' }], // 描述可以为空
});

// --- API Service Placeholders ---
const apiClient = {
  async getCategories(params: { page: number, pageSize: number, query?: string }): Promise<{ data: BlogCategory[], total: number }> {
    console.log('API CALL: getCategories with params', params);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Simulate filtering and pagination on the mock data for now
    let items = allCategories.value;
    if (params.query) {
      const lowerQuery = params.query.toLowerCase();
      items = items.filter(cat => cat.name.toLowerCase().includes(lowerQuery));
    }
    // In a real API, the backend would handle pagination and filtering.
    // For this placeholder, we'll just return the locally filtered/paginated data.
    // This part will be simpler when the backend handles it.
    const total = items.length;
    // const start = (params.page - 1) * params.pageSize;
    // const end = start + params.pageSize;
    // return { data: items.slice(start, end), total };
    // For now, let's assume the mock data is the full dataset and we re-fetch it.
    return { data: generateMockData(35, params.query), total: 35 }; // Simplified for mock
  },
  async createCategory(data: { name: string, description: string }): Promise<BlogCategory> {
    console.log('API CALL: createCategory with data', data);
    await new Promise(resolve => setTimeout(resolve, 300));
    const newCategory: BlogCategory = { ...data, id: `cat-api-${Date.now()}`, articleCount: 0, createTime: new Date() };
    return newCategory;
  },
  async updateCategory(id: string, data: { name: string, description: string }): Promise<BlogCategory> {
    console.log('API CALL: updateCategory with id and data', id, data);
    await new Promise(resolve => setTimeout(resolve, 300));
    const updatedCategory: BlogCategory = { ...data, id, articleCount: Math.floor(Math.random() * 50), createTime: new Date() }; // articleCount and createTime would come from backend
    return updatedCategory;
  },
  async deleteCategory(id: string): Promise<void> {
    console.log('API CALL: deleteCategory with id', id);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
};

// --- Mock 数据生成 ---
const generateMockData = (count: number = 35, query?: string): BlogCategory[] => {
  const categories: BlogCategory[] = [];
  const sampleNames = ['技术栈', '生活感悟', '学习笔记', '项目实战', '旅行游记', '美食探店', '前端开发', '后端架构', '数据库', '人工智能'];
  for (let i = 0; i < count; i++) {
    categories.push({
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${i}`,
      name: `${sampleNames[Math.floor(Math.random() * sampleNames.length)]} ${i + 1}`,
      description: `这是关于 ${sampleNames[Math.floor(Math.random() * sampleNames.length)]} 的描述 ${i + 1}。内容随机生成，仅供演示。`,
      articleCount: Math.floor(Math.random() * 100),
      createTime: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)), // 最近30天内的随机日期
    });
  }
  let result = categories.sort((a, b) => b.createTime.getTime() - a.createTime.getTime());
  if (query) {
    const lowerQuery = query.toLowerCase();
    result = result.filter(cat => cat.name.toLowerCase().includes(lowerQuery));
  }
  return result;
};

// --- Data Fetching ---
const fetchCategories = async () => {
  loading.value = true;
  try {
    // When backend is ready, pagination and search query will be passed to the API
    // const response = await apiClient.getCategories({ page: currentPage.value, pageSize: pageSize.value, query: searchQuery.value });
    // allCategories.value = response.data;
    // totalCategories.value = response.total; // The API should return the total count for pagination

    // For now, using mock data generation directly for demonstration
    allCategories.value = generateMockData(35, searchQuery.value); // Mock data still used here
    // totalCategories will be computed based on allCategories.length for now
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    ElMessage.error('获取类型列表失败！');
    allCategories.value = []; // Clear data on error
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  allCategories.value = generateMockData(); // Initial mock load for local filtering demo
  // fetchCategories(); // Uncomment this when you want to use the API placeholder for initial load
});

// --- 计算属性 ---
const filteredCategories = computed(() => {
  if (!searchQuery.value.trim()) {
    return allCategories.value;
  }
  const lowerSearchQuery = searchQuery.value.toLowerCase();
  return allCategories.value.filter(category =>
    category.name.toLowerCase().includes(lowerSearchQuery)
  );
});

const totalCategories = computed(() => filteredCategories.value.length);

const paginatedCategories = computed(() => {
  // This local pagination will be less relevant when backend handles pagination
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredCategories.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(totalCategories.value / pageSize.value));

// --- 方法 ---

const openAddDialog = () => {
  dialogTitle.value = '添加新类型';
  categoryForm.value = { id: null, name: '', description: '' };
  dialogVisible.value = true;
  nextTick(() => {
    categoryFormRef.value?.clearValidate();
  });
};

const openEditDialog = (category: BlogCategory) => {
  dialogTitle.value = '编辑类型';
  // Create a new object for the form to avoid direct mutation of the table data
  categoryForm.value = { id: category.id, name: category.name, description: category.description };
  dialogVisible.value = true;
  nextTick(() => {
    categoryFormRef.value?.clearValidate();
  });
};

const closeDialog = () => {
  dialogVisible.value = false;
  // It's good practice to reset the form, though opening dialogs already sets new values
  categoryFormRef.value?.resetFields();
};

const submitForm = async () => {
  if (!categoryFormRef.value) return;
  formSubmitting.value = true;

  try {
    const valid = await categoryFormRef.value.validate();

    if (!valid) {
      ElMessage.error('请检查表单输入！');
      // formSubmitting will be reset in the finally block
      return;
    }

    const dataToSubmit = {
      name: categoryForm.value.name.trim(),
      description: categoryForm.value.description.trim(),
    };

    if (categoryForm.value.id) { // Edit mode
      // const updatedCategory = await apiClient.updateCategory(categoryForm.value.id, dataToSubmit);
      // const index = allCategories.value.findIndex(cat => cat.id === updatedCategory.id);
      // if (index !== -1) allCategories.value[index] = updatedCategory; else fetchCategories(); // or update locally
      // ElMessage.success('类型更新成功！');
      // Mock update:
      const index = allCategories.value.findIndex(cat => cat.id === categoryForm.value.id);
      if (index !== -1) allCategories.value[index] = { ...allCategories.value[index], ...dataToSubmit };
      ElMessage.success('类型更新成功 (Mock)！');
    } else { // Add mode
      // const newCategory = await apiClient.createCategory(dataToSubmit);
      // allCategories.value.unshift(newCategory); // Or re-fetch: fetchCategories();
      // ElMessage.success('类型添加成功！');
      // Mock add:
      const newMockCategory: BlogCategory = { ...dataToSubmit, id: `cat-mock-${Date.now()}`, articleCount: 0, createTime: new Date() };
      allCategories.value.unshift(newMockCategory);
      ElMessage.success('类型添加成功 (Mock)！');
    }
    closeDialog();
    // fetchCategories(); // Re-fetch data after add/edit to ensure consistency if not updating locally
  } catch (error) {
    ElMessage.error('操作失败，请重试。');
  } finally {
    formSubmitting.value = false; // Ensure this is always called
  }
};

const handleDeleteCategory = (categoryId: string) => {
  ElMessageBox.confirm(
    '确定要删除这个类型吗？相关的文章可能需要额外处理。',
    '警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    loading.value = true; // Show loading for delete operation
    try {
      // await apiClient.deleteCategory(categoryId);
      // ElMessage.success('类型删除成功！');
      // fetchCategories(); // Re-fetch the list

      // Mock delete:
      allCategories.value = allCategories.value.filter(cat => cat.id !== categoryId);
      if (paginatedCategories.value.length === 0 && currentPage.value > 1 && totalCategories.value > 0) { // totalCategories.value was used before, now it's computed
        currentPage.value--;
      } else if (paginatedCategories.value.length === 0 && totalCategories.value === 0) {
        currentPage.value = 1;
      }
      ElMessage.success('类型删除成功 (Mock)！');

    } catch (error) {
      console.error("Failed to delete category:", error);
      ElMessage.error('删除类型失败！');
    } finally {
      loading.value = false;
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

const handlePageSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1; // Reset to page 1 when size changes for consistency
  // fetchCategories(); // Re-fetch data with new page size
};

const handleCurrentPageChange = (val: number) => {
  currentPage.value = val;
  // fetchCategories(); // Re-fetch data for the new page
};

const formatDate = (date: Date | string): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

</script>

<style scoped>
.categories-management {
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
    /* Or full width button */
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