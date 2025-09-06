import { client } from "../http/client";
import type { Expense, NewExpenseInput } from "../../types/models";

export const getExpenses = async (dateRange?: { startDate?: Date; endDate?: Date }): Promise<Expense[]> => {
    const params = new URLSearchParams();
    
    if (dateRange?.startDate) {
        // Send only the date part (YYYY-MM-DD)
        const dateStr = dateRange.startDate.toISOString().split('T')[0];
        params.append('start_date', dateStr);
    }
    if (dateRange?.endDate) {
        // Send only the date part (YYYY-MM-DD)
        const dateStr = dateRange.endDate.toISOString().split('T')[0];
        params.append('end_date', dateStr);
    }
    
    const response = await client.get(`/expenses?${params.toString()}`);
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