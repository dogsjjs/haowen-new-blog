<template>
  <div class="photo-album-container">
    <div class="masonry-layout">
      <div v-for="photo in photos" :key="photo.id" class="masonry-item">
        <el-card :body-style="{ padding: '0px' }" shadow="hover">
          <el-image :src="photo.url" :alt="photo.description" :preview-src-list="allImageUrls"
            preview-teleported fit="cover" :append-to-body="true" lazy />
          <div style="padding: 14px;">
            <p class="photo-description">{{ photo.description }}</p>
            <div class="bottom">
              <time class="time">{{ formatUploadTime(photo.uploadTime) }}</time>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
// Assuming Element Plus components like ElCard and ElImage are globally registered
// or auto-imported via a plugin like unplugin-vue-components.
// If not, you would need to import them:
// import { ElCard, ElImage } from 'element-plus';

interface Photo {
  id: number;
  url: string;
  description: string;
  uploadTime: Date;
}

const photos = ref<Photo[]>([
  { id: 1, url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg', description: '夜晚的城市灯光，绚丽多彩，展现了都市的繁华与活力。', uploadTime: new Date('2023-01-15T10:00:00Z') },
  { id: 2, url: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png', description: '美味多汁的汉堡，层层叠加的食材令人垂涎欲滴。', uploadTime: new Date('2023-02-20T14:30:00Z') },
  { id: 3, url: 'https://fuss10.elemecdn.com/1/34/19aa98b1fcb2781c4fba33d850549jpeg.jpeg', description: '森林中的小鹿，眼神清澈，姿态优雅，充满了灵气。', uploadTime: new Date('2023-03-10T09:15:00Z') },
  { id: 4, url: 'https://fuss10.elemecdn.com/0/6f/e35ff375812e6b0020b6b4e8f9583jpeg.jpeg', description: '精致的甜点，色彩诱人，口感细腻，带来甜蜜的享受。', uploadTime: new Date('2023-04-05T18:00:00Z') },
  { id: 5, url: 'https://fuss10.elemecdn.com/9/bb/e27858e973f5d7d3904835f46abbdjpeg.jpeg', description: '宏伟的城市天际线，高楼林立，象征着现代文明的进步。', uploadTime: new Date('2023-05-01T12:00:00Z') },
  { id: 6, url: 'https://fuss10.elemecdn.com/d/e6/c4d93a3805b3ce3f323f7974e6f78jpeg.jpeg', description: '宁静湖边的小木屋，环境优美，是放松心情的好去处。', uploadTime: new Date('2023-06-11T16:45:00Z') },
  { id: 7, url: 'https://fuss10.elemecdn.com/3/28/bbf893f792f03a54408b3b7a7ebf0jpeg.jpeg', description: '连绵起伏的山脉，云雾缭绕，宛如仙境般壮丽。', uploadTime: new Date('2023-07-22T21:00:00Z') },
  { id: 8, url: 'https://fuss10.elemecdn.com/2/11/6535bcfb26e4c79b48ddde44f4b6fjpeg.jpeg', description: '广阔沙漠中的道路，延伸至远方，充满了未知与探索。', uploadTime: new Date('2023-08-18T08:20:00Z') },
  { id: 9, url: 'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg', description: '丰盛的早餐，包含面包、鸡蛋和水果，营养均衡。', uploadTime: new Date('2023-09-01T07:00:00Z') },
  { id: 10, url: 'https://fuss10.elemecdn.com/1/8e/aeffeb4de74e2fde4bd74fc7b47a6jpeg.jpeg', description: '美丽的海滩风光，沙滩细腻，海水湛蓝，令人心旷神怡。', uploadTime: new Date('2023-09-15T17:30:00Z') },
]);

// Computed property for the preview image list, used by el-image
const allImageUrls = computed(() => photos.value.map(p => p.url));

// Function to format the upload time
const formatUploadTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
</script>

<style scoped>
.photo-album-container {
  padding: 20px;
  /* Light background for the page */
  max-width: 1140px;
  margin: 0 auto;
}

.photo-album-container h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
  font-weight: 600;
}

.masonry-layout {
  column-count: 4;
  /* Default to four columns */
  column-gap: 15px;
  /* Gap between columns */
}

.masonry-item {
  break-inside: avoid;
  /* Prevents items from breaking across columns */
  margin-bottom: 15px;
  /* Gap between items vertically */
  display: inline-block;
  /* Required for break-inside to work effectively */
  width: 100%;
  /* Ensure item takes full width of its column */
  box-sizing: border-box;
  transform: none;
}

.masonry-item .el-card {
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.masonry-item .el-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08);
}

.el-image {
  border-top-left-radius: 8px;
  /* Match card radius */
  border-top-right-radius: 8px;
}

.photo-description {
  font-size: 14px;
  color: #606266;
  margin-top: 0;
  margin-bottom: 10px;
  line-height: 1.5;
  min-height: calc(1.5em * 2);
  /* Reserve space for at least two lines */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  /* Limit to 2 lines */
  -webkit-box-orient: vertical;
}

.bottom {
  margin-top: 13px;
  line-height: 12px;
  display: flex;
  justify-content: flex-start;
  /* Align time to the left */
  align-items: center;
}

.time {
  font-size: 12px;
  color: #999;
}

/* Responsive adjustments for different screen sizes */
@media (max-width: 1200px) {
  .masonry-layout {
    column-count: 3;
    /* 3 columns for medium screens */
  }
}

@media (max-width: 768px) {
  .masonry-layout {
    column-count: 2;
    /* 2 columns for small screens */
  }

  .photo-album-container h1 {
    font-size: 1.8em;
  }
}

@media (max-width: 480px) {
  .masonry-layout {
    column-count: 1;
    /* 1 column for extra small screens */
  }

  .photo-album-container h1 {
    font-size: 1.5em;
  }
}
</style>