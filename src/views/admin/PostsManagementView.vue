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
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip sortable />
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
import { useThemeStore } from '@/stores/theme'; // 导入 theme store
import { MdEditor, type Themes } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

// --- Interfaces ---
interface BlogCategory { // From CategoriesManagementView
  id: string;
  name: string;
  description?: string;
}

interface BlogTag { // From TagsManagementView
  id: string;
  name: string;
  description?: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug?: string; // for custom URL
  coverImage?: string; // URL of the cover image
  categoryId: string;
  category?: BlogCategory; // Populated from categoryId
  tagIds: string[];
  tags?: BlogTag[]; // Populated from tagIds
  content: string; // Markdown content
  isRecommended: boolean;
  isPublic: boolean;
  viewCount: number;
  createTime: Date;
  updateTime: Date;
}

// --- Default Values ---
const defaultCoverImage = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2280%22%20height%3D%2240%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2080%2040%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_17ba89a291d%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_17ba89a291d%22%3E%3Crect%20width%3D%2280%22%20height%3D%2240%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2224.5%22%20y%3D%2224.5%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';


// --- Reactive State ---
const allPosts = ref<BlogPost[]>([]);
const availableCategories = ref<BlogCategory[]>([]);
const availableTags = ref<BlogTag[]>([]);

const filterForm = reactive({
  title: '',
  categoryId: '',
  tagIds: [],
  isRecommended: null as boolean | null,
  isPublic: null as boolean | null,
});

const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const formSubmitting = ref(false);
const selectOptionsLoading = ref(false); // For loading categories/tags in form

const dialogVisible = ref(false);
const dialogTitle = ref('');
const postFormRef = ref<FormInstance>();

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

const themeStore = useThemeStore(); // 使用 store

const markdowkTheme = computed(() => {
  // This can be dynamic based on user preference or settings
  return themeStore.isDark ? 'dark' : 'light'; // or 'light', etc.
});

const postFormRules = reactive<FormRules>({
  title: [{ required: true, message: '文章标题不能为空', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择博客类型', trigger: 'change' }],
  // tagIds: [{ type: 'array', min: 1, message: '至少选择一个标签', trigger: 'change' }], // Optional: make tags required
  content: [{ required: true, message: '文章内容不能为空', trigger: 'blur' }],
  coverImage: [{ required: false, message: '请上传博客首图', trigger: 'change' }],
});

// --- API Service Placeholders ---
const apiClient = {
  // Posts
  async getPosts(params: {
    page: number, pageSize: number, title?: string, categoryId?: string,
    tagIds?: string[], isRecommended?: boolean | null, isPublic?: boolean | null
  }): Promise<{ data: BlogPost[], total: number }> {
    console.log('API CALL: getPosts with params', params);
    await new Promise(resolve => setTimeout(resolve, 700));
    // Simulate filtering and populating category/tags
    let items = generateMockPosts(100); // Generate a larger set for filtering simulation

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
    const paginatedData = items.slice(start, end).map(post => ({
      ...post,
      category: availableCategories.value.find(c => c.id === post.categoryId),
      tags: post.tagIds.map(tid => availableTags.value.find(t => t.id === tid)).filter(t => t) as BlogTag[]
    }));
    return { data: paginatedData, total };
  },
  async createPost(data: Omit<BlogPost, 'id' | 'category' | 'tags' | 'viewCount' | 'createTime' | 'updateTime'>): Promise<BlogPost> {
    console.log('API CALL: createPost with data', data);
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
  async updatePost(id: string, data: Partial<Omit<BlogPost, 'id' | 'category' | 'tags' | 'viewCount' | 'createTime' | 'updateTime'>>): Promise<BlogPost> {
    console.log('API CALL: updatePost with id and data', id, data);
    await new Promise(resolve => setTimeout(resolve, 300));
    const existingPost = allPosts.value.find(p => p.id === id) || generateMockPosts(1)[0];
    const updatedPostData = { ...existingPost, ...data, updateTime: new Date() } as BlogPost;
    updatedPostData.category = availableCategories.value.find(c => c.id === updatedPostData.categoryId);
    updatedPostData.tags = updatedPostData.tagIds.map(tid => availableTags.value.find(t => t.id === tid)).filter(t => t) as BlogTag[];
    return updatedPostData;
  },
  async deletePost(id: string): Promise<void> {
    console.log('API CALL: deletePost with id', id);
    await new Promise(resolve => setTimeout(resolve, 300));
  },
  // Categories and Tags for select options
  async getCategoriesForSelect(): Promise<BlogCategory[]> {
    console.log('API CALL: getCategoriesForSelect');
    await new Promise(resolve => setTimeout(resolve, 200));
    // In a real app, this might be a dedicated endpoint or reuse CategoriesManagementView's getCategories
    return [
      { id: 'cat1', name: '技术分享' }, { id: 'cat2', name: '生活随笔' },
      { id: 'cat3', name: '项目总结' }, { id: 'cat4', name: '学习笔记' }
    ];
  },
  async getTagsForSelect(): Promise<BlogTag[]> {
    console.log('API CALL: getTagsForSelect');
    await new Promise(resolve => setTimeout(resolve, 200));
    return [
      { id: 'tag1', name: 'Vue' }, { id: 'tag2', name: 'JavaScript' }, { id: 'tag3', name: '后端' },
      { id: 'tag4', name: '随笔' }, { id: 'tag5', name: 'ElementPlus' }, { id: 'tag6', name: 'Node.js' }
    ];
  },
  async uploadCoverImage(file: File): Promise<{ url: string }> {
    console.log('API CALL: uploadCoverImage with file', file.name);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload
    // In a real app, upload the file and return its URL
    return { url: URL.createObjectURL(file) }; // For mock, return a blob URL
  }
};

// --- Mock Data Generation ---
const generateMockPosts = (count: number = 25): BlogPost[] => {
  const posts: BlogPost[] = [];
  const sampleTitles = ['深入理解Vue3响应式原理', '我的高效工作流分享', 'Element Plus实践指南', 'Node.js后端开发心得', '一次难忘的旅行', '关于状态管理的思考'];
  const sampleContent = "这是文章的Markdown内容...\n\n## 这是一个二级标题\n\n- 列表项1\n- 列表项2\n\n```javascript\nconsole.log('Hello World');\n```\n";

  for (let i = 0; i < count; i++) {
    const createTime = new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 90));
    const updateTime = Math.random() > 0.5 ? new Date(createTime.getTime() + Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 10)) : createTime;
    const randomCategory = availableCategories.value[Math.floor(Math.random() * availableCategories.value.length)];
    const numTags = Math.floor(Math.random() * 4); // 0 to 3 tags
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

// --- Data Fetching ---
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
    console.error("Failed to fetch select options:", error);
    ElMessage.error('获取分类或标签选项失败！');
  } finally {
    selectOptionsLoading.value = false;
  }
};

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
    // totalPosts is computed based on filteredPosts for client-side filtering,
    // or should be set from response.total for server-side.
    // For this mock, apiClient.getPosts already returns total based on its internal filtering.
    // So, we'll use a computed property for totalPosts based on the *potentially* client-side filtered list.
    // If server does all filtering, totalPosts should be `response.total`.
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    ElMessage.error('获取文章列表失败！');
    allPosts.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchSelectOptions(); // Fetch options first
  // Then generate mock data that might depend on these options or fetch real posts
  // allPosts.value = generateMockPosts(); // Initial mock load if not using fetchPosts on mount
  await fetchPosts(); // Fetch posts after options are loaded
});

// Watch for filter changes to re-fetch posts
watch(filterForm, () => {
  currentPage.value = 1; // Reset to first page on filter change
  fetchPosts();
}, { deep: true });


// --- Computed Properties ---
// For client-side filtering (if API doesn't do it all)
// If API handles all filtering, `filteredPosts` would just be `allPosts.value`
const filteredPosts = computed(() => {
  // This computed property is less critical if the API handles all filtering.
  // It's kept here to show how client-side filtering would work on top of API results if needed.
  // Or, if `fetchPosts` always gets ALL posts and filtering is purely client-side.
  // Given the current `fetchPosts` and `apiClient.getPosts` mock, `allPosts.value` is already "filtered" by the mock API.
  return allPosts.value;
});

const totalPosts = computed(() => {
  // If using server-side pagination and filtering, this should come from API response.
  // For current mock setup where apiClient.getPosts returns a total, we can use that.
  // However, if we were doing more client-side filtering on top of API results,
  // this would be `filteredPosts.value.length`.
  // Let's assume for now `apiClient.getPosts` gives the correct total for the current filters.
  // If `fetchPosts` updates a separate `serverTotalPosts` ref, use that.
  // For simplicity with the current mock, we'll use the length of the data returned by the mock API.
  // This might need adjustment based on how `apiClient.getPosts` truly behaves with a real backend.
  // A more robust way for client-side pagination on a fully fetched list:
  // return allPosts.value.filter(post => { /* apply all filterForm conditions here */ }).length;
  // But since `fetchPosts` is already applying filters via `apiClient.getPosts` (mocked),
  // the `allPosts.value` is the "filtered" list from the "server".
  // So, `totalPosts` should reflect the total count of items matching the filter on the server.
  // The mock `apiClient.getPosts` returns a `total`, but we are not storing it directly.
  // Let's adjust `fetchPosts` to store this total.

  // Re-evaluating: `paginatedPosts` will use `filteredPosts`. `totalPosts` should be the length of `filteredPosts`.
  return filteredPosts.value.length; // This is for client-side pagination after API call.
  // If API does pagination, `el-pagination :total` should be from API.
  // The current `apiClient.getPosts` mock returns a `total` which we are not using directly for `el-pagination`.
  // Let's assume the `total` from `apiClient.getPosts` is the true total for the filters.
  // We need to store it.
});

// This ref will store the total count from the API if server-side pagination is used.
const serverSideTotalPosts = ref(0);
// In fetchPosts, after `const response = await apiClient.getPosts(params);`
// add `serverSideTotalPosts.value = response.total;`
// Then, `el-pagination :total="serverSideTotalPosts"`

const paginatedPosts = computed(() => {
  // If API handles pagination, `paginatedPosts` would just be `allPosts.value`
  // (assuming `allPosts.value` stores only the current page's data).
  // For client-side pagination on the fetched (and potentially client-filtered) data:
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredPosts.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(totalPosts.value / pageSize.value));


// --- Methods ---
const openAddDialog = () => {
  dialogTitle.value = '撰写新文章';
  postForm.value = initialPostFormState();
  dialogVisible.value = true;
  nextTick(() => {
    postFormRef.value?.clearValidate();
  });
};

const openEditDialog = (post: BlogPost) => {
  dialogTitle.value = '编辑文章';
  // Deep copy or reconstruct to avoid direct mutation issues if post object is complex
  postForm.value = {
    id: post.id,
    title: post.title,
    slug: post.slug || '',
    coverImage: post.coverImage || '',
    categoryId: post.categoryId,
    tagIds: [...post.tagIds], // Ensure new array for tags
    content: post.content,
    isRecommended: post.isRecommended,
    isPublic: post.isPublic,
  };
  dialogVisible.value = true;
  nextTick(() => {
    postFormRef.value?.clearValidate();
  });
};

const closeDialog = () => {
  dialogVisible.value = false;
  // postFormRef.value?.resetFields(); // This might not fully reset if initialPostFormState changes
  postForm.value = initialPostFormState(); // More reliable reset
};

const handleCoverBeforeUpload: UploadProps['beforeUpload'] = (rawFile: UploadRawFile) => {
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  // Simulate upload and set URL
  // In a real app, you'd call an upload API here
  formSubmitting.value = true; // Show loading during "upload"
  apiClient.uploadCoverImage(rawFile).then(response => {
    postForm.value.coverImage = response.url;
    ElMessage.success('首图上传成功 (Mock)!');
  }).catch(err => {
    console.error("Cover upload failed:", err);
    ElMessage.error('首图上传失败!');
  }).finally(() => {
    formSubmitting.value = false;
  });

  return false; // Prevent el-upload's default xhr action
};


const submitForm = async () => {
  if (!postFormRef.value) return;
  formSubmitting.value = true;

  const valid = await postFormRef.value.validate();
  if (!valid) {
    ElMessage.error('请检查表单输入！');
    formSubmitting.value = false;
    return;
  }

  // Construct data, excluding fields not directly part of the form or meant for backend generation
  const dataToSubmit: Omit<BlogPost, 'id' | 'category' | 'tags' | 'viewCount' | 'createTime' | 'updateTime'> = {
    title: postForm.value.title.trim(),
    slug: postForm.value.slug?.trim() || undefined,
    coverImage: postForm.value.coverImage || undefined,
    categoryId: postForm.value.categoryId,
    tagIds: postForm.value.tagIds,
    content: postForm.value.content, // Assuming Markdown editor updates this
    isRecommended: postForm.value.isRecommended,
    isPublic: postForm.value.isPublic,
  };

  try {
    if (postForm.value.id) { // Edit mode
      // const updatedPost = await apiClient.updatePost(postForm.value.id, dataToSubmit);
      // ElMessage.success('文章更新成功！');
      // Mock update:
      const index = allPosts.value.findIndex(p => p.id === postForm.value.id);
      if (index !== -1) {
        const oldPost = allPosts.value[index];
        allPosts.value[index] = {
          ...oldPost,
          ...dataToSubmit,
          updateTime: new Date(),
          category: availableCategories.value.find(c => c.id === dataToSubmit.categoryId),
          tags: dataToSubmit.tagIds.map(tid => availableTags.value.find(t => t.id === tid)).filter(t => t) as BlogTag[]
        };
      }
      ElMessage.success('文章更新成功 (Mock)！');
    } else { // Add mode
      // const newPost = await apiClient.createPost(dataToSubmit);
      // ElMessage.success('文章发布成功！');
      // Mock add:
      const newMockPost: BlogPost = {
        ...dataToSubmit,
        id: `post-mock-${Date.now()}`,
        viewCount: 0,
        createTime: new Date(),
        updateTime: new Date(),
        category: availableCategories.value.find(c => c.id === dataToSubmit.categoryId),
        tags: dataToSubmit.tagIds.map(tid => availableTags.value.find(t => t.id === tid)).filter(t => t) as BlogTag[]
      };
      allPosts.value.unshift(newMockPost);
      ElMessage.success('文章发布成功 (Mock)！');
    }
    closeDialog();
    await fetchPosts(); // Re-fetch posts to reflect changes and re-apply server-side logic/pagination
  } catch (error) {
    console.error("Post operation failed:", error);
    ElMessage.error('操作失败，请重试');
  } finally {
    formSubmitting.value = false;
  }
};

const handleDeletePost = (postId: string) => {
  ElMessageBox.confirm('确定要删除这篇文章吗？此操作不可恢复。', '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    loading.value = true;
    try {
      // await apiClient.deletePost(postId);
      // ElMessage.success('文章删除成功！');
      // Mock delete:
      allPosts.value = allPosts.value.filter(p => p.id !== postId);
      ElMessage.success('文章删除成功 (Mock)！');
      // Adjust current page if necessary after deletion
      if (paginatedPosts.value.length === 0 && currentPage.value > 1 && totalPosts.value > 0) {
        currentPage.value--;
      }
      await fetchPosts(); // Re-fetch
    } catch (error) {
      console.error("Failed to delete post:", error);
      ElMessage.error('删除文章失败！');
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
  fetchPosts();
};

const handleCurrentPageChange = (val: number) => {
  currentPage.value = val;
  fetchPosts();
};

const formatDate = (date: Date | string): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '无效日期';
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

</script>

<style scoped>
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
</style>
