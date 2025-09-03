import { z } from 'zod';
import { categorySchema, expenseSchema } from '../db/schema';

export type Category = z.infer<typeof categorySchema>;
export type NewCategoryInput = Omit<Category, 'id'>;
export type Expense = z.infer<typeof expenseSchema>;
export type NewExpenseInput = Omit<Expense, 'id'>

export interface ExpenseWithCategory extends Omit<Expense, 'category_id'> {
  category: Category | null;
}
