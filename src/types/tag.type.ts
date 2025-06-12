// src/types/tag.type.ts

/**
 * 标签接口，对应后端返回的标签数据结构
 */
export interface ITag {
  id: string; // 标签ID
  name: string; // 标签名称
  description?: string; // 标签描述，可选
  icon?: string; // 标签图标，可选 (可以是图标名称、SVG代码或图片URL)
  postCount?: number; // 关联的文章数量，可选，后端可能会提供
  createdAt: string | Date; // 创建时间
  updatedAt: string | Date; // 更新时间
}

/**
 * 创建标签时使用的数据传输对象 (DTO)
 */
export interface CreateTagDTO {
  name: string;
  description?: string;
  icon?: string;
}

/**
 * 更新标签时使用的数据传输对象 (DTO)
 */
export interface UpdateTagDTO {
  name?: string;
  description?: string;
  icon?: string;
}

/**
 * 查询标签列表时，API 可能返回的结构
 * (如果与 CategoryResult 类似，可以考虑泛型化或复用)
 */
export interface TagResult {
  tags: ITag[];
  total: number; // 总标签数量，用于分页
  // 根据后端实际返回情况调整
}

/**
 * 查询标签列表时，传递给API的参数类型
 * (如果与 QueryCategoryDTO 类似，可以考虑泛型化或复用)
 */
export interface QueryTagDTO {
  page?: number;
  pageSize?: number;
  query?: string; // 搜索关键词
}