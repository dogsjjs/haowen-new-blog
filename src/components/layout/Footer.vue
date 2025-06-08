<template>
  <el-footer class="layout-footer acrylic-style">
    <p>&copy; {{ new Date().getFullYear() }} Haowen Blog. All rights reserved.</p>
  </el-footer>
</template>

<script setup lang="ts">
// No script needed for this simple footer
</script>

<style scoped lang="scss">
.layout-footer {
  height: var(--footer-height);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-color-current);
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.acrylic-style {
  background-color: var(--acrylic-bg-current);
  backdrop-filter: blur(10px) saturate(150%);
  -webkit-backdrop-filter: blur(10px) saturate(150%); /* Safari */
  border-top: 1px solid var(--acrylic-border-current);
  /* box-shadow: 0 -2px 8px 0 var(--acrylic-shadow-current); */ /* 页脚阴影可选 */
}
</style>