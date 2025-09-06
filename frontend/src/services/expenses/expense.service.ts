import type { Expense, NewExpenseInput } from '../../types/models';
import { getExpenses, getExpense, createExpense, updateExpense, deleteExpense } from '../../api/endpoints/expenses';

type DateRange = {
  startDate?: Date;
  endDate?: Date;
};

export const ExpenseService = {
    index: (dateRange?: DateRange) => {
      const params = dateRange ? {
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined
      } : undefined;
      return getExpenses(params);
    },
    show: (id: number) => getExpense(id),
    create: (newexpense: NewExpenseInput) => createExpense(newexpense),
    update: (id: number, expense: Partial<Expense>) => updateExpense(id, expense),
    destroy: (id: number) => deleteExpense(id)
} as const;
    