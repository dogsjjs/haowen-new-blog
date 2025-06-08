<template>
  <div class="recommendations-view">

    <div class="category-selector">
      <button v-for="category in categories" :key="category.value" class="category-button"
        :class="{ active: activeCategory === category.value }" @click="selectCategory(category.value)">
        {{ category.label }}
      </button>
    </div>

    <div class="recommendations-list">
      <div v-for="item in filteredRecommendations" :key="item.id" :class="['recommendation-card', `${item.type}-card`]">
        <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.title" class="recommendation-image" />
        <div class="recommendation-content">
          <h2 class="recommendation-title">{{ item.title }}</h2>

          <!-- Movie Specific -->
          <template v-if="item.type === 'movie'">
            <p v-if="item.director" class="meta-info">导演: {{ item.director }}</p>
            <p v-if="item.year" class="meta-info">年份: {{ item.year }}</p>
          </template>

          <!-- Music Specific -->
          <template v-if="item.type === 'music'">
            <p class="meta-info">歌手: {{ item.artist }}</p>
            <p v-if="item.album" class="meta-info">专辑: {{ item.album }}</p>
            <p v-if="item.genre" class="meta-info">流派: {{ item.genre }}</p>
          </template>

          <!-- Book Specific -->
          <template v-if="item.type === 'book'">
            <p class="meta-info">作者: {{ item.author }}</p>
            <p v-if="item.year" class="meta-info">出版年份: {{ item.year }}</p>
          </template>

          <!-- Game Specific -->
          <template v-if="item.type === 'game'">
            <p v-if="item.developer" class="meta-info">开发商: {{ item.developer }}</p>
            <p v-if="item.platform?.length" class="meta-info">平台: {{ item.platform.join(', ') }}</p>
            <p v-if="item.genre" class="meta-info">类型: {{ item.genre }}</p>
          </template>

          <p class="recommendation-description">{{ item.description }}</p>

          <div v-if="item.rating" class="rating">
            评分: {{ item.rating }} / 5
          </div>
          <div v-if="item.tags?.length" class="tags">
            <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
      <div v-if="!filteredRecommendations.length" class="no-recommendations">
        暂无此类推荐。
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

type RecommendationCategoryType = 'movie' | 'music' | 'book' | 'game';

interface Category {
  label: string;
  value: RecommendationCategoryType;
}

interface BaseRecommendation {
  id: string | number;
  type: RecommendationCategoryType;
  title: string;
  imageUrl?: string;
  rating?: number; // 0-5
  tags?: string[];
  description: string;
}

interface MovieRecommendation extends BaseRecommendation {
  type: 'movie';
  director?: string;
  year?: number;
}

interface MusicRecommendation extends BaseRecommendation {
  type: 'music';
  artist: string;
  album?: string;
  genre?: string;
}

interface BookRecommendation extends BaseRecommendation {
  type: 'book';
  author: string;
  year?: number;
}

interface GameRecommendation extends BaseRecommendation {
  type: 'game';
  platform?: string[];
  genre?: string;
  developer?: string;
}

type RecommendationItem = MovieRecommendation | MusicRecommendation | BookRecommendation | GameRecommendation;

const categories = ref<Category[]>([
  { label: '🎬 电影', value: 'movie' },
  { label: '🎵 音乐', value: 'music' },
  { label: '📚 书籍', value: 'book' },
  { label: '🎮 游戏', value: 'game' },
]);

const activeCategory = ref<RecommendationCategoryType>(categories.value[0].value);

const allRecommendations = ref<RecommendationItem[]>([
  // Movies
  { id: 'm1', type: 'movie', title: '星际穿越', director: '克里斯托弗·诺兰', year: 2014, imageUrl: 'https://picsum.photos/id/27/1920/1080', rating: 4.8, description: '一部关于爱、时间与宇宙的史诗。', tags: ['科幻', '剧情', '冒险'] },
  { id: 'm2', type: 'movie', title: '盗梦空间', director: '克里斯托弗·诺兰', year: 2010, imageUrl: 'https://picsum.photos/id/7/1920/1080', rating: 4.7, description: '层层深入的梦境，挑战你的认知边界。', tags: ['科幻', '悬疑', '动作'] },
  // Music
  { id: 'mu1', type: 'music', title: 'Abbey Road', artist: 'The Beatles', album: 'Abbey Road', genre: '摇滚', imageUrl: 'https://picsum.photos/id/16/1920/1080', rating: 4.9, description: '甲壳虫乐队的经典之作，永恒的旋律。', tags: ['经典', '摇滚'] },
  { id: 'mu2', type: 'music', title: '夜曲', artist: '周杰伦', album: '十一月的肖邦', genre: '流行', imageUrl: 'https://picsum.photos/id/13/1920/1080', rating: 4.5, description: '一首充满故事感的歌曲，旋律优美。', tags: ['华语流行', '经典'] },
  // Books
  { id: 'b1', type: 'book', title: '三体', author: '刘慈欣', year: 2006, imageUrl: 'https://picsum.photos/id/21/1920/1080', rating: 4.9, description: '中国科幻的里程碑，宏大的宇宙叙事。', tags: ['科幻', '小说'] },
  { id: 'b2', type: 'book', title: '百年孤独', author: '加西亚·马尔克斯', year: 1967, imageUrl: 'https://picsum.photos/id/24/1920/1080', rating: 4.6, description: '魔幻现实主义的代表作，家族的百年兴衰。', tags: ['文学', '经典', '魔幻现实主义'] },
  // Games
  { id: 'g1', type: 'game', title: '塞尔达传说：旷野之息', developer: '任天堂', platform: ['Nintendo Switch', 'Wii U'], genre: '动作冒险', imageUrl: 'https://picsum.photos/id/13/1920/1080', rating: 5.0, description: '开放世界的标杆之作，自由探索的极致体验。', tags: ['开放世界', '冒险', 'RPG'] },
  { id: 'g2', type: 'game', title: '巫师3：狂猎', developer: 'CD Projekt Red', platform: ['PC', 'PS4', 'Xbox One', 'Switch'], genre: '角色扮演', imageUrl: 'https://picsum.photos/id/15/1920/1080', rating: 4.9, description: '剧情驱动的RPG神作，丰富的世界观和选择。', tags: ['RPG', '剧情', '开放世界'] },
]);

const filteredRecommendations = computed(() => {
  return allRecommendations.value.filter(item => item.type === activeCategory.value);
});

const selectCategory = (category: RecommendationCategoryType) => {
  activeCategory.value = category;
};

</script>

<style lang="scss" scoped>
.recommendations-view {
  padding: 20px;
  max-width: 1140px;
  /* 限制最大宽度 */
  margin: 0 auto;
  /* 水平居中 */
  font-family: 'Helvetica Neue', Arial, sans-serif;

  h1 {
    text-align: center;
    margin-bottom: 30px;
    color: var(--text-color-primary, #303133);
  }
}

.category-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  gap: 10px;

  .category-button {
    padding: 10px 18px;
    border: 1px solid #dcdfe6;
    border-color: var(--category-tag-border-color);
    border-radius: 20px;
    background-color: var(--category-tag-bg);
    color: var(--category-tag-text-color);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    font-size: 14px;

    &:hover {
      background-color: var(--category-tag-hover-bg);
      border-color: var(--category-tag-hover-border-color);
    }

    &.active {
      background-color: var(--category-tag-active-bg);
      color: var(--category-tag-active-text-color);
      border-color: var(--category-tag-active-border-color);
    }
  }
}

.recommendations-list {
  column-count: 3;
  column-gap: 20px;

  @media (max-width: 1200px) {
    column-count: 2;
  }

  @media (max-width: 768px) {
    column-count: 1;
  }
}

.recommendation-card {
  background-color: var(--card-bg-color, #ffffff);
  border: 1px solid var(--card-border-color, #e4e7ed);
  border-radius: 8px;
  margin-bottom: 20px;
  break-inside: avoid;
  box-shadow: var(--card-shadow, 0 2px 12px 0 rgba(0, 0, 0, 0.1));
  overflow: hidden; // To contain image border-radius
  display: flex;
  flex-direction: column;

  .recommendation-image {
    width: 100%;
    height: auto;
    max-height: 250px; // Adjust as needed
    object-fit: cover;
    border-bottom: 1px solid var(--card-border-color, #e4e7ed);
  }

  .recommendation-content {
    padding: 15px;
    flex-grow: 1; // Ensure content area takes remaining space
  }

  .recommendation-title {
    font-size: 1.3em;
    margin-top: 0;
    margin-bottom: 10px;
    color: var(--text-color-primary, #303133);
  }

  .meta-info {
    font-size: 0.9em;
    color: var(--text-color-secondary, #606266);
    margin-bottom: 5px;
  }

  .recommendation-description {
    font-size: 0.95em;
    color: var(--text-color-secondary, #606266);
    line-height: 1.6;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .rating {
    font-size: 0.9em;
    color: var(--primary-color, #f7ba2a); // Using primary for rating, or define a specific rating color
    margin-bottom: 10px;
    font-weight: bold;
  }

  .tags {
    margin-top: 10px;

    .tag {
      display: inline-block;
      background-color: var(--tag-bg-color, #ecf5ff);
      color: var(--tag-text-color, #409eff);
      border: 1px solid var(--tag-border-color, #d9ecff);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.75em;
      margin-right: 5px;
      margin-bottom: 5px;
    }
  }
}

// Type-specific card styling examples
.movie-card {

  // border-left: 5px solid var(--movie-accent-color, #ff6f61); // Example accent
  .recommendation-image {
    object-fit: cover; // Ensure movie posters are not distorted
  }
}

.music-card {
  border-left: 5px solid var(--music-accent-color, #61c9ff); // Example accent
}

.book-card {

  // border-left: 5px solid var(--book-accent-color, #61ffca); // Example accent
  .recommendation-image {
    object-fit: contain; // Better for book covers
    background-color: var(--image-bg-placeholder, #e9e9e9); // Placeholder for non-square images
  }
}

.game-card {
  border-left: 5px solid var(--game-accent-color, #ffc761); // Example accent
}

.no-recommendations {
  grid-column: 1 / -1; // Span all columns if using grid, or adjust for column-count
  text-align: center;
  padding: 20px;
  color: var(--text-color-secondary, #909399);
  font-size: 1.1em;
}
</style>
