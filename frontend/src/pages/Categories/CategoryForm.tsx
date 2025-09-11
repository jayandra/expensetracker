import { useState, useMemo } from 'react';
import FormInput from '../../components/Form/FormInput';
import Button from '../../components/Form/Button';
import WrapperTile from '../../components/WrapperTile';
import Layout from '../Layout';
import { useAuth } from '../../contexts/AuthContext';
import { emitError } from '../../services/errorBus';
import { useLiveQuery } from '@tanstack/react-db';
import { categoriesCollection, buildCategoryOptions } from '../../db';
import type { NewCategoryInput, Category } from '../../types/models';
import FormIconSelector from '../../components/Form/FormIconSelector';

interface CategoryFormProps {
  initialCategory: NewCategoryInput | Category;
  onSubmit: (category: NewCategoryInput) => void;
  isEditing?: boolean;
  header: React.ReactNode;
  submitButtonText: string;
}

export const CategoryForm = ({
  initialCategory,
  onSubmit,
  header,
  submitButtonText,
  isEditing = false
}: CategoryFormProps) => {
  const { user } = useAuth();
  const [isParentCategoryFocused, setIsParentCategoryFocused] = useState(false);
  const [category, setCategory] = useState(initialCategory || { icon: '', name: '', parent_id: null });
  
  const { data: allCategories = [] } = useLiveQuery(
    (q) => q.from({ categories: categoriesCollection }).select(({ categories }) => ({
      ...categories
    })),
    []
  );

  // Filter out the current category when editing to prevent circular references
  const categories = useMemo(() => {
    if (isEditing && initialCategory && 'id' in initialCategory) {
      const currentId = (initialCategory as Category).id;
      return allCategories.filter(cat => cat.id !== null && cat.id !== undefined && cat.id !== currentId);
    }
    return allCategories;
  }, [allCategories, isEditing, initialCategory]);

  const parentCategoryOptions = useMemo(() => {   
    if (isParentCategoryFocused) {
      return buildCategoryOptions(categories);
    }
    
    return [
      { value: '', label: 'No parent (root category)' },
      ...buildCategoryOptions(categories)
    ];
  }, [categories, isParentCategoryFocused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      emitError({ message: 'Please log in to manage categories' });
      return;
    }
    
    // No need to convert parent_id here as it's already handled in the onChange handler
    onSubmit(category);
  };

  return (
    <Layout header={header}>
      <WrapperTile>
        <form onSubmit={handleSubmit} className="w-full">
          <FormIconSelector
            label=""
            value={category.icon || ''}
            onChange={(icon: string) => {
              setCategory(prev => ({ ...prev, icon }));
            }}
          />
          <FormInput
                label=""
                name="name"
                type="text"
                required
                placeholder="Category name"
                value={category.name}
                onChange={(e) => setCategory({ ...category, name: e.target.value })}
              />  
          
          <div className="mb-4">
            <FormInput
              label=""
              name="parent_id"
              type="select"
              placeholder="Parent category (leave empty for root)"
              value={category.parent_id === null || category.parent_id === undefined ? '' : String(category.parent_id)}
              options={parentCategoryOptions}
              onFocus={() => setIsParentCategoryFocused(true)}
              onClick={() => setIsParentCategoryFocused(true)}
              onBlur={() => setTimeout(() => setIsParentCategoryFocused(false), 20)}
              onChange={(e) => {
                const value = e.target.value;
                setCategory({ 
                  ...category, 
                  parent_id: value === '' ? null : Number(value)
                });
              }}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary">
              {submitButtonText}
            </Button>
          </div>
        </form>
      </WrapperTile>
    </Layout>
  );
};

export default CategoryForm;
