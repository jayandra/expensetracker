import type { Expense } from '../../types/models';
import { getExpenses, getExpense, createExpense, updateExpense, deleteExpense } from '../../api/endpoints/expenses';

export const ExpenseService = {
    index: getExpenses,
    show: (id: number) => getExpense(id),
    create: (expense: Expense) => createExpense(expense),
    update: (id: number, expense: Expense) => updateExpense(id, expense),
    destroy: (id: number) => deleteExpense(id)
} as const;
    