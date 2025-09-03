import { client } from "../http/client";
import type { Expense, NewExpenseInput } from "../../types/models";

export const getExpenses = async (): Promise<Expense[]> => {
    const response = await client.get('/expenses');
    return response.data;
};

export const getExpense = async (id: number): Promise<Expense> => {
    const response = await client.get(`/expenses/${id}`);
    return response.data;
};

export const createExpense = async (expense: NewExpenseInput): Promise<Expense> => {
    const response = await client.post('/expenses', expense);
    return response.data;
};

export const updateExpense = async (id: number, expense: Expense): Promise<Expense> => {
    const response = await client.put(`/expenses/${id}`, expense);
    return response.data;
};

export const deleteExpense = async (id: number): Promise<void> => {
    await client.delete(`/expenses/${id}`);
};