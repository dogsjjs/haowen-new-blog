<template>
  <el-header class="layout-header acrylic-style">
    <div class="logo" @click="goToHome">
      BBBlog
    </div>
    <div class="header-content">
      <AppMenu :menu-items="appMenuItems" />
    </div>
    <div class="toolbar">
      <el-tooltip :content="themeStore.isDark ? '切换到亮色模式' : '切换到暗色模式'" placement="bottom">
        <el-button :icon="themeStore.isDark ? SunnyIcon : MoonIcon" circle @click="themeStore.toggleDark()" />
      </el-tooltip>
    </div>
  </el-header>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Sunny as SunnyIcon, Moon as MoonIcon } from '@element-plus/icons-vue';
import { useThemeStore } from '@/stores/theme'; // 导入 theme store
import AppMenu from '@/components/layout/Menu.vue'; // 导入新的菜单组件
import appRouter, { generateMenuItems } from '@/router'; // 导入路由实例和生成函数
import type { MenuItem } from '@/types/menu';

const themeStore = useThemeStore(); // 使用 store
const router = useRouter();

const appMenuItems = computed<MenuItem[]>(() => generateMenuItems(appRouter.options.routes));

const goToHome = () => {
  router.push('/');
};

</script>
<style lang="scss" scoped>
.layout-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: sticky; /* 可以让头部在滚动时固定 */
  top: 0;
  z-index: 1000;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
.header-content {
  flex-grow: 1;
  display: flex;
  justify-content: center; /* 让菜单在可用空间内居中 */
}

.acrylic-style {
  background-color: var(--acrylic-bg-current);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%); /* Safari */
  border-bottom: 1px solid var(--acrylic-border-current);
  box-shadow: 0 2px 12px 0 var(--acrylic-shadow-current);
}
.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-color-current);
  cursor: pointer; /* 添加手型光标，提示用户可以点击 */
  margin-right: 20px; /* 给 logo 和菜单之间一些间距 */
}
.toolbar {
  display: flex;
  align-items: center;
  margin-left: 20px; /* 给菜单和工具栏之间一些间距 */
}

// .header-menu 相关的样式现在移到了 AppMenu.vue 中
</style>