import type { Expense, NewExpenseInput } from '../../types/models';
import { getExpenses, getExpense, createExpense, updateExpense, deleteExpense } from '../../api/endpoints/expenses';

type DateRange = {
  startDate?: string;
  endDate?: string;
};

export const ExpenseService = {
    index: (dateRange?: DateRange) => {
      const params = dateRange ? {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      } : undefined;
      return getExpenses(params);
    },
    show: (id: number) => getExpense(id),
    create: (expense: NewExpenseInput) => createExpense(expense),
    update: (id: number, expense: Expense) => updateExpense(id, { ...expense, id }),
    destroy: (id: number) => deleteExpense(id)
} as const;
    