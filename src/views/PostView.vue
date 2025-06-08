<template>
  <div class="post-view">
    <div v-if="post" class="post-container">
      <header class="post-hero">
        <img :src="post.imageUrl" :alt="post.title" class="hero-image" />
        <div class="hero-content-overlay">
          <h1 class="hero-title">{{ post.title }}</h1>
          <p class="hero-date">{{ formatDate(post.date) }}</p>
          <section class="post-meta-section">
            <div v-if="post.categories && post.categories.length" class="meta-item categories">
              <span class="meta-label">分类:</span>
              <span v-for="category in post.categories" :key="category" class="meta-tag category-tag">
                {{ category }}
              </span>
            </div>
            <div v-if="post.tags && post.tags.length" class="meta-item tags">
              <span class="meta-label">标签:</span>
              <span v-for="tag in post.tags" :key="tag" class="meta-tag post-tag">
                {{ tag }}
              </span>
            </div>
          </section>
        </div>
      </header>
      <div class="container">
        <article class="post-content-detail" v-html="post.content"></article>
      </div>

    </div>
    <div v-else class="loading-placeholder">
      <p>加载文章中...</p>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router'; // 用于从路由获取参数
import { getPostById, type PostDetail } from '@/data/blogPost'; // 导入数据获取函数和类型

const post = ref<PostDetail | null>(null);
const route = useRoute();

const fetchPostData = async (postId: string) => {
  post.value = null; // Reset post while fetching new data
  const fetchedPost = await getPostById(postId);
  if (fetchedPost) {
    post.value = fetchedPost;
  } else {
    // 处理文章未找到的情况，例如跳转到 404 页面或显示提示信息
    console.error(`Post with ID ${postId} not found.`);
    // router.push('/404'); // 如果有404页面的话
  }
};

onMounted(() => {
  const postIdFromRoute = route.params.id as string; // 假设你的路由参数是 /post/:id
  if (postIdFromRoute) {
    fetchPostData(postIdFromRoute);
  } else {
    // 如果没有ID，可以加载一个默认文章或显示错误
    // 为了演示，我们加载 'my-first-post'
    fetchPostData('my-first-post');
    console.warn('No post ID found in route, loading default post.');
  }
});

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// 监听路由参数变化，以便在同一页面切换不同文章时重新加载数据
watch(
  () => route.params.id,
  (newId) => {
    if (newId && typeof newId === 'string') {
      fetchPostData(newId);
    }
  }
);
</script>

<style lang="scss" scoped>
.post-view {}

.post-container {
  max-width: 100%;
  margin: 0 auto;
}

.post-hero {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: var(--text-color-secondary, #ccc); // Placeholder bg for when image is loading

  .hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .hero-content-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 20px;
    background-color: var(--hero-overlay-bg, rgba(0, 0, 0, 0.45)); // 半透明黑色遮罩
    color: var(--hero-text-color, #ffffff); // 确保文字在图片上清晰可见

    .hero-title {
      font-size: 2.5em;
      margin-bottom: 15px;
      font-weight: 600;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);

      @media (max-width: 768px) {
        font-size: 2em;
      }
    }

    .hero-date {
      font-size: 1em;
      opacity: 0.9;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }

    .post-meta-section {
      max-width: 800px;
      margin: 20px auto;
      display: flex;
      flex-direction: column;
      gap: 15px;

      .meta-item {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      }

      .meta-label {
        font-weight: 500;
        // Inherit color from hero-content-overlay for better readability on dark backgrounds
        color: inherit; 
        opacity: 0.85; // Slightly less prominent than main hero text
        margin-right: 5px;
      }

      .meta-tag {
        display: inline-block;
        padding: 6px 14px; // Adjusted padding to be similar to CategoryView's buttons
        border-radius: 20px; // Pill-shaped like CategoryView's buttons
        font-size: 0.85em;
        // Use category-tag variables for styling, assuming they are defined globally
        // and provide good contrast on the hero overlay for both light/dark modes.
        // If these variables are designed for normal page backgrounds,
        // you might need specific variables for tags on dark overlays.
        background-color: var(--category-tag-bg, #f0f0f0);
        color: var(--category-tag-text-color, #333);
        border: 1px solid var(--category-tag-border-color, #dcdfe6);
        transition: all 0.3s ease;
        cursor: default; // These are display tags, not interactive buttons like in CategoryView

        &:hover {
          // Apply hover styles similar to CategoryView, if desired for visual feedback
          // For non-interactive tags, hover might not be strictly necessary
          // or could be more subtle.
          background-color: var(--category-tag-hover-bg, #e0e0e0);
          border-color: var(--category-tag-hover-border-color, #c0c0c0);
          // color: var(--category-tag-hover-text-color); // If text color changes on hover
        }
      }
      // If category-tag and post-tag need distinct styling based on different variables:
      // .category-tag {}
      // .post-tag {}
      // For now, they share the .meta-tag styling based on category-tag variables.
    }
  }
}

.container {
  max-width: 1140px;
  background-color: var(--page-bg-color, #ffffff);
  color: var(--text-color-primary, #303133);
  margin: 0 auto;
  padding: 20px;
}


.post-content-detail {
  max-width: 800px;
  margin: 0 auto 50px auto;
  padding: 20px;
  line-height: 1.75;
  font-size: 1rem; // Base font size for content
  color: var(--text-color-primary, #303133);

  // Basic styling for common HTML elements within v-html
  :deep(h2) {
    font-size: 1.8em;
    margin-top: 2em;
    margin-bottom: 0.8em;
    padding-bottom: 0.3em;
    border-bottom: 1px solid var(--card-border-color, #e4e7ed);
    color: var(--text-color-primary);
  }

  :deep(h3) {
    font-size: 1.5em;
    margin-top: 1.5em;
    margin-bottom: 0.6em;
    color: var(--text-color-primary);
  }

  :deep(p) {
    margin-bottom: 1.2em;
  }

  :deep(ul),
  :deep(ol) {
    margin-bottom: 1.2em;
    padding-left: 25px;
  }

  :deep(li) {
    margin-bottom: 0.5em;
  }

  :deep(a) {
    color: var(--primary-color, #409eff);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  :deep(pre) {
    background-color: var(--code-bg-color, #f4f4f4); // Define --code-bg-color for light/dark
    color: var(--code-text-color, #333); // Define --code-text-color for light/dark
    padding: 15px;
    border-radius: 6px;
    overflow-x: auto;
    margin-bottom: 1.2em;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9em;
  }

  :deep(code) {
    font-family: 'Courier New', Courier, monospace;
    // Inline code might have slightly different bg/color if needed
    // background-color: var(--inline-code-bg-color, #e9e9e9);
    // padding: 2px 4px;
    // border-radius: 3px;
  }

  :deep(blockquote) {
    margin: 1.5em 0;
    padding: 10px 20px;
    border-left: 4px solid var(--primary-color, #409eff);
    background-color: var(--blockquote-bg-color, #f9f9f9); // Define --blockquote-bg-color
    color: var(--text-color-secondary, #606266);
    font-style: italic;

    p {
      margin-bottom: 0;
    }
  }
}

.loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  font-size: 1.2em;
  color: var(--text-color-secondary, #909399);
}
</style>