<template>
  <div class="tag-view">
    <!-- Tag Buttons -->
    <div class="tag-buttons-container">
      <button v-for="tag in displayTags" :key="tag.id" @click="selectTag(tag.id)"
        :class="{ active: selectedTagId === tag.id }" class="tag-button">
        <Icon :icon="tag.icon" v-if="tag.icon" class="tag-icon-svg" />
        {{ tag.name }}
      </button>
    </div>

    <!-- Blog List -->
    <div class="blog-list-container">
      <div v-if="filteredBlogPosts.length > 0" class="posts-grid">
        <BlogPostCard 
          v-for="post in filteredBlogPosts" 
          :key="post.id" 
          :post="transformPostForCard(post)"
          @click="navigateToPost(post.id)"
        >
          <template #tags>
            <span v-for="tagId in post.tagIds" :key="tagId" class="post-tag-item">
              #{{ getTagNameById(tagId) }}
            </span>
          </template>
        </BlogPostCard>
      </div>
      <div v-else class="no-posts">
        <p>该标签下暂无博文。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useRoute, useRouter } from 'vue-router';
import BlogPostCard from '@/components/BlogPostCard/index.vue';

// 定义接口
interface Tag {
  id: string;
  name: string;
  icon?: string; // Iconify icon name
}
// Local BlogPost structure for TagView
interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  tagIds: string[]; // 文章拥有的标签ID数组
  imageUrl?: string;
  publishDate?: string; // For BlogPostCard prop
  imageHeight?: number; // For BlogPostCard prop
}

// Matches PostProp expected by BlogPostCard.vue
interface PostCardProp {
  id: number;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  imageHeight?: number;
  publishDate?: string;
}

// 模拟标签数据
const allTags = ref<Tag[]>([
  { id: 'vue', name: 'Vue.js', icon: 'logos:vue' },
  { id: 'react', name: 'React', icon: 'logos:react' },
  { id: 'typescript', name: 'TypeScript', icon: 'logos:typescript-icon' },
  { id: 'javascript', name: 'JavaScript', icon: 'logos:javascript' },
  { id: 'nodejs', name: 'Node.js', icon: 'logos:nodejs-icon' },
  { id: 'css', name: 'CSS', icon: 'logos:css-3' },
  { id: 'html', name: 'HTML', icon: 'logos:html-5' },
  { id: 'lifestyle', name: '生活方式', icon: 'mdi:heart-pulse' },
  { id: 'productivity', name: '生产力', icon: 'mdi:rocket-launch-outline' },
]);

// 模拟博客文章数据
const blogPosts = ref<BlogPost[]>([
  { id: 1, title: 'Vue 3 深度特性探索', excerpt: '深入了解 Vue 3 的响应式系统和组合式 API。', tagIds: ['vue', 'javascript', 'typescript'], imageUrl: 'https://picsum.photos/seed/vuepost1/400/300', publishDate: '2023-01-10', imageHeight: 300 },
  { id: 2, title: 'React Hooks 完全指南', excerpt: '掌握 React Hooks，编写更简洁的组件。', tagIds: ['react', 'javascript'], imageUrl: 'https://picsum.photos/seed/reactpost1/400/350', publishDate: '2023-02-15', imageHeight: 350 },
  { id: 3, title: 'TypeScript 在大型项目中的应用', excerpt: '探讨 TypeScript 如何提升代码质量和可维护性。', tagIds: ['typescript', 'javascript', 'nodejs'], imageUrl: 'https://picsum.photos/seed/tspost1/400/320', publishDate: '2023-03-20', imageHeight: 320 },
  { id: 4, title: '高效能人士的七个习惯', excerpt: '提升个人生产力的经典法则。', tagIds: ['productivity', 'lifestyle'], imageUrl: 'https://picsum.photos/seed/prodpost1/400/280', publishDate: '2023-04-25', imageHeight: 280 },
  { id: 5, title: 'Node.js 构建高性能后端服务', excerpt: '利用 Node.js 的异步特性构建快速API。', tagIds: ['nodejs', 'javascript'], imageUrl: 'https://picsum.photos/seed/nodepost1/400/380', publishDate: '2023-05-30', imageHeight: 380 },
  { id: 6, title: 'CSS Grid 布局实战', excerpt: '现代 CSS 布局方案，解决复杂布局难题。', tagIds: ['css', 'html'], imageUrl: 'https://picsum.photos/seed/csspost1/400/330', publishDate: '2023-06-05', imageHeight: 330 },
  { id: 7, title: '我的极简生活心得', excerpt: '分享从物质和精神层面追求简约生活的体验。', tagIds: ['lifestyle'], imageUrl: 'https://picsum.photos/seed/lifestylepost1/400/370', publishDate: '2023-07-10', imageHeight: 370 },
  { id: 8, title: 'Vue 与 React：详细对比与选择', excerpt: '分析两大主流前端框架的异同点，助你做出选择。', tagIds: ['vue', 'react', 'javascript'], imageUrl: 'https://picsum.photos/seed/vsvsr/400/290', publishDate: '2023-08-15', imageHeight: 290 },
]);

// "全部标签" 选项
const allTagOption: Tag = { id: 'all', name: '全部标签', icon: 'mdi:tag-multiple-outline' };

const displayTags = computed<Tag[]>(() => [allTagOption, ...allTags.value]);

const selectedTagId = ref<string>(allTagOption.id); // 默认选中“全部标签”

const route = useRoute();
const router = useRouter();

// 点击标签按钮时调用的方法
const selectTag = (tagId: string) => {
  selectedTagId.value = tagId;
  // 未来可以考虑更新路由，以便用户可以分享带有特定标签筛选的URL
  // router.push({ name: 'TagView', params: { tagId: tagId === allTagOption.id ? undefined : tagId } });
};

// 根据选中的标签筛选博客文章
const filteredBlogPosts = computed(() => {
  if (selectedTagId.value === allTagOption.id) {
    return blogPosts.value;
  }
  return blogPosts.value.filter(post => post.tagIds.includes(selectedTagId.value));
});

// 通过标签ID获取标签名称，用于在卡片中显示
const getTagNameById = (tagId: string): string => {
  const tag = allTags.value.find(t => t.id === tagId);
  return tag ? tag.name : tagId;
};

// Helper function to transform local BlogPost to PostCardProp
const transformPostForCard = (post: BlogPost): PostCardProp => {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    imageUrl: post.imageUrl,
    imageHeight: post.imageHeight,
    publishDate: post.publishDate,
  };
};

const navigateToPost = (postId: number) => {
  router.push(`/post/${postId}`);
};

onMounted(() => {
  const tagIdFromRoute = route.params.tagId as string | undefined; // 假设路由参数名为 tagId
  if (tagIdFromRoute) {
    const isValidTag = allTags.value.some(tag => tag.id === tagIdFromRoute);
    if (isValidTag) {
      selectedTagId.value = tagIdFromRoute;
    }
  }
});

// API获取数据的占位符
// onMounted(async () => {
//   // allTags.value = await fetchTagsAPI();
//   // blogPosts.value = await fetchBlogPostsAPI();
//   // ... 处理路由参数 ...
// });
</script>

<style scoped>
/* 大部分样式可以从 CategoryView.vue 借鉴和调整 */
.tag-view {
  padding: 20px;
  max-width: 1140px;
  margin: 0 auto;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.tag-buttons-container {
  margin-bottom: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag-button {
  padding: 10px 18px;
  border: 1px solid var(--category-tag-border-color); 
  border-radius: 20px;
  background-color: var(--category-tag-bg);
  color: var(--category-tag-text-color);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.tag-icon-svg {
  margin-right: 8px;
  font-size: 1.2em;
  vertical-align: middle;
}

.tag-button:hover {
  background-color: var(--category-tag-hover-bg);
  border-color: var(--category-tag-hover-border-color);
}

.tag-button.active {
  background-color: var(--category-tag-active-bg);
  color: var(--category-tag-active-text-color);
  border-color: var(--category-tag-active-border-color);
}

.blog-list-container {
  margin-top: 20px;
}

.blog-list {
  column-count: 3;
  column-gap: 20px;
}
.posts-grid { 
  column-count: 3;
  column-gap: 20px;
}

@media (max-width: 992px) {
  .posts-grid { 
    column-count: 2;
  }
}

@media (max-width: 767px) {
  .posts-grid { 
    column-count: 1;
  }
}

.post-tags-display {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.post-tag-item {
  
  background-color: var(--card-tag-item-bg, #ecf5ff); 
  color: var(--card-tag-item-text-color, #409eff);
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  cursor: pointer; 
  transition: background-color 0.2s ease, color 0.2s ease;
}

.no-posts {
  text-align: center;
  color: #909399;
  margin-top: 50px;
  font-size: 1.1em;
}
</style>
