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

    <!-- 浏览量趋势图 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover" class="chart-card">
          <div class="chart-container">
            <Line v-if="chartData.datasets.length" :data="chartData" :options="chartOptions" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang='ts' setup>
import { ref, onMounted, computed } from 'vue'
import { Document, CollectionTag, Edit, View, Notebook } from '@element-plus/icons-vue'
// Chart.js imports
import {
  Chart as ChartJS,
  Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler)


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
const chartData = ref<{ labels: string[]; datasets: any[] }>({
  labels: [],
  datasets: []
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: true,
      text: '网站浏览量趋势',
      color: 'var(--el-text-color-primary)', // Default, will be updated
      font: {
        size: 16
      }
    },
    tooltip: { // Add tooltip styling
      backgroundColor: 'var(--el-bg-color-overlay)',
      titleColor: 'var(--el-text-color-primary)',
      bodyColor: 'var(--el-text-color-secondary',
      borderColor: 'var(--el-border-color-lighter)',
      borderWidth: 1
    }
  },
  scales: {
    x: {
      grid: {
        color: 'var(--el-border-color-lighter)' // Default, will be updated
      },
      ticks: {
        color: 'var(--el-text-color-secondary)' // Default, will be updated
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'var(--el-border-color-lighter)' // Default, will be updated
      },
      ticks: {
        color: 'var(--el-text-color-secondary)' // Default, will be updated
      }
    }
  }
})

const generateRandomChartData = () => {
  const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const data = labels.map(() => Math.floor(Math.random() * 800) + 100)
  return { labels, data }
}

onMounted(() => {
  const generatedData = generateRandomChartData()

  // Dynamically get CSS variable values for theme consistency
  const style = getComputedStyle(document.documentElement)
  const primaryColor = style.getPropertyValue('--el-color-primary').trim()
  const primaryColorLight9 = style.getPropertyValue('--el-color-primary-light-9').trim()
  const textColorPrimary = style.getPropertyValue('--el-text-color-primary').trim()
  const textColorSecondary = style.getPropertyValue('--el-text-color-secondary').trim()
  const borderColorLighter = style.getPropertyValue('--el-border-color-lighter').trim()
  const bgColorOverlay = style.getPropertyValue('--el-bg-color-overlay').trim() || '#ffffff'

  chartData.value = {
    labels: generatedData.labels,
    datasets: [
      {
        label: '浏览量',
        backgroundColor: primaryColorLight9, // Area fill color
        borderColor: primaryColor,
        data: generatedData.data,
        fill: false,
        tension: 0.3, // For a smooth line
        pointRadius: 3,
        pointBackgroundColor: primaryColor
      }
    ]
  }

  // Update chart options with theme colors
  chartOptions.value.plugins.title.color = textColorPrimary
  chartOptions.value.plugins.tooltip = { // Add tooltip styling
    backgroundColor: bgColorOverlay,
    titleColor: textColorPrimary,
    bodyColor: textColorSecondary,
    borderColor: borderColorLighter,
    borderWidth: 1
  }
  chartOptions.value.scales.x.grid.color = borderColorLighter
  chartOptions.value.scales.x.ticks.color = textColorSecondary
  chartOptions.value.scales.y.grid.color = borderColorLighter
  chartOptions.value.scales.y.ticks.color = textColorSecondary
})
</script>

<style scoped lang="scss">
.dashboard {
  padding: 16px;

  .stat-card {
    display: flex;
    align-items: center;
    min-height: 90px;
    margin-bottom: 18px;
    background: var(--el-bg-color);
    border: none;

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 18px;
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
    margin-top: 10px;
    background: var(--el-bg-color);

    .chart-container {
      width: 100%;
      min-height: 350px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
    }
  }
}
</style>