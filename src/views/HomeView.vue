<script setup lang="ts">
import { ref } from 'vue';
import BlogPostCard from '@/components/BlogPostCard/index.vue'; // 导入新组件
import { Icon } from '@iconify/vue'

// 定义接口
interface Tag {
  id: string;
  name: string;
  icon?: string; // Iconify icon name
  count?: number; // 可选的文章数量
}

// 定义接口以增强类型安全
interface Category {
  id: string;
  name: string;
  icon?: string; // Iconify icon name (e.g., 'mdi:apps')
  count?: number; // 可选的文章数量
}

interface Post {
  id: number;
  title: string;
  excerpt: string;
  imageUrl: string;
  imageHeight: number; // 用于瀑布流中不同的图片高度
  publishDate: string;
  category: Category; // 分类名称或对象
  tags: Tag[];
}

const allTags = ref<Tag[]>([
  { id: 'vue', name: 'Vue.js', icon: 'logos:vue', count: 1 },
  { id: 'react', name: 'React', icon: 'logos:react', count: 6 },
  { id: 'typescript', name: 'TypeScript', icon: 'logos:typescript-icon', count: 6 },
  { id: 'javascript', name: 'JavaScript', icon: 'logos:javascript', count: 4 },
  { id: 'nodejs', name: 'Node.js', icon: 'logos:nodejs-icon', count: 6 },
  { id: 'css', name: 'CSS', icon: 'logos:css-3', count: 8 },
  { id: 'html', name: 'HTML', icon: 'logos:html-5', count: 16 },
  { id: 'lifestyle', name: '生活方式', icon: 'mdi:heart-pulse', count: 8 },
  { id: 'productivity', name: '生产力', icon: 'mdi:rocket-launch-outline', count: 9 },
]);

// 模拟分类数据
const categories = ref<Category[]>([
  { id: 'tech', name: '技术', icon: 'mdi:code-braces', count: 3 },
  { id: 'life', name: '生活', icon: 'mdi:heart-outline', count: 3 },
  { id: 'travel', name: '旅行', icon: 'mdi:airplane-takeoff', count: 3 },
  { id: 'food', name: '美食', icon: 'mdi:silverware-fork-knife', count: 3 },
]);
// 生成模拟博客文章数据
const generateMockPosts = (count: number): Post[] => {
  const mockPosts: Post[] = [];
  const LOREM_IPSUM_SHORT = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
  const LOREM_IPSUM_MEDIUM = "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
  const LOREM_IPSUM_LONG = "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

  const excerptsPool = [LOREM_IPSUM_SHORT, LOREM_IPSUM_MEDIUM, LOREM_IPSUM_LONG, LOREM_IPSUM_MEDIUM.substring(0, 100), LOREM_IPSUM_SHORT.substring(0, 30)];

  const getRandomDate = () => {
    const start = new Date(2022, 0, 1);
    const end = new Date();
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getRandomTags = (count: number) => {
    return [...allTags.value].sort(() => 0.5 - Math.random()).slice(0, count);
  };

  for (let i = 1; i <= count; i++) {
    const imageHeight = Math.floor(Math.random() * 200) + 200; // 图片高度在 200px 到 400px 之间随机
    const excerptText = excerptsPool[i % excerptsPool.length];
    mockPosts.push({
      id: i,
      title: `精彩博文 ${i}`,
      excerpt: `${excerptText.substring(0, Math.floor(Math.random() * 80) + 70)}...`, // 摘要长度随机
      imageUrl: `https://picsum.photos/seed/${i + 100}/400/${imageHeight}`, // 使用 picsum.photos 获取随机图片
      imageHeight: imageHeight,
      publishDate: getRandomDate(),
      category: categories.value[i % categories.value.length], // 随机分类
      tags: getRandomTags(Math.floor(Math.random() * 3) + 2), // 每篇文章2-4个标签
    });
  }
  return mockPosts;
};

const posts = ref<Post[]>(generateMockPosts(12)); // 生成12篇模拟文章
const landingImageUrl = ref('https://picsum.photos/seed/picsum/1920/1080'); // 开屏图片 URL (修正笔误)

// 侧边栏信息卡片数据
const personalInfo = ref({
  avatar: 'https://i.pravatar.cc/150?u=blogowner',
  name: '博主昵称',
  bio: '热爱分享技术、生活点滴与奇思妙想。欢迎来到我的小站！',
});



// 站点统计数据
import { computed } from 'vue';
const totalPosts = computed(() => posts.value.length);

// 导入图标
import { useRouter } from 'vue-router'; // 导入 useRouter
import { FolderOpened } from '@element-plus/icons-vue';

// 导航到文章详情页 (模拟)
const router = useRouter(); // 获取 router 实例
const navigateToPost = (postId: number) => {
  console.log(`Navigating to post ${postId}`);
  router.push(`/post/${postId}`); // 使用 router.push 进行跳转
};

const navigateToCategoryPage = (categoryName: string) => {
  console.log(`Navigating to category page: ${categoryName}`);
  router.push(`/categories/${encodeURIComponent(categoryName)}`);
};

const navigateToTagPage = (tagName: string) => {
  console.log(`Navigating to tag page: ${tagName}`);
  router.push(`/tags/${encodeURIComponent(tagName)}`);
};

const totalCategories = computed(() => categories.value.length);
const totalTags = computed(() => allTags.value.length);
const siteEstablishedDate = ref('2023-10-26'); // 模拟建站日期

</script>

<template>
  <div class="home-page">
    <section class="landing-hero" :style="{ backgroundImage: `url(${landingImageUrl})` }">
      <div class="landing-overlay">
        <div class="landing-content">
          <h1 class="landing-title">欢迎来到我的博客</h1>
          <p class="landing-subtitle">发现富有洞察力的文章和精美的视觉效果。</p>
          <div class="scroll-indicator">
            <p>向下滚动浏览</p>
            <span>&darr;</span>
          </div>
        </div>
      </div>
    </section>

    <div class="main-content-area">
      <main class="blog-posts-container">
        <div class="posts-grid">
          <!-- 使用 BlogPostCard 组件 -->
          <BlogPostCard v-for="post in posts" :key="post.id" :post="post" @click="navigateToPost(post.id)">
            <template #category>
              <span class="post-category" @click.stop="navigateToCategoryPage(post.category.id)" title="查看该分类下的文章">
                <Icon :icon="post.category.icon" v-if="post.category.icon" class="tag-icon-svg" />
                {{ post.category.name }}
              </span>
            </template>
            <template #tags>
              <el-tag v-for="tagInPost in post.tags" :key="tagInPost.id" type="info" size="small" effect="plain"
                class="post-tag-item" @click.stop="navigateToTagPage(tagInPost.id)" title="查看该标签下的文章">
                {{ tagInPost.name }}
              </el-tag>
            </template>
          </BlogPostCard>
        </div>
      </main>

      <aside class="sidebar">
        <!-- 个人信息卡片 -->
        <div class="info-card personal-info-card">
          <img :src="personalInfo.avatar" alt="博主头像" class="avatar" />
          <h3 class="info-card-title">{{ personalInfo.name }}</h3>
          <p class="bio">{{ personalInfo.bio }}</p>
          <!-- 可以添加社交链接等 -->
        </div>

        <!-- 站点统计卡片 -->
        <div class="info-card site-stats-card">
          <h3 class="info-card-title">站点统计</h3>
          <ul class="stats-list">
            <li><span>文章数量：</span><strong>{{ totalPosts }} 篇</strong></li>
            <li><span>分类总数：</span><strong>{{ totalCategories }} 个</strong></li>
            <li><span>标签总数：</span><strong>{{ totalTags }} 个</strong></li>
            <li><span>建站日期：</span><strong>{{ siteEstablishedDate }}</strong></li>
            <!-- <li><span>最后更新：</span><strong>YYYY-MM-DD</strong></li> -->
          </ul>
        </div>

        <!-- 分类列表卡片 -->
        <div class="info-card">
          <h3 class="info-card-title">文章分类</h3>
          <ul class="category-list">
            <li v-for="category in categories" :key="category.id">
              <Icon :icon="category.icon" v-if="category.icon" class="tag-icon-svg" />
              <span @click.stop="navigateToCategoryPage(category.id)" class="category-item">{{ category.name }} ({{
                category.count }})</span>
            </li>
          </ul>
        </div>

        <!-- 标签列表卡片 (对应您说的“类型”) -->
        <div class="info-card">
          <h3 class="info-card-title">热门标签</h3>
          <ul class="tag-list">
            <li v-for="tag in allTags.slice(0, 7)" :key="tag.id"> <!-- 显示部分标签 -->
              <span @click.stop="navigateToTagPage(tag.id)" class="tag-item">
                <Icon :icon="tag.icon" v-if="tag.icon" class="tag-icon-svg" />{{ tag.name }}
              </span>
            </li>
          </ul>
        </div>


        <!-- 标签词云卡片 -->
        <div class="info-card">
          <h3 class="info-card-title">标签云</h3>
          <div class="tag-cloud">
            <span v-for="tag in allTags" :key="tag.id" @click.stop="navigateToTagPage(tag.id)" class="tag-cloud-item"
              :style="{ fontSize: `${0.8 + Number(tag.count) * 0.05}rem` }">{{ tag.name }}
            </span>

          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped lang="scss">
// CSS variables like --acrylic-bg-color, --acrylic-border-color, 
// --acrylic-sidebar-bg-color, --acrylic-sidebar-border-color, and --landing-overlay-bg
// are now expected to be defined globally, e.g., in src/style/variables.scss
// and handle their light/dark mode variations there.

.landing-hero {
  height: 100vh; // 占满整个视口高度
  background-size: cover;
  background-position: center;
  position: relative; // Keep for overlay positioning
  color: var(--el-color-white); // Use Element Plus variable for white
}

.landing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--landing-overlay-bg); // Use CSS variable for overlay
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
}

.landing-content {
  max-width: 800px;
}

.landing-title {
  font-size: clamp(2rem, 5vw, 3rem); // 响应式字体大小
  font-weight: 700; // Explicitly bold
  margin-bottom: 0.5em;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5); // Softer text shadow
}

.landing-subtitle {
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  margin-bottom: 2em;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); // Softer text shadow
}

.scroll-indicator {
  margin-top: 30px;
  font-size: 1rem;

  p {
    margin-bottom: 0.5em;
  }

  span {
    font-size: 1.5rem;
    display: inline-block;
    animation: bounce 2s infinite;
  }
}

@keyframes bounce {

  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-10px);
  }

  60% {
    transform: translateY(-5px);
  }
}

.main-content-area {
  display: flex;
  gap: 20px; // 主内容区和侧边栏的间距
  padding: clamp(20px, 4vw, 40px) clamp(15px, 3vw, 20px); // Responsive padding
  max-width: 1300px; // 整体内容区域最大宽度
  margin: 0 auto; // 居中

  @media (max-width: 992px) {
    flex-direction: column; // 在中等屏幕及以下，侧边栏堆叠到主内容下方
  }
}

.blog-posts-container {
  flex: 3; // 主内容区占据更大比例
  min-width: 0; // 防止 flex item 内容溢出
}

.sidebar {
  flex: 1; // 侧边栏占据较小比例
  min-width: 280px; // 侧边栏最小宽度
  // max-width: 320px; // 侧边栏最大宽度，避免过宽
}

.posts-grid {
  column-count: 3;
  column-gap: 20px;

  @media (max-width: 992px) {
    column-count: 2;
  }

  @media (max-width: 768px) {
    column-count: 1;
  }
  // Note: For very large screens with sidebar, 3 columns might be too wide for the main content.
  // Consider adjusting flex-basis of .blog-posts-container if more columns are desired on large screens.
}

// Styles for .post-category and .post-tags remain here as they are part of the slot content
// provided by HomeView.vue. The base card styles are now in _blog-post-card.scss.

// Styling for the content provided to the 'category' slot
.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem; // Slightly larger meta text
  color: var(--el-text-color-secondary); // Element Plus secondary text color
  margin-bottom: 8px;
}

.post-category { // This class is used within the #category slot
  display: flex;
  align-items: center;
  cursor: pointer;

  .tag-icon-svg { // Icon within the category span
    color: currentColor; // Inherits color from .post-category or .post-meta
    // margin-right is already on tag-icon-svg globally, but can be adjusted if needed
  }

  &:hover {
    color: var(--el-color-primary);
    text-decoration: underline;
  }
}

// Styling for the content provided to the 'tags' slot
.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  .post-tag-item {
    cursor: pointer;
    // Specific styling for el-tag if needed, beyond Element Plus defaults
  }
}

// Sidebar Info Cards Styling
.info-card {
  // Acrylic effect
  background-color: var(--acrylic-bg-current);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%); /* Safari */

  border: 1px solid var(--acrylic-sidebar-border-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 var(--acrylic-shadow-current);

  .info-card-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--el-text-color-primary); // Element Plus primary text color
    margin-top: 0;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
}

.personal-info-card {
  text-align: center;

  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 15px;
    border: 3px solid var(--el-color-primary-light-3);
  }

  .bio {
    font-size: 0.9rem;
    color: var(--el-text-color-secondary); // Element Plus secondary text color
    line-height: 1.5;
  }
}

.tag-icon-svg {
  margin-right: 8px;
  font-size: 1.1em; // Slightly smaller default icon size for lists
  vertical-align: middle;
  /* 确保图标与文字垂直对齐良好 */
}

.category-list,
.tag-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    padding: 6px 0; // Add some padding for list items
    display: flex;
    align-items: center;
    font-size: 0.95rem;
    color: var(--el-text-color-regular); // Element Plus regular text color
    cursor: pointer;
    transition: color 0.2s ease;
    border-radius: 4px; // For hover effect background

    &:hover {
      color: var(--el-color-primary); // Use theme primary color on hover
      // background-color: var(--el-fill-color-light); // Optional: subtle background on hover
    }
  }
}


.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  li {
    padding: 0; // Reset padding as .tag-item will handle it
    &:hover { background-color: transparent; } // Prevent li hover if tag-item handles it
  }

  .tag-item {
    background-color: var(--el-fill-color); // Use a slightly darker fill than -light
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.85rem;
    color: var(--el-text-color-secondary);
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover {
      background-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }
  }
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center; // 垂直居中不同大小的标签

  .tag-cloud-item {
    color: var(--el-text-color-secondary); // Element Plus secondary text color
    padding: 2px 5px;
    transition: color 0.2s ease, transform 0.2s ease;
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary); // Use theme primary color on hover
      transform: scale(1.1);
    }
  }
}

.site-stats-card {
  .stats-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 0.9rem; // Consistent font size
      color: var(--el-text-color-regular); // Element Plus regular text color
      border-bottom: 1px dashed var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }
      strong {
        color: var(--el-text-color-primary);
        font-weight: 600;
      }
    }
  }
}
</style>
