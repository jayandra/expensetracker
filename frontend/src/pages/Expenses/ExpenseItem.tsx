import { useLiveQuery } from '@tanstack/react-db';
import { type Expense } from '../../types/models';
import { categoriesCollection } from '../../db';

export const ExpenseItem = (transaction: Expense) => {
  const isIncome = transaction.amount >= 0;
    // Get the category directly from the cached collection
  const { data: categories } = useLiveQuery(
    (q) => q.from({ categories: categoriesCollection }).select(({categories}) => ({...categories})),
    []
  );
  
  // Find the category in the cached collection
  const category = categories?.find(cat => cat.id === transaction.category_id);

  return (
    <div className="flex items-center bg-white rounded-xl p-3 shadow-sm hover:bg-neutral-200">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center md:mr-3 ${
        isIncome ? 'bg-success-50 text-success-600' : 'bg-error-50 text-error-600'
      }`}>
        {isIncome ? '↑' : '↓'}
      </div>
      <div className="flex-1 md:mr-3">
        <div className="font-medium">{transaction.description || 'Untitled'}</div>
        <div className="text-xs text-neutral-500">
          {category?.name || 'Uncategorized'} • {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
        </div>
      </div>
      <div className={`font-semibold ${
        isIncome ? 'text-success-600' : 'text-error-600'
      }`}>
        $ {Math.abs(transaction.amount).toFixed(2)}
      </div>
    </div>
  );
};

export default ExpenseItem;
