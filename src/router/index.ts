import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";

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
    path: "/recommendations",
    name: "personalRecommendations",
    component: () => import("@/views/RecommendationsView.vue"),
    meta: { title: "推荐", showInMenu: true, menuIndex: "5" },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
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

