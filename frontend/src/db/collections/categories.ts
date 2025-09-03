import { createCollection } from '@tanstack/react-db';
import { queryCollectionOptions } from '@tanstack/query-db-collection';
import { categorySchema, type Category, type NewCategoryInput } from '../index';
import { CategoryService } from '../../services/categories/categories.service';
import { queryClient } from '../queryClient';

export const categoriesCollection = createCollection<Category>(
  queryCollectionOptions({
    queryKey: ['categories'],
    queryClient,
    getKey: (category: Category) => category.id.toString(),
    schema: categorySchema,

    queryFn: async () => {
      return await CategoryService.index();
    },

    onInsert: async ({ transaction }) => {
      const { changes } = transaction.mutations[0];
      const newCategory = changes as NewCategoryInput;
      return await CategoryService.create(newCategory);
    },

    onUpdate: async ({ transaction }) => {
      const { key: id, changes } = transaction.mutations[0];
      return await CategoryService.update(id, changes);
    },

    onDelete: async ({ transaction }) => {
      const { key: id } = transaction.mutations[0];
      await CategoryService.destroy(id);
      return { refetch: false }; // Or { refetch: true } depending on your needs
    },
  })
);

// Helper functions
export function getCategoryById(categories: Category[], id: number) {
  return categories.find(cat => cat.id === id);
}

export function getChildCategories(categories: Category[], parentId: number | null) {
  return categories.filter(cat => cat.parent_id === parentId);
}

export function buildCategoryTree(categories: Category[], parentId: number | null = null): Category[] {
  return categories
    .filter(category => category.parent_id === parentId)
    .map(category => ({
      ...category,
      children: buildCategoryTree(categories, category.id)
    }));
};
