import { createCollection } from '@tanstack/react-db';
import { queryCollectionOptions } from '@tanstack/query-db-collection';
import { expenseSchema, type Expense } from '../index';
import { ExpenseService } from '../../services/expenses/expense.service';
import { queryClient } from '../queryClient';
import type { NewExpenseInput } from '../../types/models';

export const expensesCollection = createCollection<Expense>(
  queryCollectionOptions({
    queryKey: ['expenses'],
    queryClient,
    getKey: (expense: Expense) => expense.id.toString(),
    schema: expenseSchema,

    queryFn: async () => {
      return await ExpenseService.index();
    },

    onInsert: async ({ transaction }) => {
      const { changes } = transaction.mutations[0];
      const newExpense = changes as NewExpenseInput
      return await ExpenseService.create(newExpense);
    },

    onUpdate: async ({ transaction }) => {
      const { key: id, changes } = transaction.mutations[0];
      return await ExpenseService.update(id, changes);
    },

    onDelete: async ({ transaction }) => {
      const { key: id } = transaction.mutations[0];
      await ExpenseService.destroy(id);
      return { refetch: false };
    },
  })
);