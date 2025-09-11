import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CategoryForm } from './CategoryForm';
import type { NewCategoryInput } from '../../types/models';
import { emitError } from '../../services/errorBus';
import { categoriesCollection } from '../../db';
import { useLiveQuery, eq } from '@tanstack/react-db';

export const CategoryEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { data: categories, isLoading } = useLiveQuery((q) =>
    q.from({ c: categoriesCollection })
      .where(({ c }) => eq(c.id, parseInt(id || '0')))
      .select(({ c }) => ({ ...c }))
  );
  const category = categories?.[0];

  useEffect(() => {
    if (!isLoading && (!id || (categories && categories.length === 0))) {
      emitError('Category not found');
      navigate('/categories');
    }
  }, [categories, id, navigate, isLoading]);

  if (isLoading || !category) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  const handleSubmit = async (formData: NewCategoryInput) => {
    try {
      if (!category?.id) {
        throw new Error('Category ID is required for update');
      }

      if (!formData.name) {
        throw new Error('Category name is required');
      }

      setIsSubmitting(true);
      await categoriesCollection.update(category.id.toString(), (draft) => {
        draft.name = formData.name;
        draft.parent_id = formData.parent_id;
      });
      
      navigate('/categories');
    } catch (error) {
      emitError(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const header = (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h1 className="text-2xl font-bold text-neutral-900">
        Edit Category
      </h1>
    </div>
  );

  return (
    <CategoryForm
      initialCategory={category}
      onSubmit={handleSubmit}
      isEditing={true}
      header={header}
      submitButtonText={isSubmitting ? 'Saving...' : 'Save Changes'}
    />
  );
};

export default CategoryEdit;
