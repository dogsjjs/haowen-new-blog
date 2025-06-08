<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue' // 默认布局作为备选
import AdminLayout from '@/layouts/AdminLayout.vue'; // 确保导入 AdminLayout

const route = useRoute();

const currentLayout = computed(() => {
  // 检查当前路由及其父路由的 meta.layout
  // 从最深匹配的路由开始向上查找
  for (let i = route.matched.length - 1; i >= 0; i--) {
    if (route.matched[i].meta && route.matched[i].meta.layout) {
      return route.matched[i].meta.layout;
    }
  }
  // 如果在匹配的路由链中都没有找到 layout，则使用父路由的 component 作为布局（如果它是布局组件）
  // 或者直接使用默认布局
  // 这是一个更复杂的场景，通常方式一是首选
  // 在当前场景下，如果 /admin 路由的 component 是 AdminLayout，
  // 并且子路由没有 meta.layout，这个逻辑可以调整为：
  // if (route.matched.some(record => record.path === '/admin' && record.components.default === AdminLayout)) {
  //   return AdminLayout;
  // }

  return DefaultLayout; // 默认布局
});

// const route = useRoute(); // 在 <script setup> 中可以直接使用 route
// 如果需要全局设置 Element Plus 的语言 (例如中文)
// import { ElConfigProvider } from 'element-plus'
// import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
// const locale = zhCn;
</script>

<script lang="ts">
// 如果需要在选项式 API 或 setup 函数外部访问路由，可以这样做，但对于 <script setup> 通常不需要
// import { defineComponent } from 'vue'
// export default defineComponent({ name: 'App' })
</script>

<template>
  <!-- <el-config-provider :locale="locale"> -->
    <component :is="currentLayout">
      <RouterView />
    </component>
  <!-- </el-config-provider> -->
</template>
