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

export const updateExpenseCollection = async (startDate: string, endDate: string) => {
  try {
    // Fetch expenses for the given date range
    const newExpenses = await ExpenseService.index({ startDate, endDate });
    
    // Get current data from the query cache
    const currentData = queryClient.getQueryData<Expense[]>(['expenses']) || [];
    
    // Create a map to avoid duplicates (in case of overlapping date ranges)
    const expenseMap = new Map<string, Expense>();
    
    // Add existing expenses to the map
    currentData.forEach(expense => {
      expenseMap.set(expense.id.toString(), expense);
    });
    
    // Add or update with new expenses
    newExpenses.forEach(expense => {
      expenseMap.set(expense.id.toString(), expense);
    });
    
    // Convert back to array and update the cache
    const updatedExpenses = Array.from(expenseMap.values());
    queryClient.setQueryData(['expenses'], updatedExpenses);
    
    return updatedExpenses;
  } catch (error) {
    console.error('Error updating expense collection:', error);
    throw error;
  }
};

