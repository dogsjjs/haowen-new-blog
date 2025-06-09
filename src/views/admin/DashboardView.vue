<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :xs="24" :sm="12" :md="6" v-for="stat in stats" :key="stat.label">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" :style="{ background: stat.bg }">
            <el-icon :size="32">
              <component :is="stat.icon" />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang='ts' setup>
import { ref, onMounted, computed } from 'vue'
import { Document, CollectionTag, Edit, View, Notebook } from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/theme'

// 随机生成统计数据
const stats = [
  {
    label: '博客分类',
    value: Math.floor(Math.random() * 8) + 3,
    icon: CollectionTag,
    bg: 'var(--el-color-primary-light-9)'
  },
  {
    label: '博客标签',
    value: Math.floor(Math.random() * 20) + 10,
    icon: Edit,
    bg: 'var(--el-color-success-light-9)'
  },
  {
    label: '博客文章',
    value: Math.floor(Math.random() * 80) + 20,
    icon: Document,
    bg: 'var(--el-color-warning-light-9)'
  },
  {
    label: '日记',
    value: Math.floor(Math.random() * 50) + 5,
    icon: Notebook,
    bg: 'var(--el-color-info-light-9)'
  },
  {
    label: '总浏览量',
    value: Math.floor(Math.random() * 50000) + 10000,
    icon: View,
    bg: 'var(--el-color-danger-light-9)'
  }
]
</script>

<style scoped lang="scss">

.dashboard {
  padding: 20px 16px;

  .stat-card {
    display: flex;
    align-items: center;
    min-height: 90px;
    margin-bottom: 18px;
    background: var(--el-bg-color);
    border: none;
    transition: background 0.3s;
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 18px;
      transition: background 0.3s;
    }
    .stat-info {
      .stat-value {
        font-size: 2rem;
        font-weight: bold;
        color: var(--el-text-color-primary);
      }
      .stat-label {
        font-size: 1rem;
        color: var(--el-text-color-secondary);
        margin-top: 2px;
      }
    }
  }

  .chart-card {
    background: var(--el-bg-color);
    .chart-container {
      width: 100%;
      min-height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
    }
  }
}
</style>