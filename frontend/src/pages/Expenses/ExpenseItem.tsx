import { useLiveQuery } from '@tanstack/react-db';
import { type Expense } from '../../types/models';
import { categoriesCollection, expensesCollection } from '../../db';
import { useNavigate } from 'react-router-dom';
import { emitError } from '../../services/errorBus';
import { Icon } from '../../components/ui/Icon';
import { useAuth } from '../../contexts/AuthContext';

export const ExpenseItem = (transaction: Expense) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isIncome = true;  // TODO: Add the ability to set a cateogy as income or expense type
  
  // Get the category directly from the cached collection
  const { data: categories } = useLiveQuery(
    (q) => q.from({ categories: categoriesCollection }).select(({categories}) => ({...categories})),
    []
  );
  
  // Find the category in the cached collection
  const category = categories?.find(cat => cat.id === transaction.category_id);
  
  const handleEdit = () => {
    navigate(`/react/expenses/${transaction.id}/edit`);
  };
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if(user?.demo_user){
        emitError({message: 'Test accounts do not have permission to perform this action.'});
        return;
    }
    
    const confirmDelete = window.confirm('Are you sure you want to delete this expense?');
    if (!confirmDelete) return;
    
    try {
      // The collection's onDelete handler will update the UI
      await expensesCollection.delete(transaction.id.toString());
    } catch (error) {
      console.error('Failed to delete expense:', error);
      emitError('Failed to delete expense. Please try again.');
    }
  };

  return (
    <div className="group flex items-center bg-white rounded-xl p-3 shadow-sm hover:bg-neutral-200">
      <div className={`w-12 h-10 rounded-full flex items-center justify-center md:mr-10 text-md font-medium ${
        isIncome ? 'bg-success-50 text-success-600' : 'bg-error-50 text-error-600'
      }`}>
        {category?.icon ? (
          <Icon name={category.icon} className="text-neutral-500" size="md" />
        ) : category?.name ? (
          <span>{category.name.charAt(0).toUpperCase()}</span>
        ) : (
          <span>?</span>
        )}
      </div>
      <div className="flex-1 md:mr-3">
        <div className="font-medium">{transaction.description || 'Untitled'}</div>
        <div className="text-xs text-neutral-500">
          {category?.name || 'Uncategorized'} • {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
        </div>
      </div>
      <div className="flex items-center relative w-24 justify-end">
        <div className={`font-semibold transition-all duration-200 group-hover:opacity-0 ${
          isIncome ? 'text-success-600' : 'text-error-600'
        }`}>
          $ {Math.abs(transaction.amount).toFixed(2)}
        </div>
        <div className="absolute right-0 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm rounded-lg">
          <button 
            onClick={handleEdit}
            className="p-1 rounded-md hover:bg-neutral-100 text-neutral-600 hover:text-secondary-600 transition-colors"
            aria-label="Edit expense"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
          <button 
            onClick={handleDelete}
            className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-600 hover:text-error-600 transition-colors"
            aria-label="Delete expense"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseItem;
