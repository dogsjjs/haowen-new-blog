<template>
  <div class="admin-layout">
    <header class="admin-header">
      后台管理系统
      <!-- 可以放一些全局后台导航或用户信息 -->
      <button v-if="isLoggedIn" @click="handleLogout">登出</button>
    </header>
    <div class="admin-main-content">
      <aside class="admin-sidebar">
        <nav>
          <ul>
            <li><router-link :to="{ name: 'admin-dashboard' }">仪表盘</router-link></li>
            <!-- <li><router-link :to="{ name: 'admin-users' }">用户管理</router-link></li> -->
            <!-- 更多后台链接 -->
          </ul>
        </nav>
      </aside>
      <main class="admin-page-content">
        <router-view /> <!-- 子路由的视图会在这里渲染 -->
      </main>
    </div>
    <footer class="admin-footer">
      &copy; {{ new Date().getFullYear() }} My Admin Panel
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

// 模拟认证服务 (与 router/index.ts 中的保持一致或从共享模块导入)
const authService = {
  isLoggedIn: (): boolean => {
    return !!localStorage.getItem('isAuthenticated');
  },
  logout: () => {
    localStorage.removeItem('isAuthenticated');
  }
};

const router = useRouter();
const isLoggedIn = authService.isLoggedIn();

const handleLogout = () => {
  authService.logout();
  router.push({ name: 'login' });
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--admin-page-bg-color, #f4f6f9); /* 假设的后台背景色变量 */
}

.admin-header {
  background-color: var(--admin-header-bg-color, #333); /* 假设的后台头部背景色变量 */
  color: var(--admin-header-text-color, #fff); /* 假设的后台头部文字颜色变量 */
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-header button {
  background-color: var(--primary-color, #007bff);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}


.admin-main-content {
  display: flex;
  flex-grow: 1;
}

.admin-sidebar {
  width: 220px;
  background-color: var(--admin-sidebar-bg-color, #fff); /* 假设的后台侧边栏背景色变量 */
  padding: 20px;
  border-right: 1px solid var(--card-border-color, #e0e0e0);
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
  text-decoration: none;
  border-radius: 4px;
  margin-bottom: 5px;
}

.admin-sidebar li a:hover,
.admin-sidebar li a.router-link-exact-active {
  background-color: var(--primary-color-light, #e9f5ff); /* 假设的主题浅色变量 */
  color: var(--primary-color);
}

.admin-page-content {
  flex-grow: 1;
  padding: 20px;
  background-color: var(--page-bg-color); /* 可以使用与前台一致的页面背景，或特定后台页面背景 */
}

.admin-footer {
  text-align: center;
  padding: 15px;
  background-color: var(--admin-footer-bg-color, #e9ecef); /* 假设的后台底部背景色变量 */
  color: var(--text-color-secondary);
  border-top: 1px solid var(--card-border-color, #e0e0e0);
}
</style>
