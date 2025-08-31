import { client } from "../http/client";
import type { Category } from "../../types/models";

export const getCategories = async (): Promise<Category[]> => {
    const response = await client.get('/categories');
    return response.data;
};

export const getCategory = async (id: number): Promise<Category> => {
    const response = await client.get(`/categories/${id}`);
    return response.data;
};

export const createCategory = async (category: Category): Promise<Category> => {
    const response = await client.post('/categories', category);
    return response.data;
};

export const updateCategory = async (id: number, category: Category): Promise<Category> => {
    const response = await client.put(`/categories/${id}`, category);
    return response.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
    await client.delete(`/categories/${id}`);
};