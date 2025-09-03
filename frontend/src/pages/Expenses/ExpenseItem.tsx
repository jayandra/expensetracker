import { format } from 'date-fns';
import { type ExpenseWithCategory } from '../../types/models';

export const ExpenseItem = (transaction: ExpenseWithCategory) => {
  const isIncome = transaction.amount >= 0;

  return (
    <div className="flex items-center bg-white rounded-xl p-3 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center md:mr-3 ${
        isIncome ? 'bg-success-50 text-success-600' : 'bg-error-50 text-error-600'
      }`}>
        {isIncome ? '↑' : '↓'}
      </div>
      <div className="flex-1 md:mr-3">
        <div className="font-medium">{transaction.description || 'Untitled'}</div>
        <div className="text-xs text-neutral-500">
          {transaction.category?.name || 'Uncategorized'} • {format(new Date(transaction.date), 'MMM d, yyyy')}
        </div>
      </div>
      <div className={`font-semibold ${
        isIncome ? 'text-success-600' : 'text-error-600'
      }`}>
        ${Math.abs(transaction.amount).toFixed(2)}
      </div>
    </div>
  );
};

export default ExpenseItem;
