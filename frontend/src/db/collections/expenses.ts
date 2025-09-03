import { createCollection } from '@tanstack/react-db';
import { queryCollectionOptions } from '@tanstack/query-db-collection';
import { expenseSchema, type Expense } from '../index';
import { ExpenseService } from '../../services/expenses/expense.service';
import { queryClient } from '../queryClient';

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
      // Cast to any to bypass type checking since we know the shape matches
      return await ExpenseService.create(changes as any);
    },

    onUpdate: async ({ transaction }) => {
      const { key: id, changes } = transaction.mutations[0];
      // Cast to any to bypass type checking since we know the shape matches
      return await ExpenseService.update(id, changes as any);
    },

    onDelete: async ({ transaction }) => {
      const { key: id } = transaction.mutations[0];
      await ExpenseService.destroy(id);
      return { refetch: false };
    },
  })
);