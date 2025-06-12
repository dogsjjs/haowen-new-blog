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
          <el-form-item label="类型图标" prop="icon">
            <el-input v-model="categoryForm.icon" placeholder="请输入图标名称/类名 (可选)" />
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
        <el-table-column label="图标" width="80" align="center">
          <template #default="scope">
            <!-- 假设 icon 是 Element Plus 图标组件的名称或一个 CSS 类名 -->
            <span v-if="scope.row.icon"><Icon :icon="scope.row.icon" /></span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="类型名称" sortable />
        <el-table-column prop="description" label="描述" show-overflow-tooltip>
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
        <el-table-column prop="updatedAt" label="更新时间" width="180" sortable>
          <template #default="scope">
            {{ formatDate(scope.row.updatedAt) }}
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
import { Icon } from '@iconify/vue';
import { Search as SearchIcon, Plus as PlusIcon, Edit as EditIcon, Delete as DeleteIcon } from '@element-plus/icons-vue';
//  --- 类型定义导入 ---
import type { ICategory, CreateCategoryDTO, QueryCategoryDTO, CategoryResult, UpdateCategoryDTO } from '@/types/category.type';
// --- API 函数导入 ---
import { getAllCategories, addCategory, updateCategory, deleteCategory } from '@/api/category.api';
// --- 工具函数导入 ---
import { formatDate } from '@/utils/commonUtils';

// --- 响应式状态 ---
const allCategories = ref<ICategory[]>([]);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const formSubmitting = ref(false); // 表单提交状态，用于按钮loading

const dialogVisible = ref(false); // 控制添加/编辑弹窗的显示
const dialogTitle = ref(''); // 弹窗标题 (添加/编辑)
const categoryFormRef = ref<FormInstance>(); // 表单实例的引用，用于校验、重置等
const categoryForm = ref<{ // 表单数据模型
  id: string | null;
  name: string;
  icon: string;
  description: string;
}>({
  id: null,
  name: '',
  icon: '',
  description: '',
});

// 自定义图标校验器
const validateIcon = (rule: any, value: any, callback: any) => {
  if (value && value.trim() === '') {
    callback(new Error('图标名称不能仅包含空格'));
  } else if (value && value.length > 50) { // 示例：限制长度为50
    callback(new Error('图标名称过长，最多50个字符'));
  } else {
    callback();
  }
};

const categoryFormRules = reactive<FormRules>({ // 表单校验规则
  name: [{ required: true, message: '类型名称不能为空', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
  icon: [
    // 可选字段，但如果填写，可以有一些基本校验
    // 例如，不允许纯空格，或者限制长度
    { validator: validateIcon, trigger: 'blur' }
  ],
});

// --- API 客户端封装 ---
// 此处 apiClient 对象封装了对 API 导入函数的调用，
// 使得组件内部调用 API 的方式更统一，方便未来可能的统一处理（如错误上报、日志等）。
const apiClient = {
  // 获取分类列表 (带分页和查询参数)
  async getCategories(params: QueryCategoryDTO): Promise<CategoryResult | null> {
    const response = await getAllCategories(params);
    return response;
  },
  // 创建新分类
  async createCategory(data: CreateCategoryDTO): Promise<ICategory> {
    console.log('API CALL: createCategory with data', data);
    const response = await addCategory(data);
    return response as ICategory;
  },
  // 更新分类
  async updateCategory(id: string, data: UpdateCategoryDTO): Promise<ICategory> {
    console.log('API CALL: updateCategory with id and data', id, data);
    const response = await updateCategory(id, data);
    return response as ICategory;
  },
  // 删除分类
  async deleteCategory(id: string): Promise<boolean> {
    return await deleteCategory(id);
  }
};

// --- Data Fetching ---
const fetchCategories = async () => {
  loading.value = true; // 开始加载数据，显示表格loading状态
  try {
    // 调用 apiClient 获取分类数据
    const response = await apiClient.getCategories({ page: currentPage.value, pageSize: pageSize.value, query: searchQuery.value });
    allCategories.value = response?.categories || []; // 更新 allCategories 状态
    // 注意：此处后端返回的 response 结构中应包含 categories 数组。
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    ElMessage.error('获取类型列表失败！');
    allCategories.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCategories(); // 组件挂载后立即获取分类数据
});

// --- 计算属性 ---
// 根据搜索查询过滤分类列表 (客户端过滤)
const filteredCategories = computed(() => {
  // 如果搜索查询为空，则返回所有分类
  if (!searchQuery.value.trim()) {
    return allCategories.value;
  }
  // 将搜索查询转换为小写以进行不区分大小写的比较
  const lowerSearchQuery = searchQuery.value.toLowerCase();
  return allCategories.value.filter(category =>
    category.name.toLowerCase().includes(lowerSearchQuery)
  );
});

const totalCategories = computed(() => filteredCategories.value.length);
// 根据当前页和每页大小计算分页后的分类列表
const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredCategories.value.slice(start, end);
});

// 计算总页数
const totalPages = computed(() => Math.ceil(totalCategories.value / pageSize.value));

// --- 方法 ---

// 打开添加类型的弹窗
const openAddDialog = () => {
  dialogTitle.value = '添加新类型';
  // 重置表单数据
  categoryForm.value = { id: null, name: '', icon: '', description: '' };
  dialogVisible.value = true;
  // DOM 更新后清除表单校验状态
  nextTick(() => {
    categoryFormRef.value?.clearValidate();
  });
};

// 打开编辑类型的弹窗
const openEditDialog = (category: ICategory) => {
  dialogTitle.value = '编辑类型';
  // 用选中的分类数据填充表单
  categoryForm.value = { id: category.id as string, name: category.name, icon: category.icon || '', description: category.description || '' };
  dialogVisible.value = true;
  // DOM 更新后清除表单校验状态
  nextTick(() => {
    categoryFormRef.value?.clearValidate();
  });
};

const closeDialog = () => {
  dialogVisible.value = false;
  // 关闭弹窗时重置表单字段（Element Plus 的方法）
  categoryFormRef.value?.resetFields();
};

// 提交表单 (添加或编辑)
const submitForm = async () => {
  if (!categoryFormRef.value) return;
  formSubmitting.value = true; // 设置表单提交状态为 true，用于按钮 loading

  try {
    // 校验表单
    const valid = await categoryFormRef.value.validate();

    if (!valid) {
      ElMessage.error('请检查表单输入！');
      return;
    }

    const dataToSubmit = { // 准备提交的数据
      name: categoryForm.value.name.trim(),
      icon: categoryForm.value.icon.trim(),
      description: categoryForm.value.description.trim(),
    };

    if (categoryForm.value.id) {
      // Edit mode
      const updatedCategory = await apiClient.updateCategory(categoryForm.value.id, dataToSubmit);
      // 更新本地 allCategories 数组中的对应项
      const index = allCategories.value.findIndex(cat => cat.id === updatedCategory.id);
      if (index !== -1) allCategories.value[index] = updatedCategory; else fetchCategories(); // or update locally
      ElMessage.success(`类型${updateCategory.name}更新成功！`);
    } else {
      // Add mode
      const newCategory = await apiClient.createCategory(dataToSubmit);
      // 新增的类型博客文章数量默认设为0
      newCategory.postCount = 0
      // 将新分类添加到列表的开头
      allCategories.value.unshift(newCategory);
      ElMessage.success(`类型(${newCategory.name})添加成功！`);
    }
    closeDialog();
  } catch (error) {
    ElMessage.error('操作失败，请检查表单输入！');
  } finally {
    formSubmitting.value = false; // 无论成功或失败，结束表单提交状态
  }
};

// 处理删除分类的逻辑
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
    loading.value = true; // 开始删除操作，显示表格loading
    try {
      const removeResponse = await apiClient.deleteCategory(categoryId);
      if (removeResponse) {
        ElMessage.success('类型删除成功！');
        fetchCategories(); // 删除成功后重新获取列表
      } else {
        ElMessage.error('类型删除失败！');
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      ElMessage.error('删除类型失败！');
    } finally {
      loading.value = false; // 结束删除操作
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

// 处理每页显示数量变化的逻辑
const handlePageSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1; // 更改每页大小时，通常重置到第一页
  // 注意：由于是客户端分页，此处不需要重新调用 fetchCategories
};

// 处理当前页码变化的逻辑
const handleCurrentPageChange = (val: number) => {
  currentPage.value = val;
  // 注意：由于是客户端分页，此处不需要重新调用 fetchCategories
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