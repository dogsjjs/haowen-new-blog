<script setup lang="ts">
import { ref } from 'vue';

interface Post {
  id: number;
  title: string;
  excerpt: string;
  imageUrl: string;
  imageHeight: number; // 用于瀑布流中不同的图片高度
  publishDate: string;
  category: string;
  tags: string[];
}

// 生成模拟博客文章数据
const generateMockPosts = (count: number): Post[] => {
  const mockPosts: Post[] = [];
  const LOREM_IPSUM_SHORT = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
  const LOREM_IPSUM_MEDIUM = "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
  const LOREM_IPSUM_LONG = "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

  const excerptsPool = [LOREM_IPSUM_SHORT, LOREM_IPSUM_MEDIUM, LOREM_IPSUM_LONG, LOREM_IPSUM_MEDIUM.substring(0, 100), LOREM_IPSUM_SHORT.substring(0, 30)];

  const mockCategories = ['技术分享', '生活随笔', '教程指南', '项目展示', '思考感悟'];
  const mockTags = ['Vue', 'JavaScript', '后端', '数据库', 'UI/UX', 'ElementPlus', 'Node.js', 'Python', '算法', '实战', '性能优化', '安全'];

  const getRandomDate = () => {
    const start = new Date(2022, 0, 1);
    const end = new Date();
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getRandomTags = (count: number) => {
    return [...mockTags].sort(() => 0.5 - Math.random()).slice(0, count);
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
      category: mockCategories[i % mockCategories.length],
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

const categories = ref([
  { id: 1, name: '技术栈', count: 5 },
  { id: 2, name: '生活感悟', count: 8 },
  { id: 3, name: '学习笔记', count: 12 },
  { id: 4, name: '资源分享', count: 3 },
]);

const tags = ref([
  { id: 1, name: 'Vue', count: 10 },
  { id: 2, name: 'JavaScript', count: 15 },
  { id: 3, name: '后端开发', count: 7 },
  { id: 4, name: '数据库', count: 6 },
  { id: 5, name: 'UI/UX设计', count: 4 },
  { id: 6, name: 'ElementPlus', count: 9 },
  { id: 7, name: 'Node.js', count: 5 },
  { id: 8, name: 'Python', count: 3 },
  { id: 9, name: '数据结构与算法', count: 7 },
  { id: 10, name: '项目实战', count: 11 },
]);

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
  router.push(`/category/${encodeURIComponent(categoryName)}`);
};

const navigateToTagPage = (tagName: string) => {
  console.log(`Navigating to tag page: ${tagName}`);
  router.push(`/tag/${encodeURIComponent(tagName)}`);
};

const totalCategories = computed(() => categories.value.length);
const totalTags = computed(() => tags.value.length);
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
          <article v-for="post in posts" :key="post.id" class="post-item" @click="navigateToPost(post.id)">
            <img :src="post.imageUrl" :alt="post.title" class="post-image" :style="{ height: `${post.imageHeight}px` }" />
            <div class="post-content">
              <div class="post-meta">
                <span class="post-date">{{ post.publishDate }}</span>
                <span class="post-category" @click.stop="navigateToCategoryPage(post.category)" title="查看该分类下的文章">
                  <el-icon><FolderOpened /></el-icon> {{ post.category }}
                </span>
              </div>
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-excerpt">{{ post.excerpt }}</p>
              <div class="post-tags">
                <el-tag v-for="tag in post.tags" :key="tag" type="info" size="small" effect="plain" class="post-tag-item" @click.stop="navigateToTagPage(tag)" title="查看该标签下的文章">
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </article>
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
              <a href="#">{{ category.name }} ({{ category.count }})</a>
            </li>
          </ul>
        </div>

        <!-- 标签列表卡片 (对应您说的“类型”) -->
        <div class="info-card">
          <h3 class="info-card-title">热门标签</h3>
          <ul class="tag-list">
            <li v-for="tag in tags.slice(0, 7)" :key="tag.id"> <!-- 显示部分标签 -->
              <a href="#" class="tag-item">{{ tag.name }}</a>
            </li>
          </ul>
        </div>


        <!-- 标签词云卡片 -->
        <div class="info-card">
          <h3 class="info-card-title">标签云</h3>
          <div class="tag-cloud">
            <a v-for="tag in tags" :key="tag.id" href="#" class="tag-cloud-item"
              :style="{ fontSize: `${0.8 + tag.count * 0.05}rem` }">
              {{ tag.name }}
            </a>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home-page {
  // 页面根元素
}

.landing-hero {
  height: 100vh; // 占满整个视口高度
  background-size: cover;
  background-position: center;
  position: relative;
  color: var(--el-color-white); // Use Element Plus variable for white
}

.landing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6); // Slightly darker overlay for better contrast in both modes
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
  font-weight: bold;
  margin-bottom: 0.5em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.landing-subtitle {
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  margin-bottom: 2em;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
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
  padding: 40px 20px;
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

.posts-section-title {
  // 原 .section-title
  text-align: center;
  font-size: clamp(2rem, 4vw, 2.5rem);
  margin-bottom: 40px;
  color: var(--el-text-color-primary); // Use Element Plus primary text color
}

.sidebar {
  flex: 1; // 侧边栏占据较小比例
  min-width: 280px; // 侧边栏最小宽度
  // max-width: 320px; // 侧边栏最大宽度，避免过宽
}

.posts-grid {
  column-count: 3; // 默认三列
  column-gap: 20px;

  @media (max-width: 992px) {
    // 中等屏幕两列
    // 当侧边栏堆叠时，这里可以恢复为3列或保持2列，取决于偏好
    column-count: 2;
  }

  @media (max-width: 768px) {
    // 小屏幕单列
    column-count: 1;
  }

  @media (min-width: 1200px) {
    // 较大屏幕，如果空间足够，可以考虑恢复3列
    // column-count: 3; // 如果希望在有侧边栏时，文章区依然是3列，需要调整 .blog-posts-container 的 flex-basis 或宽度
  }
}

.post-item {
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 15px;
  display: flex; // 改为flex布局，方便内容组织
  flex-direction: column; // 垂直排列图片和内容
  box-shadow: var(--el-box-shadow-light); // Use Element Plus light shadow variable
  cursor: pointer; // 为整个卡片添加手型光标
  break-inside: avoid-column; // 防止元素在列中被切割
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px); // 保持向上浮动效果
    box-shadow: var(--el-box-shadow); // 使用 Element Plus 的标准阴影变量，它会随主题变化
  }
}

.post-image {
  width: 100%;
  object-fit: cover; // 保持图片比例并填充
  border-radius: 6px;
  margin-bottom: 15px;
  // cursor: pointer; // 从图片上移除，因为整个卡片都可点击了
  background-color: var(--el-fill-color-light); // Use Element Plus variable for placeholder/light fill
}

.post-content {
  flex-grow: 1; // 内容区占据剩余空间
  display: flex;
  flex-direction: column;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;

  .post-category {
    display: flex;
    align-items: center;
    cursor: pointer;
    .el-icon {
      margin-right: 4px;
    }
  }
}

.post-tags {
  margin-top: auto; // 将标签推到底部
  padding-top: 10px; // 与摘要之间留出一些空间
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  .post-tag-item {
    cursor: pointer;
    // el-tag 已经有自己的样式，这里可以微调
    // 例如，如果想让标签更小或有不同背景
    // background-color: var(--el-color-info-light-8);
    // border-color: var(--el-color-info-light-5);
    // color: var(--el-text-color-secondary);
  }
}

.post-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--el-text-color-primary);
}

.post-excerpt {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}

// Sidebar Info Cards Styling
.info-card {
  background-color: var(--el-bg-color-overlay); // 使用 Element Plus 覆盖层背景色，更适合卡片
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--el-box-shadow-lighter);

  .info-card-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--el-text-color-primary);
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
    color: var(--el-text-color-secondary);
    line-height: 1.5;
  }
}

.category-list,
.tag-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    margin-bottom: 8px;

    a {
      text-decoration: none;
      color: var(--el-text-color-regular);
      font-size: 0.95rem;
      transition: color 0.2s ease;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  li {
    margin-bottom: 0; // 因为使用了gap
  }

  .tag-item {
    background-color: var(--el-fill-color-light);
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.85rem;

    &:hover {
      background-color: var(--el-color-primary-light-7);
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
    text-decoration: none;
    color: var(--el-text-color-secondary); // 初始颜色
    padding: 2px 5px;
    transition: color 0.2s ease, transform 0.2s ease;

    &:hover {
      color: var(--el-color-primary);
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
      font-size: 0.9rem;
      color: var(--el-text-color-regular);
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
