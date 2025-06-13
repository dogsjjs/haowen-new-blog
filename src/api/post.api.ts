import http from '@/utils/request';
import type { IPost, PostQueryDTO, PostResult, CreatePostDTO, UpdatePostDTO } from '@/types/post.type'

const API_PREFIX = '/post';

enum CHILDREN_PATH {
  REAL_ALL = 'all'
}

export async function addPost(post: CreatePostDTO): Promise<IPost | null> {
  try {
      // Assuming your http.post utility returns a structured response
      // e.g., { success: boolean, data?: ICategory, message?: string }
      const response = await http.post<IPost>(API_PREFIX, post);
      if (response.success && response.data) {
        return response.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error during addPost request:', error);
      return null;
    }
}

export async function getAllPosts(): Promise<PostResult | null> {
  try {
    const response = await http.get<PostResult>(`${API_PREFIX}/${CHILDREN_PATH.REAL_ALL}`);
    if (response.success && response.data) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error during getAllPost request:', error);
    return null;
  }
}


export async function updatePost(id: string, update: UpdatePostDTO): Promise<IPost | null> {
  try {
    const response = await http.put<IPost>(`${API_PREFIX}/${id}`, update);
    if (response.success && response.data) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error during getAllPost request:', error);
    return null;
  }
}

export async function deletePost(id: string): Promise<boolean> {
  try {
    await http.delete(`${API_PREFIX}/${id}`);
    return true; // 假设 delete 成功时不返回内容，或您的 http 工具会处理
  } catch (error) {
    console.error(`Error deleting tag with ID ${id}:`, error);
    return false;
  }
}