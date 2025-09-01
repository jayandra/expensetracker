import { createDatabase } from '@tanstack/db'
import { z } from 'zod'

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  parent_id: z.number().nullable(),
  user_id: z.number(),
  position: z.number().nullable()
});

export const expenseSchema = z.object({
  id: z.number(),
  amount: z.number(),
  description: z.string().nullable(),
  category_id: z.number(),
  date: z.string().datetime(),
  user_id: z.number()
});

// export const db = createDatabase({
//   version: 1,
//   name: 'expense-tracker-db',
//   schema: {
//     categories: {
//       primaryKey: 'id',
//       schema: categorySchema,
//       indexes: [
//         { name: 'user_id', keyPath: 'user_id', unique: false },
//         { name: 'parent_id', keyPath: 'parent_id', unique: false }
//       ]
//     },
//     expenses: {
//       keyPath: 'id',
//       schema: expenseSchema,
//       indexes: [
//         { name: 'user_id', keyPath: 'user_id', unique: false },
//         { name: 'category_id', keyPath: 'category_id', unique: false },
//         { name: 'date', keyPath: 'date', unique: false }
//       ]
//     }
//   }
// });
