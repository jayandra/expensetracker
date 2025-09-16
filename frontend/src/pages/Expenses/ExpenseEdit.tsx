import { useEffect } from 'react';
import { ExpenseForm } from './ExpenseForm';
import type { Expense, NewExpenseInput } from '../../types/models';
import { useNavigate, useParams } from 'react-router-dom';
import { emitError } from '../../services/errorBus';
import { expensesCollection } from '../../db';
import { useLiveQuery, eq } from '@tanstack/react-db';
import {useAuth} from '../../contexts/AuthContext';

export const ExpenseEdit = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: expenses } = useLiveQuery((q) =>
    q.from({ e: expensesCollection })
      .where(({ e }) => eq(e.id, parseInt(id || '0')))
      .select(({ e }) => ({ ...e }))
  );
  const expense = expenses?.[0];

  useEffect(() => {
    if (id && expenses && expenses.length === 0) {
      emitError('Expense not found');
      navigate('/react/expenses');
    }
  }, [expenses, id, expense]);

  const handleSubmit = async (formData: NewExpenseInput) => {
    if(user?.demo_user){
      emitError({message: 'Test accounts do not have permission to perform this action.'});
      return;
    }

    try {
      if (!expense?.id) {
        throw new Error('Expense ID is required for update');
      }

      if (!formData.amount || !formData.date || !formData.category_id) {
        throw new Error('Missing required expense fields');
      }

      // Use the update method with the draft callback
      await expensesCollection.update(expense.id.toString(), (draft: Expense) => {
        draft.amount = formData.amount;
        draft.description = formData.description;
        draft.date = formData.date;
        draft.category_id = formData.category_id;
      });
      
      navigate('/react/expenses');
    } catch (error) {
      emitError(error);
      throw error;
    }
  };
  const header = (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h1 className="text-2xl font-bold text-neutral-900">
        Edit Expense
      </h1>
    </div>
  );

  // Format the date before passing to ExpenseForm, using the local date string to avoid timezone issues
  const formattedExpense = {
    ...expense,
    date: new Date(expense.date).toISOString().split('T')[0]
  }

  return (
    <ExpenseForm
      initialExpense={formattedExpense}
      onSubmit={handleSubmit}
      header={header}
      submitButtonText="Update Expense"
    />
  );
};

export default ExpenseEdit;
