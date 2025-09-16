import { createCollection } from '@tanstack/react-db';
import { queryCollectionOptions } from '@tanstack/query-db-collection';
import { ExpenseService } from '../../services/expenses/expense.service';
import { queryClient } from '../queryClient';
import type { Expense, NewExpenseInput } from '../../types/models';
import { expenseSchema } from '../schema';

// Create a collection with schema validation
export const expensesCollection = createCollection<Expense>(
  queryCollectionOptions({
    queryKey: ['expenses'],
    queryClient,
    getKey: (expense: Expense) => expense.id.toString(),
    schema: expenseSchema,
    queryFn: async () => {
      const expenses = await ExpenseService.index();
      return expenses;
    },
    
    onInsert: async ({ transaction }) => {
      const { changes } = transaction.mutations[0];
      const newExpense = changes as NewExpenseInput;
      const createdExpense = await ExpenseService.create(newExpense);
      
      // Update the query cache
      queryClient.setQueryData<Expense[]>(['expenses'], (oldData = []) => {
        return [...oldData, createdExpense];
      });
      
      return { refetch: false, data: createdExpense };
    },
    
    onUpdate: async ({ transaction }) => {
      const { key: id, changes } = transaction.mutations[0];

      const expenseId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(expenseId)) {
        throw new Error(`Invalid expense ID: ${id}`);
      }
      
      // Get the current expense to ensure we have all required fields
      const currentExpenses = queryClient.getQueryData<Expense[]>(['expenses']) || [];
      const currentExpense = currentExpenses.find(e => e.id === expenseId);
      
      if (!currentExpense) {
        throw new Error(`Expense with id ${expenseId} not found`);
      }
      
      // Merge changes with current expense and validate
      const expenseUpdate = {
        ...currentExpense,
        ...changes,
        id: expenseId // Ensure ID is preserved as a number
      };
      
      const updatedExpense = await ExpenseService.update(expenseId, expenseUpdate);
      
      // Update the query cache
      queryClient.setQueryData<Expense[]>(['expenses'], (oldData = []) => {
        return oldData.map(expense => 
          expense.id === updatedExpense.id ? updatedExpense : expense
        );
      });
      
      return { refetch: false, data: updatedExpense };
    },
    
    onDelete: async ({ transaction }) => {
      const { key: id } = transaction.mutations[0];
      
      const expenseId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(expenseId)) {
        throw new Error(`Invalid expense ID: ${id}`);
      }
      
      await ExpenseService.destroy(expenseId);
      
      // Update the query cache
      queryClient.setQueryData<Expense[]>(['expenses'], (oldData = []) => {
        return oldData.filter(expense => expense.id !== expenseId);
      });
      
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

