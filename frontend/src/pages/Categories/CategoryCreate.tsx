import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CategoryForm } from './CategoryForm';
import type { NewCategoryInput } from '../../types/models';
import { categoriesCollection } from '../../db';
import { emitError } from '../../services/errorBus';

export default function CategoryCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (categoryData: NewCategoryInput) => {
    if (!user) {
      emitError('User not authenticated');
      return;
    }

    try {
      setIsSubmitting(true);
      const tempCategory = {
        ...categoryData,
        id: -1, // Temporary ID, will be replaced by the server
        user_id: user.id,
        position: 0, // Default position
        parent_id: categoryData.parent_id || null
      };
      
      await categoriesCollection.insert(tempCategory);
      navigate('/categories');
    } catch (error) {
      emitError('Failed to create category. Please try again.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const header = (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h1 className="text-2xl font-bold text-neutral-900">
       Add New Category
      </h1>
    </div>
  );

  return (
    <CategoryForm
      initialCategory={{ 
        name: '', 
        parent_id: null,
        user_id: user?.id || 0, // This will be overridden in handleSubmit
        position: 0, // This will be overridden in handleSubmit
        icon: null
      }}
      onSubmit={handleSubmit}
      header={header}
      submitButtonText={isSubmitting ? 'Creating...' : 'Create Category'}
    />
  );
}