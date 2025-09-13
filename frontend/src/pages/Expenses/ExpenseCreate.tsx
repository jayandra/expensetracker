import { formatDate } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import { ExpenseForm } from './ExpenseForm';
import type { NewExpenseInput, Expense } from '../../types/models';
import { useNavigate } from 'react-router-dom';
import { emitError } from '../../services/errorBus';
import { expensesCollection } from '../../db';

export const ExpenseCreate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;

  const defaultExpense: NewExpenseInput = {
    amount: 0,
    description: '',
    date: formatDate(new Date()),
    category_id: 0,
  };

  const handleSubmit = async (formData: NewExpenseInput) => {
    try {
      if (!formData.amount || !formData.date || !formData.category_id) {
        throw new Error('Missing required expense fields');
      }

      const tempExpense: Expense = {
        ...formData,
        id: -1 // Temporary ID, will be replaced by the server
      };
      
      await expensesCollection.insert(tempExpense);
      navigate('/react/expenses');
    } catch (error) {
      emitError(error);
      throw error;
    }
  };

  const header = (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h1 className="text-2xl font-bold text-neutral-900">
        Add New Expense
      </h1>
    </div>
  );

  return (
    <ExpenseForm
      initialExpense={defaultExpense}
      onSubmit={handleSubmit}
      header={header}
      submitButtonText="Add Expense"
    />
  );
};

export default ExpenseCreate;
