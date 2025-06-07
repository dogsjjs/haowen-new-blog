<script setup lang="ts">
import { RouterView } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue' // 确保路径正确

// 如果需要全局设置 Element Plus 的语言 (例如中文)
// import { ElConfigProvider } from 'element-plus'
// import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
// const locale = zhCn;
</script>

<template>
  <!-- <el-config-provider :locale="locale"> -->
    <DefaultLayout>
      <RouterView />
    </DefaultLayout>
  <!-- </el-config-provider> -->
</template>
