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