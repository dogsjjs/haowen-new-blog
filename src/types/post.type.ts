import type { ICategory } from "./category.type";
import type { ITag } from "./tag.type";

// 后端返回的博客文章数据
export interface IPost {
  id?: string;  // 文章ID
  title: string; // 文章标题
  description?: string; // 文章描述，可选
  slug?: string; // 自定义 URL
  coverImage?: string; // 首图 URL
  categoryId: string; // 分类ID
  category?: ICategory; // 分类对象
  tagIds: string[]; // 标签ID数组
  tags?: ITag[]; // 标签对象数组
  content: string; // Markdown 内容
  isRecommended: boolean; // 是否推荐
  isPublic: boolean; // 是否公开
  viewCount: number; // 浏览次数
  createdAt?: Date; // 创建时间
  updatedAt?: Date; // 更新时间
}

export interface CreatePostDTO {

  title: string;

  description: string;

  slug?: string;

  coverImage: string;

  categoryId: string;

  tagIds?: string[];

  content: string;

  isRecommended?: boolean;

  isPublic?: boolean;

}

export interface UpdatePostDTO {
  title?: string;

  description?: string;

  slug?: string;

  coverImage?: string;

  categoryId?: string;

  tagIds?: string[];

  content?: string;

  isRecommended?: boolean;

  isPublic?: boolean;
}


/**
 * 查询标签列表时，API 可能返回的结构
 * (如果与 CategoryResult 类似，可以考虑泛型化或复用)
 */
export interface PostResult {
  posts: IPost[];
  total: number; // 总标签数量，用于分页
  // 根据后端实际返回情况调整
}

/**
 * 查询标签列表时，传递给API的参数类型
 */
export interface PostQueryDTO { // 用于查询文章列表的 DTO

  page?: number;

  pageSize?: number;

  categoryId?: string;

  // 可以是单个 tagId 或逗号分隔的多个 tagId
  tagId?: string[];

  keyword?: string; // 用于标题或内容搜索

  isPublic?: boolean; // 只查询公开或非公开的文章

  isRecommended: boolean;

}