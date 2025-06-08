<template>
  <div class="admin-layout">
    <!-- 顶部导航栏 -->
    <AdminHeader /> <!-- 使用 AdminHeader 组件 -->
    <div class="admin-main-content">
      <AdminSidebar /> <!-- 使用 AdminSidebar 组件 -->
      <el-main class="layout-main-content">
        <slot></slot> <!-- 这里将渲染路由视图 -->
      </el-main>
    </div>
    <LayoutFooter /> <!-- 使用 LayoutFooter 组件 -->
  </div>
</template>
<script setup lang="ts">
import AdminHeader from '@/components/layout/admin/AdminHeader.vue';
import AdminSidebar from '@/components/layout/admin/AdminSidebar.vue'; // 导入新的侧边栏组件
import LayoutFooter from '@/components/layout/Footer.vue'
</script>

<style scoped>
.admin-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: transparent; /* 依赖 body 的背景 */
  /* 假设的后台背景色变量 */
}

.admin-main-content {
  display: flex;
  flex-grow: 1;
}

.layout-main-content {
  flex-grow: 1;
  /* 可以使用与前台一致的页面背景，或特定后台页面背景 */
}
</style>
