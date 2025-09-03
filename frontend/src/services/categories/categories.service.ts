import type { Category, NewCategoryInput } from '../../types/models';
import { getCategories, getCategory, createCategory, updateCategory, deleteCategory } from '../../api/endpoints/categories';

export const CategoryService = {
    index: getCategories,
    show: (id: number) => getCategory(id),
    create: (newcategory: NewCategoryInput) => createCategory(newcategory),
    update: (id: number, category: Partial<Category>) => updateCategory(id, category),
    destroy: (id: number) => deleteCategory(id)
} as const;