import { 
  createCollection, 
  queryCollectionOptions, 
  type CollectionInsertInfo, 
  type CollectionUpdateInfo, 
  type CollectionDeleteInfo 
} from '@tanstack/react-db';
import { categorySchema, type Category } from '../index';
import { CategoryService } from '../../services/categories/categories.service';

export const categoriesCollection = createCollection<Category>(
  queryCollectionOptions({
    name: 'categories',
    schema: categorySchema,
    queryKey: ['categories'],
    queryFn: async () => {
      return await CategoryService.index();
    },
    getKey: (category: Category) => category.id,
    onInsert: async ({ transaction }: CollectionInsertInfo<Category>) => {
      const { changes: newCategory } = transaction.mutations[0];
      return await CategoryService.create(newCategory);
    },
    onUpdate: async ({ transaction }: CollectionUpdateInfo<Category>) => {
      const { key: id, changes } = transaction.mutations[0];
      return await CategoryService.update(id, changes);
    },
    onDelete: async ({ transaction }: CollectionDeleteInfo<Category>) => {
      const { key: id } = transaction.mutations[0];
      await CategoryService.destroy(id);
      return { success: true };
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
