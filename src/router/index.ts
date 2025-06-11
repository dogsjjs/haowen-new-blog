import { createRouter, createWebHashHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

import HomeView from "../views/HomeView.vue";

import AdminLayout from "@/layouts/AdminLayout.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: { title: "首页", showInMenu: false },
  },
  {
    path: "/post/:postId",
    name: "postViews",
    component: () => import("@/views/PostView.vue"),
    meta: { title: "文章", showInMenu: false },
  },
  {
    path: "/categories/:categoryId",
    name: "categoryViews",
    component: () => import("@/views/CategoryView.vue"),
    meta: { title: "分类", showInMenu: false },
  },
  {
    path: "/categories/all",
    name: "allCategory",
    component: () => import("@/views/CategoryView.vue"),
    meta: { title: "分类", showInMenu: true, menuIndex: "1" },
  },
  {
    path: "/tags/:tagId",
    name: "tagViews",
    component: () => import("@/views/TagView.vue"),
    meta: { title: "标签", showInMenu: false },
  },
  {
    path: "/tags/all",
    name: "allTag",
    component: () => import("@/views/TagView.vue"),
    meta: { title: "标签", showInMenu: true, menuIndex: "2" },
  },
  {
    path: "/archives",
    name: "blogArchives",
    component: () => import("@/views/BlogArchivesView.vue"),
    meta: { title: "归档", showInMenu: true, menuIndex: "3" },
  },
  {
    path: "/diary",
    name: "diaryBook",
    component: () => import("@/views/DiaryBookView.vue"),
    meta: { title: "日记", showInMenu: true, menuIndex: "4" },
  },
  {
    path: "/photo",
    name: "photo",
    component: () => import("@/views/PhotoView.vue"),
    meta: { title: "相册", showInMenu: true, menuIndex: "5" },
  },
  {
    path: "/recommendations",
    name: "personalRecommendations",
    component: () => import("@/views/RecommendationsView.vue"),
    meta: { title: "推荐", showInMenu: true, menuIndex: "6" },
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/admin/LoginView.vue"),
    meta: { title: '登录', guest: true }, // 可选：如果已登录，访问登录页时可以重定向到后台
  },
  // 后台管理路由
  {
    path: "/admin",
    meta: { requiresAuth: true, layout: AdminLayout }, // 这个父路由下的所有子路由都需要认证
    children: [
      {
        path: "", // 默认子路由，例如 /admin
        name: "admin-dashboard",
        component: () => import("@/views/admin/DashboardView.vue"),
        meta: {
          layout: AdminLayout, // 由 App.vue 使用
          showInSidebar: true, // 在侧边栏显示
          title: "仪表盘", // 菜单标题
          icon: "mdi:view-dashboard-outline", // Iconify 图标名称
        },
      },
      {
        path: "categories",
        name: "admin-categories",
        component: () => import("@/views/admin/CategoriesManagementView.vue"),
        meta: {
          layout: AdminLayout,
          showInSidebar: true,
          title: "博客类型管理",
          icon: "mdi:format-list-bulleted-type",
        },
      },
      {
        path: "tags",
        name: "admin-tags",
        component: () => import("@/views/admin/TagsManagementView.vue"),
        meta: {
          layout: AdminLayout,
          showInSidebar: true,
          title: "博客标签管理",
          icon: "mdi:tag",
        },
      },
      {
        path: "posts",
        name: "admin-posts",
        component: () => import("@/views/admin/PostsManagementView.vue"),
        meta: {
          layout: AdminLayout,
          showInSidebar: true,
          title: "博客文章管理",
          icon: "mdi:post-it-notes-outline",
        },
      },
      {
        path: "diaryBook",
        name: "admin-diaryBook",
        component: () => import("@/views/admin/DiaryBookManagementView.vue"),
        meta: {
          layout: AdminLayout,
          showInSidebar: true,
          title: "日记管理",
          icon: "mdi:notebook-edit-outline",
        },
      },
      {
        path: "photo",
        name: "admin-photo",
        component: () => import("@/views/admin/PhotoManagementView.vue"),
        meta: {
          layout: AdminLayout,
          showInSidebar: true,
          title: "相册管理",
          icon: "mdi:photo-library",
        },
      },
      {
        path: "settings",
        name: "admin-settings",
        component: () => import("@/views/admin/SettingsView.vue"),
        meta: {
          layout: AdminLayout,
          showInSidebar: true,
          title: "系统设置",
          icon: "mdi:cog-outline",
        },
      },
      // 在这里添加更多的后台管理子路由
      // {
      //   path: 'users',
      //   name: 'admin-users',
      //   component: () => import('../views/admin/UsersView.vue'),
      //   meta: { requiresAuth: true }
      // },
    ],
  },
  { path: "/:pathMatch(.*)*", name: "NotFound", component: () => import("@/views/error/NotFoundView.vue"), meta: { title: "404" } }, // 捕获所有未匹配的路由
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.VITE_APP_BASE_URL),
  routes,
});

// 模拟一个简单的认证服务
const authService = {
  isLoggedIn: (): boolean => {
    // 在实际应用中，这里会检查 token、session 或 Vuex/Pinia store
    // 例如: return !!localStorage.getItem('user-token');
    // 为了演示，我们暂时返回 false，表示未登录
    // 您可以修改这里来测试登录和未登录的情况
    return !!localStorage.getItem("isAuthenticated"); // 示例：使用localStorage
  },
  login: () => {
    // 模拟登录
    localStorage.setItem("isAuthenticated", "true");
  },
  logout: () => {
    // 模拟登出
    localStorage.removeItem("isAuthenticated");
  },
};

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const isLoggedIn = authService.isLoggedIn();

  if (to.meta.requiresAuth && !isLoggedIn) {
    // 如果目标路由需要认证但用户未登录
    console.log("User not authenticated, redirecting to login.");
    next({ name: "login", query: { redirect: to.fullPath } }); // 重定向到登录页，并带上原始目标路径
  } else if (to.meta.guest && isLoggedIn) {
    // 如果目标路由是访客页面（如登录页）但用户已登录
    console.log("User already authenticated, redirecting to admin dashboard.");
    next({ name: "admin-dashboard" }); // 重定向到后台首页
  } else {
    // 其他情况，正常放行
    next();
  }
});

router.afterEach((to) => {
  // 根据路由名动态设置文档的标题
  if (to.meta && to.meta.title) {
    document.title = import.meta.env.VITE_APP_TITLE + to.meta.title as string;
  }
});

export default router;

// 辅助函数：从路由配置生成菜单项
export function generateMenuItems(
  routes: readonly RouteRecordRaw[]
): import("@/types/menu").MenuItem[] {
  return routes
    .filter((route) => route.meta?.showInMenu)
    .map((route) => ({
      index: (route.meta?.menuIndex as string) || route.path, // 使用 meta.menuIndex 或 path 作为 index
      title: (route.meta?.title as string) || "Unnamed Menu",
      path: route.path, // 清理路径，移除参数
      // icon: route.meta?.icon as string, // 如果有图标
    }))
    .sort((a, b) => parseInt(a.index) - parseInt(b.index)); // 按 menuIndex 排序
}
