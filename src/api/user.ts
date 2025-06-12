import http from '@/utils/request';
import { setToken } from '@/utils/auth';

interface Token {
  token: string;
}

enum PATH {
  login = '/user/login'
}

interface LoginForm {
  username: string,
  password: string
}


export async function login(data: LoginForm): Promise<boolean> {
  try {
    const response = await http.post<Token>(PATH.login, data);
    if (response.success && response.data) {
      // 登录成功 保存token
      setToken(response.data.token)
      return true
    } else {
      return false
    }
  } catch (error) {
    // 这个 catch 理论上 request 函数内部已经处理了网络层面的错误
    // 但如果 request 内部的错误处理有遗漏，这里可以作为最后防线
    console.error('请求过程中发生意外错误:', error);
    return false
  }
}
