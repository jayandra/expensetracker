import type { Expense, NewExpenseInput } from '../../types/models';
import { getExpenses, getExpense, createExpense, updateExpense, deleteExpense } from '../../api/endpoints/expenses';

export const ExpenseService = {
    index: getExpenses,
    show: (id: number) => getExpense(id),
    create: (newexpense: NewExpenseInput) => createExpense(newexpense),
    update: (id: number, expense: Partial<Expense>) => updateExpense(id, expense),
    destroy: (id: number) => deleteExpense(id)
} as const;
    