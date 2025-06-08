<template>
  <div class="category-view">
    <!-- Category Tags -->
    <div class="category-tags">
      <button
        v-for="category in categories"
        :key="category.id"
        @click="selectCategory(category.id)"
        :class="{ active: selectedCategory === category.id }"
        class="tag-button"
      >
        <Icon :icon="category.icon" v-if="category.icon" class="tag-icon-svg" />
        {{ category.name }}
      </button>
    </div>

    <!-- Blog List -->
    <div class="blog-list-container">
      <div v-if="filteredBlogPosts.length > 0" class="blog-list">
        <div v-for="post in filteredBlogPosts" :key="post.id" class="blog-card">
          <img v-if="post.imageUrl" :src="post.imageUrl" :alt="post.title" class="blog-card-image">
          <h3>{{ post.title }}</h3>
          <p>{{ post.excerpt }}</p>
        </div>
      </div>
      <div v-else class="no-posts">
        <p>该分类下暂无博文。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useRoute } from 'vue-router'

// 定义接口以增强类型安全
interface Category {
  id: string;
  name: string;
  icon?: string; // Iconify icon name (e.g., 'mdi:apps')
}

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  categoryId: string;
  imageUrl?: string; // 可选的图片 URL
}

// 模拟分类数据
const categories = ref<Category[]>([
  { id: 'all', name: '全部', icon: 'mdi:apps' },
  { id: 'tech', name: '技术', icon: 'mdi:code-braces' },
  { id: 'life', name: '生活', icon: 'mdi:heart-outline' },
  { id: 'travel', name: '旅行', icon: 'mdi:airplane-takeoff' },
  { id: 'food', name: '美食', icon: 'mdi:silverware-fork-knife' },
]);

// 模拟博客文章数据
const blogPosts = ref<BlogPost[]>([
  { id: 1, title: 'Vue 3 组合式 API 深度解析', excerpt: '探索 Vue 3 中组合式 API 的强大功能，提升代码可维护性和复用性。', categoryId: 'tech', imageUrl: 'https://picsum.photos/seed/vue3/400/300' },
  { id: 2, title: '我的周末烘焙日记：抹茶千层', excerpt: '分享一个充满抹茶香气的周末，从备料到成品，详细记录制作过程。', categoryId: 'life', imageUrl: 'https://picsum.photos/seed/bakingmatcha/400/350' },
  { id: 3, title: '日本京都红叶季游记', excerpt: '记录在京都追逐红叶的美好时光，包含行程规划、景点推荐和美食体验。', categoryId: 'travel', imageUrl: 'https://picsum.photos/seed/kyotomaple/400/400' },
  { id: 4, title: 'React Hooks 与状态管理模式探讨', excerpt: '讨论 React Hooks 在复杂状态管理中的应用，对比不同状态管理库的优劣。', categoryId: 'tech', imageUrl: 'https://picsum.photos/seed/reacthooks/400/320' },
  { id: 5, title: '一次难忘的黄山徒步旅行', excerpt: '分享黄山徒步的经历和感悟，附带详细的路线图和注意事项。', categoryId: 'travel', imageUrl: 'https://picsum.photos/seed/hikinghuangshan/400/380' },
  { id: 6, title: '高效阅读技术文档的几点心得', excerpt: '总结一些关于如何快速、有效地掌握技术文档核心内容的技巧和方法。', categoryId: 'tech', imageUrl: 'https://picsum.photos/seed/techdocs/400/280' },
  { id: 7, title: '城市角落的咖啡馆探店笔记', excerpt: '发现了几家隐藏在城市角落的宝藏咖啡馆，与你分享独特的咖啡体验。', categoryId: 'life', imageUrl: 'https://picsum.photos/seed/coffeeshop/400/330' },
  { id: 8, title: '地中海美食之旅：希腊站风味', excerpt: '品尝正宗的希腊美食，从Moussaka到Souvlaki，感受浓郁的地中海风情。', categoryId: 'food', imageUrl: 'https://picsum.photos/seed/greecefood/400/370' },
  { id: 9, title: 'TypeScript 在大型项目中的最佳实践', excerpt: '探讨 TypeScript 如何提升大型前端项目的代码质量和团队协作效率。', categoryId: 'tech', imageUrl: 'https://picsum.photos/seed/typescriptproj/400/310' },
  { id: 10, title: '家常菜谱：番茄炒蛋的完美秘诀', excerpt: '一道简单又美味的家常菜，分享几个让番茄炒蛋更出彩的小技巧。', categoryId: 'food', imageUrl: 'https://picsum.photos/seed/tomatocooking/400/290' },
]);

const selectedCategory = ref<string>('all'); // 默认选中“全部”

// 点击分类标签时调用的方法
const selectCategory = (categoryId: string) => {
  selectedCategory.value = categoryId;
};

const route = useRoute();

// 计算属性，根据选中的分类筛选博客文章
const filteredBlogPosts = computed(() => {
  if (selectedCategory.value === 'all') {
    return blogPosts.value;
  }
  return blogPosts.value.filter(post => post.categoryId === selectedCategory.value);
});

onMounted(() => {
  const categoryIdFromRoute = route.params.categoryId as string | undefined;
  if (categoryIdFromRoute) {
    // 检查路由传递的 categoryId 是否是有效的分类
    const isValidCategory = categories.value.some(cat => cat.id === categoryIdFromRoute);
    if (isValidCategory) {
      selectedCategory.value = categoryIdFromRoute;
    } // 如果无效，则保持默认的 'all'
  }
});

// 如果需要从API获取数据，可以在 onMounted 钩子中进行
// import { onMounted } from 'vue';
// onMounted(async () => {
//   // categories.value = await fetchCategoriesAPI();
//   // blogPosts.value = await fetchBlogPostsAPI();
// });
</script>

<style scoped>
.category-view {
  padding: 20px;
  max-width: 1140px; /* 限制最大宽度 */
  margin: 0 auto; /* 水平居中 */
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.category-tags {
  margin-bottom: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px; /* 标签之间的间距 */
}

.tag-button {
  padding: 10px 18px;
  border: 1px solid #dcdfe6;
  border-radius: 20px;
  background-color: #f4f4f5;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.tag-icon-svg {
  margin-right: 8px;
  font-size: 1.2em; /* 调整 Iconify 图标大小 */
  vertical-align: middle; /* 确保图标与文字垂直对齐良好 */
}

.tag-button:hover {
  background-color: #e9e9eb;
  border-color: #c0c4cc;
}

.tag-button.active {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

.blog-list-container {
  margin-top: 20px;
}

.blog-list {
  /* 使用 column-count 实现瀑布流布局 */
  column-count: 3; /* 默认三列 */
  column-gap: 20px; /* 列之间的间距 */
}

/* 响应式调整列数 */
@media (max-width: 992px) { /* 中等屏幕，例如平板 */
  .blog-list {
    column-count: 2;
  }
}

@media (max-width: 767px) { /* 小型屏幕，例如手机 */
  .blog-list {
    column-count: 1;
  }
}

.blog-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  background-color: #ffffff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px; /* 卡片之间的垂直间距 */
  break-inside: avoid-column; /* 防止卡片在列中被切割，瀑布流关键属性 */
  display: flex; /* 使卡片内部元素能更好地布局 */
  flex-direction: column;
}

.blog-card-image {
  width: 100%;
  height: auto; /* 高度自适应，保持图片比例 */
  aspect-ratio: 16 / 10; /* 可以设置一个宽高比，使图片区域大小更统一 */
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 12px;
}

.blog-card h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 1.15em;
  color: #303133;
  line-height: 1.4;
}

.blog-card p {
  font-size: 0.9em;
  color: #606266;
  line-height: 1.6;
  flex-grow: 1; /* 使得段落内容填满剩余空间，有助于对齐 */
}

.no-posts {
  text-align: center;
  color: #909399;
  margin-top: 50px;
  font-size: 1.1em;
}
</style>
