import { createCollection } from '@tanstack/react-db';
import { queryCollectionOptions } from '@tanstack/query-db-collection';
import { ExpenseService } from '../../services/expenses/expense.service';
import { queryClient } from '../queryClient';
import type { Expense, NewExpenseInput } from '../../types/models';

// Create a simple collection without schema validation
export const expensesCollection = createCollection<Expense>(
  queryCollectionOptions<Expense>({
    queryKey: ['expenses'],
    queryClient,
    getKey: (expense: Expense) => expense.id.toString(),
    queryFn: async () => await ExpenseService.index(),
    
    onInsert: async ({ transaction }) => {
      const { changes } = transaction.mutations[0];
      // Validate that all required fields are present
      if (changes.amount === undefined || 
          changes.category_id === undefined || 
          changes.date === undefined || 
          changes.user_id === undefined) {
        throw new Error('Missing required fields for expense creation');
      }
      
      // Create a new expense without an ID
      const newExpense: NewExpenseInput = {
        amount: changes.amount,
        description: changes.description ?? null,
        category_id: changes.category_id,
        date: changes.date,
        user_id: changes.user_id
      };
      
      const createdExpense = await ExpenseService.create(newExpense);
      
      // Update the query cache directly
      queryClient.setQueryData<Expense[]>(['expenses'], (oldData = []) => {
        return [...oldData, createdExpense];
      });
      
      return { refetch: false, data: createdExpense };
    },
    
    onUpdate: async ({ transaction }) => {
      const { key: id, changes } = transaction.mutations[0];
      // Validate that all required fields are present
      if (changes.id === undefined ||
          changes.amount === undefined || 
          changes.category_id === undefined || 
          changes.date === undefined || 
          changes.user_id === undefined) {
        throw new Error('Missing required fields for expense update');
      }
      
      const expenseUpdate: Expense = {
        id: parseInt(id, 10),
        amount: changes.amount,
        description: changes.description ?? null,
        category_id: changes.category_id,
        date: changes.date,
        user_id: changes.user_id
      };
  
      const updatedExpense = await ExpenseService.update(expenseUpdate.id, expenseUpdate);
      
      // Update the query cache directly
      queryClient.setQueryData<Expense[]>(['expenses'], (oldData = []) => {
        return oldData.map(expense => 
          expense.id === updatedExpense.id ? updatedExpense : expense
        );
      });
      
      return { refetch: false, data: updatedExpense };
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

