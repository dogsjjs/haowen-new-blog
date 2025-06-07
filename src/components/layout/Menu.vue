<template>
  <el-menu :default-active="activeMenu" mode="horizontal" :ellipsis="false" class="app-menu"
    background-color="transparent" text-color="var(--text-color-current)"
    active-text-color="var(--primary-color-current)" router>
    <template v-for="item in menuItems" :key="item.index">
      <el-menu-item v-if="!item.children" :index="item.path || item.index">
        <!-- <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon> -->
        <span>{{ item.title }}</span>
      </el-menu-item>
      <!-- 如果需要支持子菜单，可以在这里添加 el-sub-menu -->
      <!--
      <el-sub-menu v-else :index="item.index">
        <template #title>
          <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </template>
<el-menu-item v-for="child in item.children" :key="child.index" :index="child.path || child.index">
  {{ child.title }}
</el-menu-item>
</el-sub-menu>
-->
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { MenuItem } from '@/types/menu' // 导入菜单项类型

defineProps<{
  menuItems: MenuItem[];
}>()

const route = useRoute()

const activeMenu = computed(() => {
  const { meta, path } = route
  // 如果路由元信息中有 activeMenu，则使用它，否则使用当前路径
  if (meta.activeMenu) {
    return meta.activeMenu as string
  }
  return path
})
</script>

<style lang="scss" scoped>
.app-menu {
  border-bottom: none; // 移除 el-menu 默认的下边框
  height: var(--header-height); // 确保菜单和头部一样高

  .el-menu-item {
    background-color: transparent !important; // 确保菜单项背景透明以显示亚克力效果

    &:hover {
      background-color: rgba(128, 128, 128, 0.1) !important; // 轻微的 hover 背景
    }
  }

  // 如果使用了 el-sub-menu，也需要确保其背景透明
  // :deep(.el-sub-menu__title) {
  //   &:hover {
  //     background-color: rgba(128, 128, 128, 0.1) !important;
  //   }
  // }
}
</style>