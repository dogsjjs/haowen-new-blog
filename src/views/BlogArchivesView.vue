<template>
  <div class="blog-archives-view">
    <!-- Year Filter -->
    <div class="year-filter-container">
      <button v-for="year in displayYears" :key="year.value" @click="selectYear(year.value)"
        :class="{ active: selectedYear === year.value }" class="year-filter-button">
        {{ year.label }}
      </button>
    </div>

    <!-- Timeline -->
    <div class="timeline-container" v-if="filteredPostsByYear.length > 0">
      <el-timeline>
        <el-timeline-item center  v-for="post in filteredPostsByYear" :key="post.id" :timestamp="post.publishDate"
          placement="top" type="primary" hollow @click="navigateToPost(post.id)">
          <BlogPostCard :post="transformPostForCard(post)">
            <template #category>
              <span v-if="post.category" class="post-category-archive" 
                    @click.stop="navigateToCategoryPage(post.category.id)"
                    :title="`查看分类: ${post.category.name}`">
                <Icon :icon="post.category.icon" v-if="post.category.icon" class="meta-icon" />
                {{ post.category.name }}
              </span>
            </template>
            <template #tags>
              <div v-if="post.tags && post.tags.length" class="post-tags-archive-on-card">
                <span v-for="tag in post.tags" :key="tag.id" 
                      class="tag-item-archive" 
                      @click.stop="navigateToTagPage(tag.id)"
                      :title="`查看标签: ${tag.name}`">
                  #{{ tag.name }}
                </span>
              </div>
            </template>
          </BlogPostCard>
        </el-timeline-item>
      </el-timeline>
    </div>
    <div v-else class="no-posts-message">
      <p>{{ selectedYear === 'all' ? '暂无博文记录。' : `在 ${selectedYear} 年度暂无博文。` }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { ElTimeline, ElTimelineItem } from 'element-plus';
import { useRouter } from 'vue-router'; // Assuming you'll navigate
import BlogPostCard from '@/components/BlogPostCard/index.vue';

// --- Interfaces ---
interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface Tag {
  id: string;
  name: string;
  icon?: string; // Optional, if tags also have icons
}

interface BlogPostArchive {
  id: number;
  title: string;
  publishDate: string; // Format: YYYY-MM-DD
  excerpt?: string;
  category: Category;
  tags: Tag[];
}
// Matches PostProp expected by BlogPostCard.vue
interface PostCardProp {
  id: number;
  title: string;
  excerpt?: string;
  imageUrl?: string; // BlogPostCard can handle optional imageUrl
  imageHeight?: number;
  publishDate?: string;
}


interface YearOption {
  value: number | 'all';
  label: string;
}

// --- Router ---
const router = useRouter();

// --- Mock Data ---
// For demonstration, replace with your actual data fetching
const allPosts = ref<BlogPostArchive[]>([
  {
    id: 1,
    title: '探索Vue 3的新特性',
    publishDate: '2023-11-15',
    excerpt: '深入了解Vue 3带来的组合式API、Teleport等高级功能及其在现代Web开发中的应用。',
    category: { id: 'vue', name: 'Vue.js', icon: 'logos:vue' },
    tags: [
      { id: 'vue3', name: 'Vue3' },
      { id: 'composition-api', name: 'CompositionAPI' },
    ],
  },
  {
    id: 2,
    title: 'React状态管理深度解析：Context与Redux',
    publishDate: '2023-05-20',
    excerpt: '对比分析React中Context API与Redux在不同规模项目中的状态管理策略和最佳实践。',
    category: { id: 'react', name: 'React', icon: 'logos:react' },
    tags: [
      { id: 'react-hooks', name: 'ReactHooks' },
      { id: 'redux', name: 'Redux' },
      { id: 'state-management', name: 'StateManagement' },
    ],
  },
  {
    id: 3,
    title: 'TypeScript在大型项目中的优势',
    publishDate: '2022-08-10',
    excerpt: '探讨TypeScript如何通过静态类型检查提升大型代码库的可维护性、可读性和团队协作效率。',
    category: { id: 'typescript', name: 'TypeScript', icon: 'logos:typescript-icon' },
    tags: [{ id: 'static-typing', name: 'StaticTyping' }],
  },
  {
    id: 4,
    title: 'Node.js后端开发入门实践',
    publishDate: '2022-03-01',
    excerpt: '从零开始，学习使用Node.js和Express框架搭建一个简单的RESTful API服务。',
    category: { id: 'nodejs', name: 'Node.js', icon: 'logos:nodejs-icon' },
    tags: [
      { id: 'express', name: 'Express.js' },
      { id: 'backend', name: 'Backend' },
    ],
  },
  {
    id: 5,
    title: 'CSS Grid与Flexbox布局技巧',
    publishDate: '2023-01-25',
    excerpt: '掌握现代CSS布局技术，灵活运用Grid和Flexbox解决各种复杂的页面布局挑战。',
    category: { id: 'css', name: 'CSS', icon: 'logos:css-3' },
    tags: [
      { id: 'css-grid', name: 'CSSGrid' },
      { id: 'flexbox', name: 'Flexbox' },
    ],
  },
  {
    id: 6,
    title: '我的2021年终总结与展望',
    publishDate: '2021-12-31',
    excerpt: '回顾过去一年的成长与挑战，展望新一年的目标与计划。',
    category: { id: 'life', name: '生活感悟', icon: 'mdi:heart-outline' },
    tags: [{ id: 'summary', name: '总结' }, { id: 'reflection', name: '感悟' }],
  },
]);

// --- State ---
const selectedYear = ref<number | 'all'>('all');

// --- Computed Properties ---
const availableYears = computed<number[]>(() => {
  const years = new Set<number>();
  allPosts.value.forEach(post => {
    years.add(new Date(post.publishDate).getFullYear());
  });
  return Array.from(years).sort((a, b) => b - a); // Sort descending
});

const displayYears = computed<YearOption[]>(() => {
  const years: YearOption[] = availableYears.value.map(year => ({
    value: year,
    label: year.toString(),
  }));
  return [{ value: 'all', label: '全部年份' }, ...years];
});

const filteredPostsByYear = computed<BlogPostArchive[]>(() => {
  let postsToFilter = [...allPosts.value];
  // Sort all posts by date descending by default
  postsToFilter.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

  if (selectedYear.value === 'all') {
    return postsToFilter;
  }
  return postsToFilter.filter(post => {
    return new Date(post.publishDate).getFullYear() === selectedYear.value;
  });
});

// --- Methods ---
const selectYear = (year: number | 'all') => {
  selectedYear.value = year;
};

// Helper function to transform BlogPostArchive to PostCardProp
const transformPostForCard = (post: BlogPostArchive): PostCardProp => {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    publishDate: post.publishDate,
    // imageUrl and imageHeight are not in BlogPostArchive, BlogPostCard will handle their absence
    // If you add them to BlogPostArchive, map them here.
  };
};

const navigateToPost = (postId: number) => {
  router.push(`/post/${postId}`); // Adjust route as per your setup
};

const navigateToCategoryPage = (categoryId: string) => {
  router.push(`/categories/${categoryId}`); // Adjust route
};

const navigateToTagPage = (tagId: string) => {
  router.push(`/tags/${tagId}`); // Adjust route
};

// --- Lifecycle Hooks ---
onMounted(() => {
  // Potentially fetch posts here or set a default year if needed
  // For now, it defaults to 'all'
});
</script>

<style scoped lang="scss">
.blog-archives-view {
  padding: 20px clamp(15px, 3vw, 30px);
  max-width: 1200px;
  margin: 0 auto;
  font-family: var(--el-font-family);
}

.archives-title {
  text-align: center;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  margin-bottom: 30px;
  color: var(--el-text-color-primary);
}

.year-filter-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 40px;
}

.year-filter-button {
  padding: 8px 16px;
  border: 1px solid var(--category-tag-border-color); // Reusing category tag variables
  border-radius: 20px;
  background-color: var(--category-tag-bg);
  color: var(--category-tag-text-color);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;

  &:hover {
    background-color: var(--category-tag-hover-bg);
    border-color: var(--category-tag-hover-border-color);
  }

  &.active {
    background-color: var(--category-tag-active-bg);
    color: var(--category-tag-active-text-color);
    border-color: var(--category-tag-active-border-color);
    font-weight: 600;
  }
}

.timeline-container {
  max-width: 800px; // Controls the width of the timeline itself
  margin: 0 auto; // Centers the timeline
}

// Styles for the content provided to the slots of BlogPostCard
// These styles are specific to how CategoryView wants to display category/tags within the card.
.post-meta-archive {
  // This class might not be directly needed if category and tags are in separate slots
  // and BlogPostCard's .post-meta handles the date.
  // However, if you want a container around both category and tags slots, you can use it.
  // For now, I'll style .post-category-archive and .post-tags-archive-on-card directly.
  font-size: 0.85rem;
  color: var(--el-text-color-secondary);
  display: flex;
  flex-wrap: wrap; // Allow wrapping if category and tags are long
  align-items: center;
  gap: 15px; // Gap between category and tags container
}

.post-category-archive {
  // This styles the content passed into the #category slot of BlogPostCard
  // It's similar to the .post-category in HomeView.vue
  display: inline-flex; // Use inline-flex for icon and text alignment
  align-items: center;
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 3px 6px;
  border-radius: 4px;


  &:hover {
    color: var(--el-color-primary-light-3); // Lighter primary for hover on secondary text
    background-color: var(--el-fill-color-light);
  }

  .meta-icon {
    margin-right: 5px;
    font-size: 1.1em; // Slightly larger icon
    color: var(--el-color-primary); // Category icon with primary color
  }
}

.post-tags-archive-on-card {
  // This styles the container for tags passed into the #tags slot of BlogPostCard
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item-archive {
  background-color: var(--card-tag-item-bg, var(--el-color-info-light-9)); // Reusing card tag variables
  color: var(--card-tag-item-text-color, var(--el-color-info));
  padding: 2px 8px;
  margin-right: 5px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: var(--el-color-primary-light-8); // Adjust hover as needed
    color: var(--el-color-primary);
  }
}

.no-posts-message {
  text-align: center;
  margin-top: 50px;
  color: var(--el-text-color-placeholder);
  font-size: 1.1rem;
}

// Element Plus Timeline Customization (Optional)
:deep(.el-timeline-item__timestamp) {
  font-size: 0.95rem;
  color: var(--el-text-color-regular);
}

:deep(.el-timeline-item__node) {
  background-color: var(--el-color-primary); // Make the node primary color
}

:deep(.el-timeline-item__tail) {
  border-left: 2px solid var(--el-border-color-light);
}
</style>
