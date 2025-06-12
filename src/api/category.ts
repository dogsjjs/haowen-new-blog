import http from '@/utils/request'; // Using 'http' as per your example
import type { ICategory, CreateCategoryDTO, UpdateCategoryDTO } from '@/types/category.type'; // Adjust path as needed


enum PATH {
  ADD = '/category', // Corresponds to POST /category
  GET_ALL = '/category', // Corresponds to GET /category
  GET_BY_ID = '/category/', // Base path, ID will be appended, e.g., /category/:id
  UPDATE = '/category/', // Base path, ID will be appended, e.g., /category/:id
  DELETE = '/category/', // Base path, ID will be appended, e.g., /category/:id
}


export async function addCategory(data: CreateCategoryDTO): Promise<ICategory | null> {
  try {
    // Assuming your http.post utility returns a structured response
    // e.g., { success: boolean, data?: ICategory, message?: string }
    const response = await http.post<ICategory>(PATH.ADD, data);
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

export async function getAllCategories(): Promise<ICategory[] | null> {
  try {
    const response = await http.get<ICategory[]>(PATH.GET_ALL);
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

export async function getCategoryById(id: string): Promise<ICategory | null> {
  if (!id) {
    console.error('getCategoryById: ID is required.');
    return null;
  }
  try {
    const response = await http.get<ICategory>(`${PATH.GET_BY_ID}${id}`);
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
    const response = await http.put<ICategory>(`${PATH.UPDATE}${id}`, data);
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
    const response = await http.delete<void>(`${PATH.DELETE}${id}`); // Backend might not return data for delete
    return response.success; // Assuming success flag indicates successful deletion
  } catch (error) {
    console.error(`Error during deleteCategory request for ID ${id}:`, error);
    return false;
  }
}