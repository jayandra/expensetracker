import { 
  createCollection, 
  queryCollectionOptions, 
  type CollectionInsertInfo, 
  type CollectionUpdateInfo, 
  type CollectionDeleteInfo 
} from '@tanstack/react-db';
import { expenseSchema, type Expense } from '../index';
import { ExpenseService } from '../../services/expenses/expense.service';

export const expensesCollection = createCollection<Expense>(
  queryCollectionOptions({
    name: 'expenses',
    schema: expenseSchema,
    queryKey: ['expenses'],
    queryFn: async () => {
      return await ExpenseService.index();
    },
    getKey: (expense: Expense) => expense.id,
    onInsert: async ({ transaction }: CollectionInsertInfo<Expense>) => {
      const { changes: newExpense } = transaction.mutations[0];
      return await ExpenseService.create(newExpense);
    },
    onUpdate: async ({ transaction }: CollectionUpdateInfo<Expense>) => {
      const { key: id, changes } = transaction.mutations[0];
      return await ExpenseService.update(id, changes);
    },
    onDelete: async ({ transaction }: CollectionDeleteInfo<Expense>) => {
      const { key: id } = transaction.mutations[0];
      await ExpenseService.destroy(id);
      return { success: true };
    },
  })
);