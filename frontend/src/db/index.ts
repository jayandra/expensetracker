// Export database instance and schemas
export { categorySchema, expenseSchema } from './schema';

// Export collections
export * from './collections/categories';
export * from './collections/expenses';

// Export types
export type { Category, NewCategoryInput, Expense } from '../types/models';

// Transaction types
export type TransactionMutation<T> = {
  key: number;
  changes: T;
};

export type Transaction<T> = {
  mutations: Array<TransactionMutation<T>>;
};
