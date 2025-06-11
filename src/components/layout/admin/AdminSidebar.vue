<template>
  <aside class="admin-sidebar">
    <nav>
      <ul>
        <li v-for="item in sidebarMenuItems" :key="item.path">
          <router-link :to="item.path">
            <Icon v-if="item.meta?.icon" :icon="item.meta.icon as string" class="sidebar-icon" />
            {{ item.meta?.title || item.name || item.path }}
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, type RouteRecordRaw } from 'vue-router';
import { Icon } from '@iconify/vue';

const router = useRouter();
const allRoutes = router.getRoutes();

// 计算属性，用于生成侧边栏菜单项
const sidebarMenuItems = computed(() => {
  return allRoutes
    .filter(route =>
      route.path.startsWith('/admin') &&
      route.name && route.path !== '/admin' &&
      (route.meta?.showInSidebar === undefined || route.meta.showInSidebar === true) &&
      route.components?.default
    )
    .map(route => {
      return {
        path: route.path,
        name: route.name,
        meta: route.meta,
      } as { path: string; name: RouteRecordRaw['name']; meta: RouteRecordRaw['meta'] };
    });
});
</script>

<style scoped lang="scss">
.admin-sidebar {
  width: 220px;
  background-color: var(--page-bg-color, #fff);
  /* 假设的后台侧边栏背景色变量 */
  padding: 20px;
  border-right: 1px solid var(--card-border-color, #e0e0e0);
  /* 确保暗夜模式下边框颜色也能适配 */
}

.admin-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.admin-sidebar li a {
  display: block;
  padding: 10px 15px;
  color: var(--text-color-primary);
  /* 使用全局文本颜色变量 */
  text-decoration: none;
  border-radius: 4px;
  margin-bottom: 5px;
}
.sidebar-icon {
  margin-right: 8px;
  font-size: 1.1em;
  vertical-align: middle;
}

.admin-sidebar li a:hover,
.admin-sidebar li a.router-link-exact-active {
  background-color: var(--primary-color-light, #e9f5ff);
  /* 假设的主题浅色变量 */
  color: #eee;
  /* 使用全局主题色变量 */
}
</style>