import { http, HttpResponse, delay } from 'msw'
import type { ApiResponse } from '../utils/request';

// 定义一些模拟数据类型 (可选，但推荐)
interface Post {
  id: string;
  title: string;
  content: string;
  author?: string;
}

// 假设你的 API 请求路径都以 /api 开头
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'; // 从环境变量或默认值获取API基础路径

export const handlers = [
  // 模拟获取文章列表
  http.get(`${API_BASE_URL}/posts`, async () => {
    console.log(`MSW: Intercepted GET ${API_BASE_URL}/posts`);
    await delay(200); // 模拟网络延迟
    const postsData: Post[] = [
      { id: '1', title: 'Mocked Post 1: 学习 MSW', content: '这是第一篇由 MSW Mock 的文章内容。', author: '机器人小M' },
      { id: '2', title: 'Mocked Post 2: 集成 Mock 如此简单', content: '这是第二篇由 MSW Mock 的文章内容。', author: '机器人小M' },
    ];
    const response: ApiResponse<Post[]> = {
      success: true,
      data: postsData,
      message: '文章列表获取成功 (Mocked)',
      code: 200,
    };
    return HttpResponse.json(response);
  }),

  // 模拟获取单篇文章
  http.get(`${API_BASE_URL}/posts/:postId`, async ({ params }) => {
    const { postId } = params;
    console.log(`MSW: Intercepted GET ${API_BASE_URL}/posts/${postId}`);
    await delay(150);
    if (postId === '1') {
      const postData: Post = { id: '1', title: 'Mocked Post 1: 学习 MSW', content: '这是第一篇由 MSW Mock 的文章内容。', author: '机器人小M' };
      const response: ApiResponse<Post> = {
        success: true,
        data: postData,
        message: '文章获取成功 (Mocked)',
        code: 200,
      };
      return HttpResponse.json(response);
    }
    const errorResponse: ApiResponse = {
      success: false,
      message: '文章未找到 (Mocked)',
      code: 404,
    };
    return HttpResponse.json(errorResponse, { status: 404 });
  }),

  // 模拟创建新文章
  http.post(`${API_BASE_URL}/posts`, async ({ request }) => {
    const newPostData = await request.json() as Omit<Post, 'id'>; // 假设请求体不包含 id
    console.log(`MSW: Intercepted POST ${API_BASE_URL}/posts with data:`, newPostData);
    await delay(300);
    const createdPost: Post = { id: Date.now().toString(), ...newPostData };
    const response: ApiResponse<Post> = {
      success: true,
      data: createdPost,
      message: '文章创建成功 (Mocked)',
      code: 201,
    };
    return HttpResponse.json(response, { status: 201 });
  }),
]