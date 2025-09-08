import {useState} from 'react';
import FormInput from '../../components/Form/FormInput';
import Button from '../../components/Form/Button';
import { formatDate } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import { emitError } from '../../services/errorBus';
import { useLiveQuery } from '@tanstack/react-db';
import { categoriesCollection } from '../../db';
import WrapperTile from '../../components/WrapperTile';
import Layout from '../Layout';

import type { Expense, NewExpenseInput } from '../../types/models';

interface ExpensesFormProps {
    initialExpense?: Expense;
    onSubmit: (expense: NewExpenseInput) => void;
    isEditing?: boolean;
}

export const ExpensesForm = ({ initialExpense, onSubmit, isEditing = false }: ExpensesFormProps) => {
    const { user } = useAuth();
    if (!user) {
        emitError({ message: 'Please log in to manage expenses' });
        return <div></div>;
    }

    const { data: categories } = useLiveQuery(
        (q) => q.from({ categories: categoriesCollection }).select(({categories}) => ({...categories})),
        []
    );

    const defaultExpense: NewExpenseInput = {
        amount: 0,
        description: '',
        date: formatDate(new Date()),
        user_id: user.id,
        category_id: 0,
    };

    const [expense, setExpense] = useState(initialExpense || defaultExpense);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(expense);
    };

    const header = (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-neutral-900">
                {isEditing ? 'Edit Expense' : 'Add New Expense'}
            </h1>
        </div>
    );

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
                    options={categories?.map(cat => ({ value: cat.id, label: cat.name }))}
                    onChange={(e) => setExpense({ ...expense, category_id: Number(e.target.value) })}
                />
                <div className="flex justify-end mt-4">
                    <Button type="submit">
                        {isEditing ? 'Update Expense' : 'Add Expense'}
                    </Button>
                </div>
            </form>
        </WrapperTile>
        </Layout>
      );
};