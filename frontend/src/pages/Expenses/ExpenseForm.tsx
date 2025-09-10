import { useState, useMemo } from 'react';
import FormInput from '../../components/Form/FormInput';
import Button from '../../components/Form/Button';
import WrapperTile from '../../components/WrapperTile';
import Layout from '../Layout';
import { useAuth } from '../../contexts/AuthContext';
import { emitError } from '../../services/errorBus';
import { useLiveQuery } from '@tanstack/react-db';
import { categoriesCollection, buildCategoryOptions } from '../../db';
import type { NewExpenseInput, Expense } from '../../types/models';

interface ExpenseFormProps {
  initialExpense: NewExpenseInput | Expense;
  onSubmit: (expense: NewExpenseInput) => void;
  isEditing?: boolean;
  header: React.ReactNode;
  submitButtonText: string;
}

export const ExpenseForm = ({
  initialExpense,
  onSubmit,
  header,
  submitButtonText
}: ExpenseFormProps) => {
  const { user } = useAuth();
  const [isCategoryFocused, setIsCategoryFocused] = useState(false);
  const [expense, setExpense] = useState(initialExpense);
  
  const { data: categories = [] } = useLiveQuery(
    (q) => q.from({ categories: categoriesCollection }).select(({categories}) => ({...categories})),
    []
  );

  const categoryOptions = useMemo(() => {
    if (isCategoryFocused) {
      return buildCategoryOptions(categories);
    }
    return categories.map(cat => ({
      value: cat.id,
      label: cat.name
    }));
  }, [categories, isCategoryFocused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      emitError({ message: 'Please log in to manage expenses' });
      return;
    }
    onSubmit(expense);
  };

  return (
    <Layout header={header}>
      <WrapperTile>
        <form onSubmit={handleSubmit} className="w-full">
          <FormInput
            label=""
            name="amount"
            type="number"
            required
            placeholder="Amount"
            value={expense.amount}
            onFocus={(e) => e.target.value = ''}
            onChange={(e) => setExpense({ ...expense, amount: Number(e.target.value) })}
          />
          <FormInput
            label=""
            name="description"
            type="text"
            placeholder="Description"
            value={expense.description || ''}
            onChange={(e) => setExpense({ ...expense, description: e.target.value })}
          />
          <FormInput
            label=""
            name="date"
            type="date"
            required
            placeholder="Date"
            value={expense.date}
            onChange={(e) => setExpense({ ...expense, date: e.target.value })}
          />
          <FormInput
            label=""
            name="category_id"
            type="select"
            required
            placeholder="Select a Category"
            value={expense.category_id}
            options={categoryOptions}
            onFocus={() => setIsCategoryFocused(true)}
            onClick={() => setIsCategoryFocused(true)}
            onBlur={() => setTimeout(() => setIsCategoryFocused(false), 20)}
            onChange={(e) => {
              const selectedId = Number(e.target.value);
              setExpense({ ...expense, category_id: selectedId });
            }}
          />
          <div className="flex justify-end mt-4">
            <Button type="submit">
              {submitButtonText}
            </Button>
          </div>
        </form>
      </WrapperTile>
    </Layout>
  );
};

export default ExpenseForm;
