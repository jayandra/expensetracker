import type { Category } from '../../types/models';
import { getCategories, getCategory, createCategory, updateCategory, deleteCategory } from '../../api/endpoints/categories';

export const CategoryService = {
    index: getCategories,
    show: (id: number) => getCategory(id),
    create: (category: Category) => createCategory(category),
    update: (id: number, category: Category) => updateCategory(id, category),
    destroy: (id: number) => deleteCategory(id)
} as const;