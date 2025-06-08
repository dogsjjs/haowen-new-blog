<template>
  <div class="login-view">
    <h1>登录</h1>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="username">用户名:</label>
        <input type="text" id="username" v-model="username" />
      </div>
      <div>
        <label for="password">密码:</label>
        <input type="password" id="password" v-model="password" />
      </div>
      <button type="submit">登录</button>
      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// 模拟认证服务
const authService = {
  login: async (user: string, pass: string): Promise<boolean> => {
    // 实际应用中会调用API
    return new Promise(resolve => {
      setTimeout(() => {
        if (user === 'admin' && pass === 'password') {
          localStorage.setItem('isAuthenticated', 'true'); // 模拟登录成功
          resolve(true);
        } else {
          resolve(false);
        }
      }, 500);
    });
  }
};


const username = ref('');
const password = ref('');
const errorMsg = ref('');
const router = useRouter();
const route = useRoute();

const handleLogin = async () => {
  errorMsg.value = '';
  const success = await authService.login(username.value, password.value);
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
};
</script>

<style scoped>
.login-view {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.login-view div {
  margin-bottom: 15px;
}
.login-view label {
  display: block;
  margin-bottom: 5px;
}
.login-view input {
  width: calc(100% - 22px);
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.login-view button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.login-view button:hover {
  background-color: #0056b3;
}
.error {
  color: red;
  margin-top: 10px;
}
</style>
