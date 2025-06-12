<template>
  <div class="login-view">
    <h1 class="login-title">后台登录</h1>
    <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form" label-position="top"
      @submit.prevent="handleLogin">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="loginForm.username" placeholder="请输入用户名" clearable />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="loginForm.password" placeholder="请输入密码" show-password clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleLogin" class="login-button" :loading="loading">
          登录
        </el-button>
      </el-form-item>
      <el-alert v-if="errorMsg" :title="errorMsg" type="error" show-icon :closable="false" class="error-alert" />
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';
import { login } from '@/api/user';

const loginFormRef = ref<FormInstance>();
const loginForm = reactive({
  username: '',
  password: '',
});

const loginRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
});

const errorMsg = ref('');
const loading = ref(false);
const router = useRouter();
const route = useRoute();

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  errorMsg.value = '';
  loading.value = true;

  // 验证表单
  try {
    // 如果验证失败，validate() 会 reject，并被下面的 catch 块捕获
    await loginFormRef.value.validate();

    // 如果代码执行到这里，说明表单验证成功
    const success = await login({ username: loginForm.username, password: loginForm.password });
    console.log('Login success:', success);

    if (success) {
      const redirectPath = route.query.redirect as string | undefined;
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.push({ name: 'admin-dashboard' }); // 默认跳转到后台首页
      }
    } else {
      errorMsg.value = '用户名或密码错误！';
    }
  } catch (validationOrApiError) {
    // validationOrApiError 可能是表单验证错误对象，也可能是 authService.login 抛出的错误
    // Element Plus 的 validate 在失败时会 reject 一个包含未通过校验字段的对象
    // 对于 API 错误，我们假设它会抛出一个 Error 对象
    if (validationOrApiError && typeof validationOrApiError === 'object' && Object.keys(validationOrApiError).some(key => Array.isArray((validationOrApiError as any)[key]))) {
      // 这是 Element Plus 表单验证失败的典型结构
      console.log('Form validation failed:', validationOrApiError);
      // errorMsg.value = '请检查表单输入是否正确。'; // 可选：设置一个通用的验证失败消息
    } else {
      console.error('Login API error or other unexpected error:', validationOrApiError);
      errorMsg.value = '登录过程中发生错误，请稍后再试。';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.login-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 75vh;
  padding: 20px;
  box-sizing: border-box;
  // background: $bg-page; // 假设 $bg-page 在 variables.scss 中定义
}

.login-title {
  color: var(--text-color-current);
  margin-bottom: 2rem;
  font-size: 2.2rem; // 稍微调整标题大小
  font-weight: 300;
  text-align: center;
}

.login-form {
  max-width: 450px;
  width: 100%;
  padding: 30px 40px;
  background-color: var(--acrylic-bg-current);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  /* Safari */
  border-bottom: 1px solid var(--acrylic-border-current);
  box-shadow: 0 2px 12px 0 var(--acrylic-shadow-current);

  .el-form-item {
    margin-bottom: 22px; // Element Plus 默认是 18px，可以按需调整
  }

  .el-input {
    // 如果需要覆盖 Element Plus 输入框的默认样式，可以在这里添加
    // 例如，确保背景和文字颜色与亚克力主题一致
    // :deep(.el-input__wrapper) {
    //   background-color: $login-input-bg-color;
    // }
    // :deep(input) {
    //   color: $login-input-text-color;
    // }
  }

  .login-button {
    width: 100%;
    // Element Plus 按钮颜色会通过 type="primary" 继承主题色
    // 如果需要自定义，可以像这样：
    // background-color: $accent-color;
    // color: $login-button-text-color;
    // &:hover {
    //   background-color: $accent-color-hover;
    // }
  }

  .error-alert {
    margin-top: 0; // ElFormItem 已经有 margin-bottom
    // 如果 ElFormItem 下方还有其他元素，可能需要调整
  }
}
</style>