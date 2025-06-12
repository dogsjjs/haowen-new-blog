import { getToken } from "./auth";

interface RequestOptions extends RequestInit {
  data?: Record<string, any>; // For POST, PUT, PATCH requests
  params?: Record<string, any>; // For GET request query parameters
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number; // Optional: backend might return a custom status code
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'; // 从环境变量或默认值获取API基础路径

/**
 * 通用请求函数
 * @param {string} url 请求的相对路径
 * @param {RequestOptions} options fetch API 的配置项，增加了 data 属性
 * @returns {Promise<ApiResponse<T>>} 包含后端响应的 Promise
 */
async function request<T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  // 获取token
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  // 默认 Content-Type
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.append('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  let fullUrl = `${BASE_URL}${url}`;

  // 处理 GET 请求的查询参数
  if (options.params && Object.keys(options.params).length > 0) {
    const queryParams = new URLSearchParams(options.params as Record<string, string>).toString();
    fullUrl = `${fullUrl}?${queryParams}`;
  }

  // 处理请求体
  if (options.data && config.method && ['POST', 'PUT', 'PATCH'].includes(config.method.toUpperCase())) {
    if (headers.get('Content-Type') === 'application/json') {
      config.body = JSON.stringify(options.data);
    } else if (options.data instanceof FormData) {
      config.body = options.data; // FormData 会自动设置 Content-Type
    }
    // 可以根据需要添加其他 Content-Type 的处理，例如 application/x-www-form-urlencoded
  }

  try {
    const response = await fetch(fullUrl, config);

    if (!response.ok) {
      // 处理 HTTP 错误状态
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        return {
          success: false,
          message: errorMessage,
          code: errorData.code || response.status,
        };
      } catch (e) {
        // 如果解析错误响应体失败，使用原始错误信息
        return {
          success: false,
          message: errorMessage,
          code: response.status,
        };
      }
    }

    // 尝试解析 JSON 响应体
    // 对于没有响应体的请求 (如 204 No Content)，response.json() 会报错
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true, data: undefined, code: response.status };
    }

    const responseData: T = await response.json();
    // 假设后端成功响应的结构是 { success: true, data: ..., message: ... }
    // 或者直接返回数据，我们包装一下
    if (typeof responseData === 'object' && responseData !== null && 'success' in responseData && typeof (responseData as any).success === 'boolean') {
      return responseData as ApiResponse<T>;
    } else {
      // 如果后端直接返回数据，我们将其包装成 ApiResponse 格式
      return { success: true, data: responseData, code: response.status };
    }

  } catch (error) {
    console.error('Request failed:', error);
    let message = '网络请求失败，请稍后重试。';
    if (error instanceof Error) {
      message = error.message;
    }
    return {
      success: false,
      message: message,
    };
  }
}

// 封装常用的 HTTP 方法
export const http = {
  get: <T = any>(url: string, params?: Record<string, any>, options: Omit<RequestOptions, 'params'> = {}) => {
    return request<T>(url, { ...options, method: 'GET', params });
  },
  post: <T = any>(url: string, data?: Record<string, any>, options: Omit<RequestOptions, 'data'> = {}) => {
    return request<T>(url, { ...options, method: 'POST', data });
  },
  put: <T = any>(url: string, data?: Record<string, any>, options: Omit<RequestOptions, 'data'> = {}) => {
    return request<T>(url, { ...options, method: 'PUT', data });
  },
  delete: <T = any>(url: string, options: RequestOptions = {}) => {
    return request<T>(url, { ...options, method: 'DELETE' });
  },
  patch: <T = any>(url: string, data?: Record<string, any>, options: Omit<RequestOptions, 'data'> = {}) => {
    return request<T>(url, { ...options, method: 'PATCH', data });
  },
  upload: <T = any>(url: string, formData: FormData, options: Omit<RequestOptions, 'body'> = {}) => {
    return request<T>(url, { ...options, method: 'POST', body: formData });
  }
};

export default http;