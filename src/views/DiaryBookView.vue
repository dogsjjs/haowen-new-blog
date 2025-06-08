<template>
  <div class="diary-book-view">

    <div class="diary-list">
      <div v-for="diary in diaries" :key="diary.id" class="diary-card" @click="showDiaryDetails(diary)">
        <h2 class="diary-title">{{ diary.title }}</h2>
        <p class="diary-content-preview">{{ diary.content }}</p>
        <p class="diary-date">{{ formatDate(diary.date) }}</p>
      </div>
    </div>

    <div v-if="isDialogVisible" class="dialog-overlay" @click.self="closeDialog">
      <div class="dialog-content">
        <button class="close-button" @click="closeDialog">&times;</button>
        <h3 class="dialog-title">日记详情</h3>
        <h4 class="selected-diary-title">{{ selectedDiary?.title }}</h4>
        <p class="selected-diary-content">{{ selectedDiary?.content }}</p>
        <p class="selected-diary-date">
          {{ selectedDiary ? formatDate(selectedDiary.date) : '' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface DiaryEntry {
  id: number;
  title: string;
  content: string;
  date: Date;
}

const diaries = ref<DiaryEntry[]>([
  {
    id: 1,
    title: '今天是个好天气',
    content:
      '今天天气晴朗，万里无云，心情也格外舒畅。早上出门散步，感受到了清新的空气和温暖的阳光。希望每天都能有这样的好心情。下午去图书馆看了一会儿书，感觉收获颇丰。晚上和家人一起吃了顿美味的晚餐。',
    date: new Date(2023, 10, 15, 9, 30),
  },
  {
    id: 2,
    title: '学习Vue的心得',
    content:
      '最近在学习Vue 3，Composition API 真的很强大，让代码组织更加灵活。`<script setup>` 语法糖也大大简化了组件的编写。不过，响应式系统的一些细节还需要深入理解。总的来说，Vue 是一个非常优秀的框架。',
    date: new Date(2023, 10, 14, 14, 0),
  },
  {
    id: 3,
    title: '一次有趣的旅行',
    content:
      '上周末去邻近的城市进行了一次短途旅行。那里的风景非常优美，有很多古老的建筑和美味的小吃。虽然只有短短两天，但感觉非常放松和愉快。下次有机会还会再去。这次旅行让我明白，偶尔从繁忙的生活中抽离出来，去看看外面的世界，是非常有益的。',
    date: new Date(2023, 10, 12, 18, 45),
  },
  {
    id: 4,
    title: '关于未来的思考',
    content:
      '夜深人静的时候，总喜欢思考一些关于未来的问题。未来的路要怎么走，目标是什么，如何才能成为更好的自己。这些问题或许没有标准答案，但思考的过程本身就很有意义。',
    date: new Date(2023, 10, 10, 23, 15),
  },
  {
    id: 5,
    title: '代码中的小确幸',
    content:
      '成功解决一个困扰已久的 bug，或者实现了一个优雅的算法，那种成就感是难以言喻的。编程虽然有时候很枯燥，但这些小确幸总能让人重新充满动力。',
    date: new Date(2023, 10, 9, 11, 20),
  },
]);

const selectedDiary = ref<DiaryEntry | null>(null);
const isDialogVisible = ref(false);

const showDiaryDetails = (diary: DiaryEntry) => {
  selectedDiary.value = diary;
  isDialogVisible.value = true;
};

const closeDialog = () => {
  isDialogVisible.value = false;
  // selectedDiary.value = null; // 可选：关闭时清除，避免数据残留显示
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<style lang="scss" scoped>
.diary-book-view {
  padding: 20px;
  max-width: 1140px;
  /* 限制最大宽度 */
  margin: 0 auto;
  /* 水平居中 */
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.diary-list {
  column-count: 3;
  column-gap: 20px;

  @media (max-width: 992px) {
    column-count: 2;
  }

  @media (max-width: 768px) {
    column-count: 1;
  }
}

.diary-card {
  background-color: var(--card-bg-color, #ffffff);
  border: 1px solid var(--card-border-color, #e4e7ed);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  break-inside: avoid;
  box-shadow: var(--card-shadow, 0 2px 12px 0 rgba(0, 0, 0, 0.1));
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--card-hover-shadow,
        0 4px 20px 0 rgba(0, 0, 0, 0.15));
  }

  .diary-title {
    font-size: 1.2em;
    margin-top: 0;
    margin-bottom: 10px;
    color: var(--text-color-primary, #303133);
  }

  .diary-content-preview {
    font-size: 0.9em;
    color: var(--text-color-secondary, #606266);
    line-height: 1.5;
    max-height: calc(0.9em * 1.5 * 3.5); // 约3行
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    margin-bottom: 10px;
  }

  .diary-date {
    font-size: 0.8em;
    color: var(--text-color-secondary, #909399);
    text-align: right;
  }
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--dialog-overlay-bg-color, rgba(0, 0, 0, 0.6));
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background-color: var(--dialog-bg-color, #ffffff);
  padding: 25px;
  border-radius: 8px;
  box-shadow: var(--card-shadow, 0 5px 15px rgba(0, 0, 0, 0.3));
  width: 80%;
  max-width: 600px;
  position: relative;
  color: var(--text-color-primary, #303133); // 确保对话框内文字颜色也使用变量

  .dialog-title {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 1.5em;
    color: var(--text-color-primary, #303133);
  }

  .selected-diary-title {
    font-size: 1.3em;
    margin-bottom: 10px;
  }

  .selected-diary-content {
    line-height: 1.6;
    margin-bottom: 15px;
    white-space: pre-wrap; // 保留换行和空格
  }

  .selected-diary-date {
    font-size: 0.9em;
    color: var(--text-color-secondary, #909399);
    text-align: right;
  }

  .close-button {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 1.8em;
    cursor: pointer;
    color: var(--text-color-secondary, #909399);

    &:hover {
      color: var(--text-color-primary, #303133);
    }
  }
}
</style>
