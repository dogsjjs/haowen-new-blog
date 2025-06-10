import http from '@/utils/request'; // 假设 @ 指向 src 目录

// 定义一些模拟数据类型 (可选，但推荐)
interface Post {
  id: string;
  title: string;
  content: string;
  author?: string;
}

export async function getAllPosts() {
  try {
    const response = await http.get<Post>('/posts');
    if (response.success && response.data) {
      console.log('用户资料:', response.data);
      // 更新组件状态等
    } else {
      console.error('获取用户资料失败:', response.message);
      // ElMessage.error(response.message || '获取用户资料失败');
    }
  } catch (error) {
    // 这个 catch 理论上 request 函数内部已经处理了网络层面的错误
    // 但如果 request 内部的错误处理有遗漏，这里可以作为最后防线
    console.error('请求过程中发生意外错误:', error);
    // ElMessage.error('请求异常');
  }
}

// 调用示例
// fetchUserProfile();
// updateBlogTitle('我的新博客标题');
