<template>
  <div class="default-layout">
    <LayoutHeader />
    <el-main class="layout-main-content">
      <slot></slot> <!-- 这里将渲染路由视图 -->
    </el-main>
    <LayoutFooter />
  </div>
</template>

<script setup lang="ts">
import LayoutHeader from '@/components/layout/Header.vue'
import LayoutFooter from '@/components/layout/Footer.vue'
</script>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* 确保布局至少填满整个视口高度 */
  background: transparent; /* 依赖 body 的背景 */
}

.layout-main-content {
  flex-grow: 1; /* 让主内容区域占据剩余空间 */
  /* 
    为了让亚克力效果在 Header/Footer 下方的内容上可见，
    内容区域本身不应有不透明背景，或者其背景应在亚克力元素之下。
    这里的 padding 是内容与浏览器边缘的间距，
    如果内容本身有卡片等，那些卡片可以有自己的背景。
  */
}
</style>