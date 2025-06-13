import http from '@/utils/request';
import type { ICategory, CreateCategoryDTO, UpdateCategoryDTO, QueryCategoryDTO, CategoryResult } from '@/types/category.type'; // Adjust path as needed


const API_PREFIX = '/category'; // 后端标签 API 的前缀

enum CHILDREN_PATH {
  FOR_SELECT = 'select-options', // Corresponds to POST /category
}

export async function addCategory(data: CreateCategoryDTO): Promise<ICategory | null> {
  try {
    // Assuming your http.post utility returns a structured response
    // e.g., { success: boolean, data?: ICategory, message?: string }
    const response = await http.post<ICategory>(API_PREFIX, data);
    if (response.success && response.data) {
      return response.data;
    } else {
      // console.error('Failed to add category:', response.message);
      return null;
    }
  } catch (error) {
    console.error('Error during addCategory request:', error);
    return null;
  }
}

export async function getAllCategories(data: QueryCategoryDTO): Promise<CategoryResult | null> {
  try {
    const response = await http.get<CategoryResult>(API_PREFIX, data);
    if (response.success && response.data) {
      return response.data;
    } else {
      // console.error('Failed to get all categories:', response.message);
      return null;
    }
  } catch (error) {
    console.error('Error during getAllCategories request:', error);
    return null;
  }
}


export async function getAllCategoriesForSelect(): Promise<Pick<ICategory, 'id' | 'name' | 'icon'>[]> {
  try {
    const response = await http.get<Pick<ICategory, 'id' | 'name' | 'icon'>[]>(`${API_PREFIX}/${CHILDREN_PATH.FOR_SELECT}`);
    if (response.success && response.data) {
      return response.data
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error during getAllCategories request:', error);
    return [];
  }
}

export async function getCategoryById(id: string): Promise<ICategory | null> {
  if (!id) {
    console.error('getCategoryById: ID is required.');
    return null;
  }
  try {
    const response = await http.get<ICategory>(`${API_PREFIX}/${id}`);
    if (response.success && response.data) {
      return response.data;
    } else {
      // console.error(`Failed to get category by ID ${id}:`, response.message);
      return null;
    }
  } catch (error) {
    console.error(`Error during getCategoryById request for ID ${id}:`, error);
    return null;
  }
}

export async function updateCategory(id: string, data: UpdateCategoryDTO): Promise<ICategory | null> {
  if (!id) {
    console.error('updateCategory: ID is required.');
    return null;
  }
  try {
    const response = await http.put<ICategory>(`${API_PREFIX}/${id}`, data);
    if (response.success && response.data) {
      return response.data;
    } else {
      // console.error(`Failed to update category with ID ${id}:`, response.message);
      return null;
    }
  } catch (error) {
    console.error(`Error during updateCategory request for ID ${id}:`, error);
    return null;
  }
}

/**
 * Deletes a category by its ID.
 * Backend typically returns 204 No Content on successful deletion.
 * The http utility should handle this and the `success` flag should reflect it.
 * @param id The ID of the category to delete.
 * @returns A promise that resolves to true if deletion was successful, false otherwise.
 */
export async function deleteCategory(id: string): Promise<boolean> {
  if (!id) {
    console.error('deleteCategory: ID is required.');
    return false;
  }
  try {
    const response = await http.delete<void>(`${API_PREFIX}/${id}`); // Backend might not return data for delete
    return response.success; // Assuming success flag indicates successful deletion
  } catch (error) {
    console.error(`Error during deleteCategory request for ID ${id}:`, error);
    return false;
  }
}