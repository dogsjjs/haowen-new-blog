<template>
  <div class="diary-management">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>日记管理</span>
        </div>
      </template>

      <!-- 操作区域 -->
      <el-row :gutter="20" class="actions-bar" justify="space-between" align="middle">
        <el-col :xs="24" :sm="12" :md="8">
          <el-input v-model="searchQuery" placeholder="搜索日记标题..." :prefix-icon="SearchIcon" clearable />
        </el-col>
        <el-col :xs="24" :sm="12" :md="4" class="add-button-col">
          <el-button type="primary" @click="openAddDialog" :icon="PlusIcon">添加日记</el-button>
        </el-col>
      </el-row>

      <!-- 添加/编辑日记弹窗 -->
      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="clamp(500px, 70%, 900px)" @close="closeDialog"
        draggable :close-on-click-modal="false">
        <el-form :model="diaryForm" ref="diaryFormRef" :rules="diaryFormRules" label-width="80px"
          v-loading="formSubmitting">
          <el-form-item label="日记标题" prop="title">
            <el-input v-model="diaryForm.title" placeholder="请输入日记标题" />
          </el-form-item>
          <el-form-item label="日记内容" prop="content">
            <MdEditor v-model="diaryForm.content" style="height: 400px" :theme="markdownTheme"
              placeholder="开始记录你的日记吧..." />
          </el-form-item>
          <el-form-item label="是否公开" prop="isPublic">
            <el-switch v-model="diaryForm.isPublic" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="formSubmitting">确认</el-button>
        </template>
      </el-dialog>

      <!-- 日记内容详情弹窗 -->
      <el-dialog v-model="detailsDialogVisible" :title="selectedDiaryForDetails?.title || '日记详情'"
        width="clamp(500px, 70%, 900px)" @close="closeDetailsDialog" draggable class="diary-details-dialog">
        <div v-if="selectedDiaryForDetails" class="details-content">
          <div class="diary-meta">
            <span>创建于: {{ formatDate(selectedDiaryForDetails.createTime) }}</span>
            <el-tag :type="selectedDiaryForDetails.isPublic ? 'success' : 'info'" size="small"
              style="margin-left: 15px;">
              {{ selectedDiaryForDetails.isPublic ? '公开' : '私密' }}
            </el-tag>
          </div>
          <MdPreview :id="previewId" :modelValue="selectedDiaryForDetails.content" :theme="markdownTheme" />
        </div>
        <template #footer>
          <el-button @click="closeDetailsDialog">关闭</el-button>
        </template>
      </el-dialog>

      <!-- 日记列表 -->
      <el-table :data="paginatedDiaries" style="width: 100%; margin-top: 20px;" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID (部分)" width="150">
          <template #default="scope">
            {{ scope.row.id.substring(0, 8) }}...
          </template>
        </el-table-column>
        <el-table-column prop="title" label="日记标题" sortable show-overflow-tooltip min-width="150">
          <template #default="scope">
            <el-link type="primary" @click="showDiaryDetails(scope.row)">{{ scope.row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="isPublic" label="是否公开" width="120" sortable align="center">
          <template #default="scope">
            <el-tag :type="scope.row.isPublic ? 'success' : 'info'" size="small">
              {{ scope.row.isPublic ? '公开' : '私密' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" sortable>
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" sortable>
          <template #default="scope">
            {{ formatDate(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" :icon="EditIcon" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" :icon="DeleteIcon"
              @click="handleDeleteDiary(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无日记" />
        </template>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container" v-if="totalPages > 0">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper" :total="totalDiaries" @size-change="handlePageSizeChange"
          @current-change="handleCurrentPageChange" background />
      </div>
    </el-card>
  </div>
</template>

<script lang='ts' setup>
import { ref, computed, onMounted, reactive, nextTick } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Search as SearchIcon, Plus as PlusIcon, Edit as EditIcon, Delete as DeleteIcon } from '@element-plus/icons-vue';
import { useThemeStore } from '@/stores/theme';
import { marked } from 'marked';
import { MdEditor, MdPreview, type Themes } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

const previewId = 'md-preview';

interface DiaryEntry {
  id: string;
  title: string;
  content: string; // Markdown content
  isPublic: boolean;
  createTime: Date;
  updateTime: Date;
}

// --- 响应式状态 ---
const allDiaries = ref<DiaryEntry[]>([]);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const formSubmitting = ref(false);

const dialogVisible = ref(false);
const dialogTitle = ref('');
const diaryFormRef = ref<FormInstance>();

const detailsDialogVisible = ref(false);
const selectedDiaryForDetails = ref<DiaryEntry | null>(null);


const showDiaryDetails = (diary: DiaryEntry) => {
  selectedDiaryForDetails.value = diary;
  detailsDialogVisible.value = true;
};

const closeDetailsDialog = () => {
  detailsDialogVisible.value = false;
  selectedDiaryForDetails.value = null;
};

const showContent = computed(() => {
  return selectedDiaryForDetails.value ? marked(selectedDiaryForDetails.value.content) : '';
});

const initialDiaryFormState = (): Omit<DiaryEntry, 'id' | 'createTime' | 'updateTime'> & { id: string | null } => ({
  id: null,
  title: '',
  content: '',
  isPublic: true, // 默认公开
});
const diaryForm = ref(initialDiaryFormState());

const diaryFormRules = reactive<FormRules>({
  title: [{ required: true, message: '日记标题不能为空', trigger: 'blur' }],
  content: [{ required: true, message: '日记内容不能为空', trigger: 'blur' }],
});

const themeStore = useThemeStore();
const markdownTheme = computed<Themes>(() => themeStore.isDark ? 'dark' : 'light');

// --- API Service Placeholders (Mock) ---
const apiClient = {
  async getDiaries(params: { page: number, pageSize: number, query?: string }): Promise<{ data: DiaryEntry[], total: number }> {
    console.log('API CALL: getDiaries with params', params);
    await new Promise(resolve => setTimeout(resolve, 500));
    let items = allDiaries.value;
    if (params.query) {
      const lowerQuery = params.query.toLowerCase();
      items = items.filter(diary => diary.title.toLowerCase().includes(lowerQuery));
    }
    // This part will be simpler when the backend handles pagination and filtering.
    // For now, let's assume the mock data is the full dataset and we re-fetch it.
    return { data: generateMockData(30, params.query), total: 30 }; // Simplified for mock
  },
  async createDiary(data: Omit<DiaryEntry, 'id' | 'createTime' | 'updateTime'>): Promise<DiaryEntry> {
    console.log('API CALL: createDiary with data', data);
    await new Promise(resolve => setTimeout(resolve, 300));
    const now = new Date();
    const newDiary: DiaryEntry = { ...data, id: `diary-api-${Date.now()}`, createTime: now, updateTime: now };
    return newDiary;
  },
  async updateDiary(id: string, data: Partial<Omit<DiaryEntry, 'id' | 'createTime' | 'updateTime'>>): Promise<DiaryEntry> {
    console.log('API CALL: updateDiary with id and data', id, data);
    await new Promise(resolve => setTimeout(resolve, 300));
    // This is a placeholder. In a real app, you'd find and update the item.
    // For mock, we'll just construct a plausible updated item.
    const existing = allDiaries.value.find(d => d.id === id) || (generateMockData(1)[0] as DiaryEntry);
    const updatedDiary: DiaryEntry = { ...existing, ...data, id, updateTime: new Date() };
    return updatedDiary;
  },
  async deleteDiary(id: string): Promise<void> {
    console.log('API CALL: deleteDiary with id', id);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
};

// --- Mock 数据生成 ---
const generateMockData = (count: number = 30, query?: string): DiaryEntry[] => {
  const diaries: DiaryEntry[] = [];
  const sampleTitles = ['今天天气真好', '学习了新的Vue特性', '一个有趣的想法', '周末计划', '读后感'];
  const sampleContents = ['阳光明媚，心情舒畅。\n\n## 做了什么\n- 散步\n- 喝咖啡', '深入研究了 Composition API，感觉非常强大！', '如果能有一个自动写代码的AI就好了...', '周六去爬山，周日看电影。', '《三体》太震撼了！'];
  for (let i = 0; i < count; i++) {
    const createTime = new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)); // 最近30天
    const updateTime = Math.random() > 0.3 ? new Date(createTime.getTime() + Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 5)) : createTime;
    diaries.push({
      id: `diary-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${i}`,
      title: `${sampleTitles[Math.floor(Math.random() * sampleTitles.length)]} #${i + 1}`,
      content: `${sampleContents[Math.floor(Math.random() * sampleContents.length)]}\n\n (这是自动生成的日记内容 ${i + 1})`,
      isPublic: Math.random() > 0.4,
      createTime: createTime,
      updateTime: updateTime,
    });
  }
  let result = diaries.sort((a, b) => b.createTime.getTime() - a.createTime.getTime());
  if (query) {
    const lowerQuery = query.toLowerCase();
    result = result.filter(diary => diary.title.toLowerCase().includes(lowerQuery));
  }
  return result;
};

// --- Data Fetching ---
const fetchDiaries = async () => {
  loading.value = true;
  try {
    // const response = await apiClient.getDiaries({ page: currentPage.value, pageSize: pageSize.value, query: searchQuery.value });
    // allDiaries.value = response.data;
    // totalDiaries.value = response.total; // This should be used for pagination total
    allDiaries.value = generateMockData(30, searchQuery.value); // Mock data
  } catch (error) {
    console.error("Failed to fetch diaries:", error);
    ElMessage.error('获取日记列表失败！');
    allDiaries.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  allDiaries.value = generateMockData(); // Initial mock load
  // fetchDiaries(); // Uncomment for API placeholder
});

// --- 计算属性 ---
const filteredDiaries = computed(() => {
  if (!searchQuery.value.trim()) {
    return allDiaries.value;
  }
  const lowerSearchQuery = searchQuery.value.toLowerCase();
  return allDiaries.value.filter(diary =>
    diary.title.toLowerCase().includes(lowerSearchQuery)
  );
});

const totalDiaries = computed(() => filteredDiaries.value.length);

const paginatedDiaries = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredDiaries.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(totalDiaries.value / pageSize.value));

// --- 方法 ---
const openAddDialog = () => {
  dialogTitle.value = '添加新日记';
  diaryForm.value = initialDiaryFormState();
  dialogVisible.value = true;
  nextTick(() => {
    diaryFormRef.value?.clearValidate();
  });
};

const openEditDialog = (diary: DiaryEntry) => {
  dialogTitle.value = '编辑日记';
  diaryForm.value = { ...diary }; // Shallow copy is fine for this structure
  dialogVisible.value = true;
  nextTick(() => {
    diaryFormRef.value?.clearValidate();
  });
};

const closeDialog = () => {
  dialogVisible.value = false;
  diaryFormRef.value?.resetFields(); // Resets to initial values if props are set in el-form-item
  diaryForm.value = initialDiaryFormState(); // Ensure full reset
};

const submitForm = async () => {
  if (!diaryFormRef.value) return;
  formSubmitting.value = true;

  try {
    const valid = await diaryFormRef.value.validate();
    console.log("Form validation result:", valid); // 保留此日志用于调试

    if (!valid) {
      ElMessage.error('请检查表单输入！');
      // formSubmitting 将在 finally 块中被设置为 false
      return; // 如果验证失败，则提前退出
    }

    // 如果验证成功，则继续处理数据提交
    const dataToSubmit = {
      title: diaryForm.value.title.trim(),
      content: diaryForm.value.content, // Markdown content
      isPublic: diaryForm.value.isPublic,
    };

    if (diaryForm.value.id) { // Edit mode
      // const updatedDiary = await apiClient.updateDiary(diaryForm.value.id, dataToSubmit);
      // const index = allDiaries.value.findIndex(d => d.id === updatedDiary.id);
      // if (index !== -1) allDiaries.value[index] = updatedDiary; else fetchDiaries();
      // ElMessage.success('日记更新成功！');
      const index = allDiaries.value.findIndex(d => d.id === diaryForm.value.id);
      if (index !== -1) {
        allDiaries.value[index] = { ...allDiaries.value[index], ...dataToSubmit, updateTime: new Date() };
      }
      ElMessage.success('日记更新成功 (Mock)！');
    } else { // Add mode
      // const newDiary = await apiClient.createDiary(dataToSubmit);
      // allDiaries.value.unshift(newDiary); // Or fetchDiaries();
      // ElMessage.success('日记添加成功！');
      const now = new Date();
      const newMockDiary: DiaryEntry = { ...dataToSubmit, id: `diary-mock-${Date.now()}`, createTime: now, updateTime: now };
      allDiaries.value.unshift(newMockDiary);
      ElMessage.success('日记添加成功 (Mock)！');
    }
    closeDialog();
    // fetchDiaries(); // 如果使用真实API，在添加/编辑后重新获取数据
  } catch (error) {
    +    ElMessage.error('操作失败，请重试。');
  } finally {
    formSubmitting.value = false;
  }
};

const handleDeleteDiary = (diaryId: string) => {
  ElMessageBox.confirm('确定要删除这篇日记吗？此操作不可恢复。', '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    loading.value = true; // Show loading for delete operation
    try {
      // await apiClient.deleteDiary(diaryId);
      // ElMessage.success('日记删除成功！');
      // fetchDiaries();

      allDiaries.value = allDiaries.value.filter(d => d.id !== diaryId);
      if (paginatedDiaries.value.length === 0 && currentPage.value > 1 && totalDiaries.value > 0) {
        currentPage.value--;
      } else if (paginatedDiaries.value.length === 0 && totalDiaries.value === 0) {
        currentPage.value = 1;
      }
      ElMessage.success('日记删除成功 (Mock)！');
    } catch (error) {
      console.error("Failed to delete diary:", error);
      ElMessage.error('删除日记失败！');
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
  // fetchDiaries();
};

const handleCurrentPageChange = (val: number) => {
  currentPage.value = val;
  // fetchDiaries();
};

const formatDate = (date: Date | string): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '无效日期';
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

</script>

<style lang="scss" scoped>
.diary-management {
  padding: 20px;
}

.actions-bar {
  margin-bottom: 20px;
}

.add-button-col {
  text-align: right;
}

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

// Styles for Diary Details Dialog (inspired by DiaryBookView.vue)
.diary-details-dialog {
  .el-dialog__body {
    padding-top: 10px; // Adjust padding as needed
    padding-bottom: 20px;
  }

  .details-content {
    .diary-meta {
      margin-bottom: 15px;
      font-size: 0.9em;
      color: var(--el-text-color-secondary);
      display: flex;
      align-items: center;
    }

    // md-editor in previewOnly mode might need some specific styling if default is not enough
    // For example, to ensure it fits well within the dialog
    .md-editor-previewOnly {
      // background-color: var(--el-fill-color-lighter); // Example: slightly different background for preview
      // border-radius: 4px;
      // padding: 15px;
    }
  }
}
</style>