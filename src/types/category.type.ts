export interface ICategory {
  id?: string; // 分类ID，通常由数据库生成或在创建时生成
  name: string; // 分类名称
  description?: string; // 分类描述，可选
  icon?: string; // 分类图标，可选
  createdAt?: Date; // 创建时间
  updatedAt?: Date; // 更新时间
  postCount?: number; // 该分类下的文章数量
}

export interface CreateCategoryDTO {
  name: string;
  description: string;
  icon?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  description?: string;
  icon?: string;
}


export interface QueryCategoryDTO {
  page?: number; // 当前页
  pageSize?: number; // 每页的总数
  query?: string; // 搜索关键字
}

// 查询所有标签的返回值类型
export interface CategoryResult {
  categories: ICategory[];
  total: number; 
  page: number; 
  pageSize: number
}