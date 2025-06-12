export interface ICategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string | Date; // Dates might be strings after JSON deserialization
  updatedAt: string | Date;
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  description?: string;
}
