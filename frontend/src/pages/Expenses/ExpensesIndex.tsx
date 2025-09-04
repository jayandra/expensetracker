import { useState, useMemo, useCallback } from 'react';
import { useLiveQuery } from '@tanstack/react-db';
import { and, gte, lte, eq } from '@tanstack/db';
import { format, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';

import Layout from '../Layout';
import { ExpenseItem } from './ExpenseItem';
import { expensesCollection, categoriesCollection } from '../../db';
import type { ExpenseWithCategory } from '../../types/models';
import WrapperTile from '../../components/WrapperTile';

const ExpensesIndex = () => {
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  });

  const {
    data: filteredExpenses = [],
    isLoading,
    isError
  } = useLiveQuery(
    (q) => {
      const query = q
        .from({ expenses: expensesCollection })
        .join(
          { categories: categoriesCollection },
          ({ expenses, categories }) => eq(expenses.category_id, categories.id),
          'inner'
        )
        .where(({ expenses }) =>
          and(
            gte(expenses.date, dateRange.startDate.toISOString()),
            lte(expenses.date, dateRange.endDate.toISOString())
          )
        )
        .orderBy(({ expenses }) => [expenses.date, 'desc']);

      return query.select(({ expenses, categories }) => ({
        ...expenses,
        category: categories
      }));
    },
    [dateRange.startDate.toISOString(), dateRange.endDate.toISOString()]
  );

  const totalExpenses = useMemo(
    () =>
      filteredExpenses
        .reduce((sum, expense) => sum + Math.abs(expense.amount), 0)
        .toFixed(2),
    [filteredExpenses]
  );

  const handleDateChange = (type: 'start' | 'end', e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (isNaN(date.getTime())) return;
    
    setDateRange(prev => ({
      startDate: type === 'start' ? date : prev.startDate,
      endDate: type === 'end' ? date : prev.endDate,
    }));
  };
  
  // Format date to YYYY-MM-DD for input fields
  const formatForInput = (date: Date) => date.toISOString().split('T')[0];

  if (isError) {
    throw new Error('Failed to load expenses. Please try again later.');
  }

  const header = (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h1 className="text-2xl font-bold text-neutral-900">Expenses</h1>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <div className="relative flex-1">
          <input
            type="date"
            value={formatForInput(dateRange.startDate)}
            onChange={(e) => handleDateChange('start', e)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div className="relative flex-1">
          <input
            type="date"
            value={formatForInput(dateRange.endDate)}
            onChange={(e) => handleDateChange('end', e)}
            min={formatForInput(dateRange.startDate)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>
    </div>
  );

  return (
    <Layout header={header}>
      <WrapperTile>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-sm">Total Expense</p>
              <p className="text-2xl font-bold">$ {totalExpenses}</p>
            </div>
            <div className="text-sm text-gray-500">
              {filteredExpenses.length} transactions
            </div>
          </div>
        </div>
      </WrapperTile>

      <WrapperTile>
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredExpenses.length > 0 ? (
            filteredExpenses.map((expense: ExpenseWithCategory) => (
              <ExpenseItem key={expense.id} {...expense} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No expenses found for the selected period
            </div>
          )}
        </div>
      </WrapperTile>
    </Layout>
  );
};

export default ExpensesIndex;
