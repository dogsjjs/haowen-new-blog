<template>
  <div class="posts-management">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>博客文章管理</span>
        </div>
      </template>

      <!-- 操作与筛选区域 -->
      <el-form :model="filterForm" inline class="actions-bar">
        <el-form-item label="标题">
          <el-input v-model="filterForm.title" placeholder="搜索文章标题..." :prefix-icon="SearchIcon" clearable />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="filterForm.categoryId" placeholder="选择类型" clearable style="width: 150px;">
            <el-option v-for="cat in availableCategories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="filterForm.tagIds" placeholder="选择标签 (可多选)" clearable multiple collapse-tags
            collapse-tags-tooltip style="width: 200px;">
            <el-option v-for="tag in availableTags" :key="tag.id" :label="tag.name" :value="tag.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="推荐">
          <el-select v-model="filterForm.isRecommended" placeholder="是否推荐" clearable style="width: 120px;">
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="公开">
          <el-select v-model="filterForm.isPublic" placeholder="是否公开" clearable style="width: 120px;">
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="openAddDialog" :icon="PlusIcon">撰写新文章</el-button>
        </el-form-item>
      </el-form>


      <!-- 添加/编辑文章弹窗 -->
      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="clamp(600px, 80%, 1200px)" @close="closeDialog" :close-on-click-modal="false">
        <el-form :model="postForm" ref="postFormRef" :rules="postFormRules" label-width="100px"
          v-loading="formSubmitting || selectOptionsLoading">
          <el-row>
            <el-col :span="24">
              <el-form-item label="文章标题" prop="title">
                <el-input v-model="postForm.title" placeholder="请输入文章标题" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="博客首图" prop="coverImage">
                <el-upload class="cover-uploader" action="#" :show-file-list="false"
                  :before-upload="handleCoverBeforeUpload" :http-request="() => { }">
                  <img v-if="postForm.coverImage" :src="postForm.coverImage" class="cover-image-preview" alt="cover" />
                  <el-icon v-else class="cover-uploader-icon">
                    <PlusIcon />
                  </el-icon>
                </el-upload>
                <div class="el-upload__tip">建议尺寸750x300, 小于2MB</div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="博客类型" prop="categoryId">
                <el-select v-model="postForm.categoryId" placeholder="请选择博客类型" style="width: 100%;">
                  <el-option v-for="cat in availableCategories" :key="cat.id" :label="cat.name" :value="cat.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="博客标签" prop="tagIds">
                <el-select v-model="postForm.tagIds" multiple placeholder="请选择博客标签 (可多选)" style="width: 100%;"
                  collapse-tags collapse-tags-tooltip>
                  <el-option v-for="tag in availableTags" :key="tag.id" :label="tag.name" :value="tag.id" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="博客内容" prop="content">
            <!-- Markdown Editor Placeholder -->
            <!-- <div style="border: 1px dashed #dcdfe6; height: 300px; width:100%; padding: 10px; text-align: center; color: #909399; display:flex; align-items:center; justify-content:center;">
              此处集成 Markdown 编辑器 (e.g., mavon-editor, v-md-editor) <br/>
              v-model="postForm.content"
            </div> -->
            <MdEditor v-model="postForm.content" style="height: 400px" :theme="markdowkTheme" />
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="是否推荐" prop="isRecommended">
                <el-switch v-model="postForm.isRecommended" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否公开" prop="isPublic">
                <el-switch v-model="postForm.isPublic" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="自定义URL" prop="slug">
                <el-input v-model="postForm.slug" placeholder="可选, 如 my-awesome-post" />
              </el-form-item>
            </el-col>
          </el-row>

        </el-form>
        <template #footer>
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="formSubmitting">
            {{ postForm.id ? '更新文章' : '发布文章' }}
          </el-button>
        </template>
      </el-dialog>


      <!-- 文章内容详情弹窗 -->
      <el-dialog v-model="postDetailsDialogVisible" :title="selectedPostForDetails?.title || '文章详情'"
        width="clamp(600px, 80%, 1000px)" @close="closePostDetailsDialog" draggable class="post-details-dialog">
        <div v-if="selectedPostForDetails" class="details-content">
          <div class="post-meta">
            <span v-if="selectedPostForDetails.category">类型: <el-tag size="small">{{ selectedPostForDetails.category.name
            }}</el-tag></span>
            <span v-if="selectedPostForDetails.tags && selectedPostForDetails.tags.length > 0" style="margin-left: 15px;">
              标签:
              <el-tag v-for="tag in selectedPostForDetails.tags" :key="tag.id" size="small" style="margin-right: 5px;">{{
                tag.name }}</el-tag>
            </span>
            <span style="margin-left: 15px;">创建于: {{ formatDate(selectedPostForDetails.createTime) }}</span>
          </div>
          <MdPreview :id="previewIdForPost" :modelValue="selectedPostForDetails.content" :theme="markdowkTheme"
            style="max-height: 60vh; overflow-y: auto; border: 1px solid var(--el-border-color-lighter); border-radius: 4px; padding:15px; margin-top:15px;" />
        </div>
        <template #footer>
          <el-button @click="closePostDetailsDialog">关闭</el-button>
        </template>
      </el-dialog>

      <!-- 文章列表 -->
      <el-table :data="paginatedPosts" style="width: 100%; margin-top: 20px;" v-loading="loading" border stripe>
        <el-table-column label="首图" width="100" align="center">
          <template #default="scope">
            <el-image style="width: 80px; height: 40px" :src="scope.row.coverImage || defaultCoverImage"
              :preview-src-list="scope.row.coverImage ? [scope.row.coverImage] : []" fit="cover" lazy preview-teleported>
              <template #error>
                <div class="image-slot">
                  <el-icon>
                    <PictureIcon />
                  </el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip sortable>
          <template #default="scope">
            <el-link type="primary" @click="showPostDetails(scope.row)">{{ scope.row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="120" sortable="custom" :sort-by="(row: BlogPost) => row.category?.name">
          <template #default="scope">
            <el-tag type="success" size="small" v-if="scope.row.category">{{ scope.row.category.name }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="标签" width="180">
          <template #default="scope">
            <el-tooltip v-if="scope.row.tags && scope.row.tags.length > 2" placement="top">
              <template #content>
                <span v-for="tag in scope.row.tags" :key="tag.id" style="margin-right: 5px;">{{ tag.name }}</span>
              </template>
              <div>
                <el-tag v-for="tag in scope.row.tags.slice(0, 2)" :key="tag.id" size="small"
                  style="margin-right: 5px; margin-bottom: 2px;">
                  {{ tag.name }}
                </el-tag>
                <el-tag v-if="scope.row.tags.length > 2" size="small"
                  style="margin-right: 5px; margin-bottom: 2px;">...</el-tag>
              </div>
            </el-tooltip>
            <span v-else-if="scope.row.tags && scope.row.tags.length > 0">
              <el-tag v-for="tag in scope.row.tags" :key="tag.id" size="small"
                style="margin-right: 5px; margin-bottom: 2px;">
                {{ tag.name }}
              </el-tag>
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="推荐" width="80" align="center" sortable prop="isRecommended">
          <template #default="scope">
            <el-tag :type="scope.row.isRecommended ? 'success' : 'info'" size="small">
              {{ scope.row.isRecommended ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="公开" width="80" align="center" sortable prop="isPublic">
          <template #default="scope">
            <el-tag :type="scope.row.isPublic ? 'primary' : 'warning'" size="small">
              {{ scope.row.isPublic ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="100" sortable align="center" />
        <el-table-column prop="createTime" label="创建时间" width="170" sortable>
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="170" sortable>
          <template #default="scope">
            {{ formatDate(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" :icon="EditIcon" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" :icon="DeleteIcon"
              @click="handleDeletePost(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无文章" />
        </template>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container" v-if="totalPages > 0">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper" :total="totalPosts" @size-change="handlePageSizeChange"
          @current-change="handleCurrentPageChange" background />
      </div>
    </el-card>
  </div>
</template>

<script lang='ts' setup>
import { ref, computed, onMounted, reactive, nextTick, watch } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadProps, type UploadRawFile } from 'element-plus';
import { Search as SearchIcon, Plus as PlusIcon, Edit as EditIcon, Delete as DeleteIcon, Picture as PictureIcon } from '@element-plus/icons-vue';
import { useThemeStore } from '@/stores/theme'; // 导入主题 store
import { MdEditor, MdPreview, type Themes } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

// --- 接口定义 ---
// 博客分类
interface BlogCategory {
  id: string;
  name: string;
  description?: string;
}

// 博客标签
interface BlogTag {
  id: string;
  name: string;
  description?: string;
}

// 博客文章
interface BlogPost {
  id: string;
  title: string;
  slug?: string; // 自定义 URL
  coverImage?: string; // 首图 URL
  categoryId: string;
  category?: BlogCategory; // 分类对象
  tagIds: string[];
  tags?: BlogTag[]; // 标签对象数组
  content: string; // Markdown 内容
  isRecommended: boolean;
  isPublic: boolean;
  viewCount: number;
  createTime: Date;
  updateTime: Date;
}

// --- 默认首图 ---
const defaultCoverImage = 'data:image/svg+xml;charset=UTF-8,...'; // SVG 占位图

// --- 响应式状态 ---
// 文章列表
const allPosts = ref<BlogPost[]>([]);
// 分类选项
const availableCategories = ref<BlogCategory[]>([]);
// 标签选项
const availableTags = ref<BlogTag[]>([]);

// 筛选表单
const filterForm = reactive({
  title: '',
  categoryId: '',
  tagIds: [],
  isRecommended: null as boolean | null,
  isPublic: null as boolean | null,
});

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false); // 列表加载中
const formSubmitting = ref(false); // 表单提交中
const selectOptionsLoading = ref(false); // 分类/标签加载中

// 新增/编辑弹窗
const dialogVisible = ref(false);
const dialogTitle = ref('');
const postFormRef = ref<FormInstance>();

// 详情弹窗
const postDetailsDialogVisible = ref(false);
const selectedPostForDetails = ref<BlogPost | null>(null);
const previewIdForPost = 'md-preview-post'; // 预览组件唯一 ID

// 打开详情弹窗
const showPostDetails = (post: BlogPost) => {
  selectedPostForDetails.value = post;
  postDetailsDialogVisible.value = true;
};

// 关闭详情弹窗
const closePostDetailsDialog = () => {
  postDetailsDialogVisible.value = false;
  selectedPostForDetails.value = null;
};

// 初始化表单数据
const initialPostFormState = (): Omit<BlogPost, 'id' | 'category' | 'tags' | 'viewCount' | 'createTime' | 'updateTime'> & { id: string | null } => ({
  id: null,
  title: '',
  slug: '',
  coverImage: '',
  categoryId: '',
  tagIds: [],
  content: '',
  isRecommended: false,
  isPublic: true,
});
const postForm = ref(initialPostFormState());

// 主题（明暗）切换
const themeStore = useThemeStore();
const markdowkTheme = computed(() => {
  return themeStore.isDark ? 'dark' : 'light';
});

// 表单校验规则
const postFormRules = reactive<FormRules>({
  title: [{ required: true, message: '文章标题不能为空', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择博客类型', trigger: 'change' }],
  // tagIds: [{ type: 'array', min: 1, message: '至少选择一个标签', trigger: 'change' }], // 可选：标签必选
  content: [{ required: true, message: '文章内容不能为空', trigger: 'blur' }],
  coverImage: [{ required: false, message: '请上传博客首图', trigger: 'change' }],
});

// --- API 服务（模拟） ---
// 实际开发中应替换为真实 API 调用
const apiClient = {
  // 获取文章列表（带筛选、分页）
  async getPosts(params: {
    page: number, pageSize: number, title?: string, categoryId?: string,
    tagIds?: string[], isRecommended?: boolean | null, isPublic?: boolean | null
  }): Promise<{ data: BlogPost[], total: number }> {
    // 模拟接口延迟
    await new Promise(resolve => setTimeout(resolve, 700));
    // 生成 mock 数据并模拟筛选
    let items = generateMockPosts(100);

    if (params.title) {
      items = items.filter(p => p.title.toLowerCase().includes(params.title!.toLowerCase()));
    }
    if (params.categoryId) {
      items = items.filter(p => p.categoryId === params.categoryId);
    }
    if (params.tagIds && params.tagIds.length > 0) {
      items = items.filter(p => params.tagIds!.some(tid => p.tagIds.includes(tid)));
    }
    if (params.isRecommended !== null && params.isRecommended !== undefined) {
      items = items.filter(p => p.isRecommended === params.isRecommended);
    }
    if (params.isPublic !== null && params.isPublic !== undefined) {
      items = items.filter(p => p.isPublic === params.isPublic);
    }

    const total = items.length;
    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    // 填充分类和标签对象
    const paginatedData = items.slice(start, end).map(post => ({
      ...post,
      category: availableCategories.value.find(c => c.id === post.categoryId),
      tags: post.tagIds.map(tid => availableTags.value.find(t => t.id === tid)).filter(t => t) as BlogTag[]
    }));
    return { data: paginatedData, total };
  },
  // 新建文章
  async createPost(data: Omit<BlogPost, 'id' | 'category' | 'tags' | 'viewCount' | 'createTime' | 'updateTime'>): Promise<BlogPost> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newPost: BlogPost = {
      ...data,
      id: `post-api-${Date.now()}`,
      viewCount: 0,
      createTime: new Date(),
      updateTime: new Date(),
      category: availableCategories.value.find(c => c.id === data.categoryId),
      tags: data.tagIds.map(tid => availableTags.value.find(t => t.id === tid)).filter(t => t) as BlogTag[]
    };
    return newPost;
  },
  // 更新文章
  async updatePost(id: string, data: Partial<Omit<BlogPost, 'id' | 'category' | 'tags' | 'viewCount' | 'createTime' | 'updateTime'>>): Promise<BlogPost> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const existingPost = allPosts.value.find(p => p.id === id) || generateMockPosts(1)[0];
    const updatedPostData = { ...existingPost, ...data, updateTime: new Date() } as BlogPost;
    updatedPostData.category = availableCategories.value.find(c => c.id === updatedPostData.categoryId);
    updatedPostData.tags = updatedPostData.tagIds.map(tid => availableTags.value.find(t => t.id === tid)).filter(t => t) as BlogTag[];
    return updatedPostData;
  },
  // 删除文章
  async deletePost(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  },
  // 获取分类选项
  async getCategoriesForSelect(): Promise<BlogCategory[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [
      { id: 'cat1', name: '技术分享' }, { id: 'cat2', name: '生活随笔' },
      { id: 'cat3', name: '项目总结' }, { id: 'cat4', name: '学习笔记' }
    ];
  },
  // 获取标签选项
  async getTagsForSelect(): Promise<BlogTag[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [
      { id: 'tag1', name: 'Vue' }, { id: 'tag2', name: 'JavaScript' }, { id: 'tag3', name: '后端' },
      { id: 'tag4', name: '随笔' }, { id: 'tag5', name: 'ElementPlus' }, { id: 'tag6', name: 'Node.js' }
    ];
  },
  // 上传首图
  async uploadCoverImage(file: File): Promise<{ url: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { url: URL.createObjectURL(file) }; // 返回本地 blob URL
  }
};

// --- Mock 数据生成 ---
// 生成指定数量的 mock 文章
const generateMockPosts = (count: number = 25): BlogPost[] => {
  const posts: BlogPost[] = [];
  const sampleTitles = ['深入理解Vue3响应式原理', '我的高效工作流分享', 'Element Plus实践指南', 'Node.js后端开发心得', '一次难忘的旅行', '关于状态管理的思考'];
  const sampleContent = "这是文章的Markdown内容...\n\n## 这是一个二级标题\n\n- 列表项1\n- 列表项2\n\n```javascript\nconsole.log('Hello World');\n```\n";

  for (let i = 0; i < count; i++) {
    const createTime = new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 90));
    const updateTime = Math.random() > 0.5 ? new Date(createTime.getTime() + Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 10)) : createTime;
    const randomCategory = availableCategories.value[Math.floor(Math.random() * availableCategories.value.length)];
    const numTags = Math.floor(Math.random() * 4); // 0~3 个标签
    const randomTags = availableTags.value.sort(() => 0.5 - Math.random()).slice(0, numTags);

    posts.push({
      id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${i}`,
      title: `${sampleTitles[Math.floor(Math.random() * sampleTitles.length)]} #${i + 1}`,
      slug: `mock-post-${i + 1}`,
      coverImage: Math.random() > 0.3 ? `https://picsum.photos/seed/${i + 1}/300/150` : undefined,
      categoryId: randomCategory ? randomCategory.id : (availableCategories.value[0]?.id || 'cat-unknown'),
      tagIds: randomTags.map(t => t.id),
      content: sampleContent + `\n\n这是文章 ${i + 1} 的唯一内容部分。`,
      isRecommended: Math.random() > 0.7,
      isPublic: Math.random() > 0.2,
      viewCount: Math.floor(Math.random() * 2000),
      createTime: createTime,
      updateTime: updateTime,
    });
  }
  return posts.sort((a, b) => b.createTime.getTime() - a.createTime.getTime());
};

// --- 数据获取 ---
// 获取分类和标签选项
const fetchSelectOptions = async () => {
  selectOptionsLoading.value = true;
  try {
    const [categories, tags] = await Promise.all([
      apiClient.getCategoriesForSelect(),
      apiClient.getTagsForSelect()
    ]);
    availableCategories.value = categories;
    availableTags.value = tags;
  } catch (error) {
    ElMessage.error('获取分类或标签选项失败！');
  } finally {
    selectOptionsLoading.value = false;
  }
};

// 获取文章列表
const fetchPosts = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      title: filterForm.title || undefined,
      categoryId: filterForm.categoryId || undefined,
      tagIds: filterForm.tagIds.length > 0 ? filterForm.tagIds : undefined,
      isRecommended: filterForm.isRecommended,
      isPublic: filterForm.isPublic,
    };
    const response = await apiClient.getPosts(params);
    allPosts.value = response.data;
    // 这里 allPosts.value 已经是筛选和分页后的数据
  } catch (error) {
    ElMessage.error('获取文章列表失败！');
    allPosts.value = [];
  } finally {
    loading.value = false;
  }
};

// 组件挂载时加载分类、标签和文章
onMounted(async () => {
  await fetchSelectOptions();
  await fetchPosts();
});

// 监听筛选条件变化，自动刷新列表
watch(filterForm, () => {
  currentPage.value = 1;
  fetchPosts();
}, { deep: true });

// --- 计算属性 ---
// 过滤后的文章（实际已由 API 处理，这里保留以便扩展）
const filteredPosts = computed(() => {
  return allPosts.value;
});

// 总文章数（实际应由 API 返回）
const totalPosts = computed(() => {
  return filteredPosts.value.length;
});

// 当前页数据（如 API 已分页，这里就是 allPosts.value）
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredPosts.value.slice(start, end);
});

// 总页数
const totalPages = computed(() => Math.ceil(totalPosts.value / pageSize.value));

// --- 方法 ---
// 打开新增弹窗
const openAddDialog = () => {
  dialogTitle.value = '撰写新文章';
  postForm.value = initialPostFormState();
  dialogVisible.value = true;
  nextTick(() => {
    postFormRef.value?.clearValidate();
  });
};

// 打开编辑弹窗
const openEditDialog = (post: BlogPost) => {
  dialogTitle.value = '编辑文章';
  postForm.value = {
    id: post.id,
    title: post.title,
    slug: post.slug || '',
    coverImage: post.coverImage || '',
    categoryId: post.categoryId,
    tagIds: [...post.tagIds],
    content: post.content,
    isRecommended: post.isRecommended,
    isPublic: post.isPublic,
  };
  dialogVisible.value = true;
  nextTick(() => {
    postFormRef.value?.clearValidate();
  });
};

// 关闭弹窗并重置表单
const closeDialog = () => {
  dialogVisible.value = false;
  postForm.value = initialPostFormState();
};

// 首图上传前校验与模拟上传
const handleCoverBeforeUpload: UploadProps['beforeUpload'] = (rawFile: UploadRawFile) => {
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  formSubmitting.value = true;
  apiClient.uploadCoverImage(rawFile).then(response => {
    postForm.value.coverImage = response.url;
    ElMessage.success('首图上传成功 (Mock)!');
  }).catch(() => {
    ElMessage.error('首图上传失败!');
  }).finally(() => {
    formSubmitting.value = false;
  });
  return false; // 阻止 el-upload 默认上传
};

// 提交表单（新增或编辑）
const submitForm = async () => {
  if (!postFormRef.value) return;
  formSubmitting.value = true;
  try {
    const valid = await postFormRef.value.validate();
    if (!valid) {
      ElMessage.error('请检查表单输入！');
      return;
    }
    // 构造提交数据
    const dataToSubmit: Omit<BlogPost, 'id' | 'category' | 'tags' | 'viewCount' | 'createTime' | 'updateTime'> = {
      title: postForm.value.title.trim(),
      slug: postForm.value.slug?.trim() || undefined,
      coverImage: postForm.value.coverImage || undefined,
      categoryId: postForm.value.categoryId,
      tagIds: postForm.value.tagIds,
      content: postForm.value.content,
      isRecommended: postForm.value.isRecommended,
      isPublic: postForm.value.isPublic,
    };

    if (postForm.value.id) { // 编辑
      const index = allPosts.value.findIndex(p => p.id === postForm.value.id);
      if (index !== -1) {
        const oldPost = allPosts.value[index];
        const updatedPostData = {
          ...oldPost,
          ...dataToSubmit,
          updateTime: new Date(),
          category: availableCategories.value.find(c => c.id === dataToSubmit.categoryId),
          tags: dataToSubmit.tagIds.map(tid => availableTags.value.find(t => t.id === tid)).filter(t => t) as BlogTag[]
        };
        allPosts.value[index] = updatedPostData;
      }
      ElMessage.success('文章更新成功 (Mock)！');
    } else { // 新增
      const newMockPostData: BlogPost = {
        ...dataToSubmit,
        id: `post-mock-${Date.now()}`,
        viewCount: 0,
        createTime: new Date(),
        updateTime: new Date(),
        category: availableCategories.value.find(c => c.id === dataToSubmit.categoryId),
        tags: dataToSubmit.tagIds.map(tid => availableTags.value.find(t => t.id === tid)).filter(t => t) as BlogTag[]
      };
      allPosts.value.unshift(newMockPostData);
      ElMessage.success('文章发布成功 (Mock)！');
    }
    closeDialog();
    await fetchPosts(); // 刷新列表
  } catch (error) {
    ElMessage.error('操作失败，请重试。');
   } finally {
     formSubmitting.value = false;
   }
};

// 删除文章
const handleDeletePost = (postId: string) => {
  ElMessageBox.confirm('确定要删除这篇文章吗？此操作不可恢复。', '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    loading.value = true;
    try {
      allPosts.value = allPosts.value.filter(p => p.id !== postId);
      ElMessage.success('文章删除成功 (Mock)！');
      // 如果当前页被删空且不是第一页，则自动翻回上一页
      if (paginatedPosts.value.length === 0 && currentPage.value > 1 && totalPosts.value > 0) {
        currentPage.value--;
      }
      await fetchPosts();
    } catch (error) {
      ElMessage.error('删除文章失败！');
    } finally {
      loading.value = false;
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

// 分页大小变化
const handlePageSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  fetchPosts();
};

// 当前页变化
const handleCurrentPageChange = (val: number) => {
  currentPage.value = val;
  fetchPosts();
};

// 格式化日期
const formatDate = (date: Date | string): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '无效日期';
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

</script>

<style lang="scss" scoped>
.posts-management {
  padding: 20px;
}

.actions-bar {
  margin-bottom: 20px;
  /* display: flex;
  flex-wrap: wrap;
  gap: 15px; */
}

.actions-bar .el-form-item {
  margin-bottom: 10px;
  /* Add spacing for wrapped items */
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

.cover-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.cover-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  /* Adjust as needed */
  height: 89px;
  /* Adjust for 2:1 ratio, or make it square */
  text-align: center;
  line-height: 89px;
}

.cover-uploader .cover-image-preview {
  width: 178px;
  /* Must match icon width */
  height: 89px;
  /* Must match icon height */
  object-fit: contain;
  /* or 'cover' depending on desired effect */
  display: block;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 20px;
}

.el-upload__tip {
  font-size: 12px;
  color: #909399;
  margin-top: 7px;
}


.post-details-dialog {
  .el-dialog__body {
    padding-top: 10px;
    padding-bottom: 20px;
  }

  .details-content {
    .post-meta {
      margin-bottom: 10px; // Reduced margin for post meta
      font-size: 0.9em;
      color: var(--el-text-color-secondary);
      display: flex;
      flex-wrap: wrap; // Allow meta items to wrap
      align-items: center;
      gap: 5px 15px; // Row and column gap

      .el-tag {
        margin-left: 5px; // Space between label and tag
      }
    }
  }
}
</style>
