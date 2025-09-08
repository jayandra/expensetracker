import { useNavigate } from 'react-router-dom';
import { ExpensesForm } from './ExpensesForm';
import { expensesCollection } from '../../db';
import { emitError } from '../../services/errorBus';
import type { Expense, NewExpenseInput } from '../../types/models';

type ExpenseFormData = Omit<Expense, 'id'> & { id?: number };

export function ExpenseFormWrapper({ mode }: { mode: 'add' | 'edit' }) {
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    navigate('/expenses');
  };

  const handleError = (error: unknown) => {
    emitError({ 
      message: `Error ${mode === 'add' ? 'adding' : 'updating'} expense!`,
      error: error instanceof Error ? error : undefined
    });
  };
  
  const handleSubmit = async (formData: ExpenseFormData) => {
    try {
      // Validate required fields
      if (!formData.amount || !formData.date || !formData.category_id || !formData.user_id) {
        throw new Error('Missing required expense fields');
      }

      // Common expense data structure
      const expenseData: NewExpenseInput = {
        amount: formData.amount,
        description: formData.description ?? null,
        category_id: formData.category_id,
        date: formData.date,
        user_id: formData.user_id
      };

      if (mode === 'add') {
        // This will trigger the onInsert handler in the collection
        // Create a temporary expense with a dummy ID that will be replaced by the server
        const tempExpense: Expense = {
          ...expenseData,
          id: -1 // Temporary ID, will be replaced by the server
        };
        await expensesCollection.insert(tempExpense);
      } else if (mode === 'edit') {
        if (!formData.id) {
          throw new Error('Expense ID is required for update');
        }
        // This will trigger the onUpdate handler in the collection
        await expensesCollection.update(formData.id, (draft: Expense) => {
          Object.assign(draft, expenseData);
        });
      }
      
      handleSuccess();
    } catch (error) {
      handleError(error);
      throw error; // Re-throw to allow form to handle the error
    }
  };

  return (
    <ExpensesForm 
      isEditing={mode === 'edit'}
      onSubmit={handleSubmit}
    />
  );
}

export default ExpenseFormWrapper;
