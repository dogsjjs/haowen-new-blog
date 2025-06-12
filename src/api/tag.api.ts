import http from '@/utils/request';
import type { ITag, CreateTagDTO, UpdateTagDTO, TagResult, QueryTagDTO } from '@/types/tag.type';

const API_PREFIX = '/tag'; // 后端标签 API 的前缀

/**
 * 获取所有标签 (支持分页和搜索)
 * @param params - 查询参数，包括分页和搜索关键词
 * @returns 包含标签列表和总数的对象，或在失败时返回 null
 */
export async function getAllTags(params: QueryTagDTO): Promise<TagResult | null> {
  try {
    // 假设后端返回的结构是 { success: boolean, data: TagResult, message?: string }
    // 或者直接是 TagResult，如果 http 工具已处理外层包装
    const response = (await http.get<TagResult>(API_PREFIX, params)).data;
    // 根据您的 http 工具的实际返回结构进行调整
    // 如果 http.get 直接返回 TagResult (或在成功时)，则：
    // return response;
    // 如果 http.get 返回 { success: boolean, data: TagResult } 结构：
    if (response && typeof response.total === 'number' && Array.isArray(response.tags)) {
      return response;
    }
    console.error('Failed to fetch tags or invalid response structure:', response);
    return null;
  } catch (error) {
    console.error('Error fetching all tags:', error);
    return null;
  }
}

/**
 * 添加新标签
 * @param data - 创建标签所需的数据
 * @returns 创建成功后的标签对象，或在失败时返回 null
 */
export async function addTag(data: CreateTagDTO): Promise<ITag | null> {
  try {
    const response = (await http.post<ITag>(API_PREFIX, data)).data;
    // 调整以匹配您的 http 工具的响应结构
    return response || null; // 如果成功直接返回 ITag，失败返回 null
  } catch (error) {
    console.error('Error adding tag:', error);
    return null;
  }
}

/**
 * 更新指定ID的标签
 * @param id - 要更新的标签ID
 * @param data - 更新标签所需的数据
 * @returns 更新成功后的标签对象，或在失败时返回 null
 */
export async function updateTag(id: string, data: UpdateTagDTO): Promise<ITag | null> {
  try {
    const response = (await http.put<ITag>(`${API_PREFIX}/${id}`, data)).data;
    return response || null;
  } catch (error) {
    console.error(`Error updating tag with ID ${id}:`, error);
    return null;
  }
}

/**
 * 删除指定ID的标签
 * @param id - 要删除的标签ID
 * @returns 如果删除成功返回 true，否则返回 false
 */
export async function deleteTag(id: string): Promise<boolean> {
  try {
    await http.delete(`${API_PREFIX}/${id}`);
    return true; // 假设 delete 成功时不返回内容，或您的 http 工具会处理
  } catch (error) {
    console.error(`Error deleting tag with ID ${id}:`, error);
    return false;
  }
}