export interface MenuItem {
  index: string; // 对应 el-menu-item 的 index
  title: string; // 菜单项显示的文本
  path?: string;  // 对应的路由路径 (可选)
  icon?: string;  // 菜单项图标 (可选, Element Plus 图标名称或组件)
  children?: MenuItem[]; // 子菜单项 (可选)
}