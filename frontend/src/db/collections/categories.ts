import { createCollection } from '@tanstack/react-db';
import { queryCollectionOptions } from '@tanstack/query-db-collection';
import { categorySchema, type Category, type NewCategoryInput } from '../index';
import { CategoryService } from '../../services/categories/categories.service';
import { queryClient } from '../queryClient';
import { emitError } from '../../services/errorBus';

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
      try {
        const createdCategory = await CategoryService.create(newCategory);
      
        // Update the query cache
        queryClient.setQueryData<Category[]>(['categories'], (oldData = []) => {
          return [...oldData, createdCategory];
        });
        return { refetch: false, data: createdCategory };
      } catch (error) {
        emitError('Failed to create category');
        throw error;
      }
    },

    onUpdate: async ({ transaction }) => {
      const { key: id, changes } = transaction.mutations[0];
      
      const categoryId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(categoryId)) {
        throw new Error(`Invalid category ID: ${id}`);
      }
      
      // Get the current category to ensure we have all required fields
      const currentCategories = queryClient.getQueryData<Category[]>(['categories']) || [];
      const currentCategory = currentCategories.find(cat => cat.id === categoryId);
      
      if (!currentCategory) {
        throw new Error(`Category with id ${categoryId} not found`);
      }
      
      // Merge changes with current category and validate
      const categoryUpdate = {
        ...currentCategory,
        ...changes,
        id: categoryId // Ensure ID is preserved as a number
      };
      
      try {
        const updatedCategory = await CategoryService.update(categoryId, categoryUpdate);
        
        // Update the query cache
        queryClient.setQueryData<Category[]>(['categories'], (oldData = []) => {
          return oldData.map(category => category.id === categoryId ? updatedCategory : category);
        });
        
        return { refetch: false, data: updatedCategory };
      } catch (error) {
        emitError('Failed to update category');
        throw error;
      }
    },

    onDelete: async ({ transaction }) => {
      const { key: id } = transaction.mutations[0];
      const categoryId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      if (isNaN(categoryId)) {
        throw new Error(`Invalid category ID: ${id}`);
      }
      
      await CategoryService.destroy(categoryId);
      
      // Update the query cache
      queryClient.setQueryData<Category[]>(['categories'], (oldData = []) => {
        return oldData.filter(category => category.id !== categoryId);
      });
      
      return { refetch: false };
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

export function buildCategoryTree(categories: Category[], parentId: number | null = null, depth = 0): Category[] {
  return categories
    .filter(category => category.parent_id === parentId)
    .map(category => ({
      ...category,
      children: buildCategoryTree(categories, category.id, depth + 1)
    }));
}

interface CategoryOption {
  value: number;
  label: string;
  depth: number;
}

export function buildCategoryOptions(categories: Category[], parentId: number | null = null, depth = 0): CategoryOption[] {
  return categories
    .filter(category => category.parent_id === parentId)
    .flatMap(category => [
      {
        value: category.id,
        label: '\u00A0'.repeat(depth * 2) + (depth > 0 ? '└─ ' : '') + category.name,
        depth
      },
      ...buildCategoryOptions(categories, category.id, depth + 1)
    ]);
}
